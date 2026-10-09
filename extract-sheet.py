# Copia LITERALMENTE os pixels das 4 vistas (frente, lado direito, costas, lado esquerdo) da ficha de referência.
# Sem reamostragem: só remove o fundo (máscara) e reduz as cores a uma paleta única (tira o ruído do JPEG). Uso: python3 tools/extract-sheet.py ficha.jpeg
import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
SRC = sys.argv[1]
im = Image.open(SRC).convert('RGB'); W, H = im.size; A = np.asarray(im).astype(float)
x0, x1 = int(.70 * W), int(.875 * W)
reg = A[:, x0:x1]; bg = np.median(reg.reshape(-1, 3), axis=0)
T = 26; mask = np.abs(reg - bg).max(axis=2) > T
rows = np.where(mask.sum(1) >= 2)[0]; bands = []; s = p = rows[0]
for r in rows[1:]:
    if r - p > 6: bands.append((s, p)); s = r
    p = r
bands.append((s, p)); bands = [b for b in bands if b[1] - b[0] >= 40]
assert len(bands) == 4, bands
names = ['down', 'right', 'up', 'left']; raw = {}; crops = {}
for n, (y0, y1) in zip(names, bands):
    cols = np.where(mask[y0:y1 + 1].sum(0) >= 1)[0]
    Y0, Y1, X0, X1 = max(0, y0 - 3), min(H - 1, y1 + 3), x0 + cols.min() - 3, x0 + cols.max() + 4
    crops[n] = im.crop((X0, Y0, X1, Y1))
    sub = A[Y0:Y1 + 1, X0:X1]; m = np.abs(sub - bg).max(axis=2) > T
    mi = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    ff = mi.copy(); ImageDraw.floodfill(ff, (0, 0), 128)
    fig = np.asarray(ff) != 128; ys, xs = np.where(fig)
    raw[n] = (fig[ys.min():ys.max() + 1, xs.min():xs.max() + 1], sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
VW = max(f.shape[1] for f, _ in raw.values()); VH = max(f.shape[0] for f, _ in raw.values())
V = {}
for n, (f, rgb) in raw.items():
    h, w = f.shape; o = np.full((VH, VW, 3), -1.0); ox, oy = (VW - w) // 2, VH - h
    blk = o[oy:oy + h, ox:ox + w]; blk[f] = rgb[f]; V[n] = o
px = np.concatenate([v[v[..., 0] >= 0] for v in V.values()])
q = Image.fromarray(px.reshape(1, -1, 3).astype('uint8')).quantize(colors=40, method=Image.Quantize.MEDIANCUT)
P = np.array(q.getpalette()[:120]).reshape(-1, 3); chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
views = {}
for n, v in V.items():
    idx = np.argmin(((v[:, :, None, :] - P[None, None]) ** 2).sum(3), axis=2)
    views[n] = [''.join('.' if v[j, i, 0] < 0 else chars[idx[j, i]] for i in range(VW)) for j in range(VH)]
pal = {chars[i]: [int(c) for c in P[i]] for i in range(len(P))}
open('assets/characters/hero/ficha.js', 'w').write('// Cópia literal dos pixels da ficha de referência (vistas já sem fundo), gerada por tools/extract-sheet.py\nexport const size = ' + json.dumps([VW, VH]) + ';\nexport const palette = ' + json.dumps(pal) + ';\nexport const views = ' + json.dumps(views, ensure_ascii=False, indent=1) + ';\n')
tile = Image.new('RGB', (4 * 2 * VW + 40, 2 * VH + 8), tuple(int(c) for c in bg))
for k, n in enumerate(names):
    tile.paste(crops[n].resize((crops[n].width * 2, crops[n].height * 2), Image.NEAREST), (k * 2 * VW * 2 // 1 // 2 * 1 + k * 10, 4))
    sp = Image.new('RGBA', (VW, VH), (0, 0, 0, 0))
    for j, r in enumerate(views[n]):
        for i, ch in enumerate(r):
            if ch != '.': sp.putpixel((i, j), tuple(pal[ch]) + (255,))
    sp = sp.resize((VW * 2, VH * 2), Image.NEAREST); tile.paste(sp, (k * 2 * VW + k * 10 + (0 if False else 0), 4), sp)
tile.save('/home/claude/preview.png'); print('ok', (VW, VH), len(pal), 'cores')
