# Copia os quadros de animação do anexo (idle, caminhada, ataque, dano) e as variações de cor. Não redesenha: recorta, tira o fundo,
# iguala a escala POR LINHA (a ficha mistura escalas), alinha os pés e reduz tudo a uma paleta única. Uso: python3 tools/extract-anim.py anexo.jpeg
import sys, json, colorsys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
A = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float); T = 28; H0 = 34
ROWS = {  # (x, y, w, h) de cada figura no anexo, em ordem de animação
  'idle': [(71,47,19,35),(102,47,19,35),(134,47,20,34),(166,46,20,36),(197,46,21,36),(228,47,20,34),(257,48,22,33),(289,50,21,31),(319,50,19,31)],
  'walk': [(123,93,25,46),(161,94,25,44),(196,95,25,43),(230,93,22,44)],
  'attack': [(266,109,42,28),(320,111,38,26)],
  'hurt': [(109,154,29,41),(151,155,23,40),(190,156,23,39),(226,151,26,44),(269,158,24,37),(305,158,22,37),(336,157,21,37)]}
VAR = {'capuz': (45,230,40,72), 'ruivo': (101,228,40,74), 'carmesim': (161,229,42,73), 'cinza': (222,229,42,73), 'branco': (280,229,39,73)}
def cut(b, pad=1):
    x, y, w, h = b; sub = A[max(0, y - pad):y + h + pad, max(0, x - pad):x + w + pad]
    bgl = np.median(np.concatenate([sub[0], sub[-1], sub[:, 0], sub[:, -1]]), axis=0)
    mi = Image.fromarray(((np.abs(sub - bgl).max(axis=2) > T) * 255).astype('uint8')).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    ff = mi.copy(); ImageDraw.floodfill(ff, (0, 0), 128); fig = np.asarray(ff) != 128; ys, xs = np.where(fig)
    return fig[ys.min():ys.max() + 1, xs.min():xs.max() + 1], sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
rs = lambda a, size: np.asarray(Image.fromarray(a.astype('float32'), 'F').resize(size, Image.BOX))
def scale(f, rgb, s):
    h, w = f.shape; nw, nh = max(1, round(w * s)), max(1, round(h * s)); ff = f.astype(float); M = rs(ff, (nw, nh))
    C = [rs(rgb[..., k] * ff, (nw, nh)) for k in range(3)]
    return np.stack([np.where(M >= .5, c / np.maximum(M, 1e-6), -1.0) for c in C], axis=2)
raw = {k: [cut(b) for b in v] for k, v in ROWS.items()}
sc = {k: H0 / np.median([f.shape[0] for f, _ in raw[k]]) for k in ('idle', 'walk', 'hurt')}; sc['attack'] = sc['walk']
fr = {k: [scale(f, r, sc[k]) for f, r in v] for k, v in raw.items()}
fr['attack'] = [a[:, ::-1] for a in fr['attack']]   # na ficha o ataque olha para a esquerda; padronizo tudo de lado para a direita
com = lambda a: int(round(np.nonzero(a[..., 0] >= 0)[1].mean()))
cx = {k: [com(a) for a in v] for k, v in fr.items()}
hw = max(max(c, a.shape[1] - 1 - c) for k in fr for a, c in zip(fr[k], cx[k])); CW = 2 * hw + 1   # largura ímpar: espelho exato
CH = max(a.shape[0] for v in fr.values() for a in v)
def place(a, c):
    o = np.full((CH, CW, 3), -1.0); h, w = a.shape[:2]; o[CH - h:, hw - c:hw - c + w] = a; return o
cells = {k: [place(a, c) for a, c in zip(fr[k], cx[k])] for k in fr}
px = np.concatenate([a[a[..., 0] >= 0] for v in cells.values() for a in v])
q = Image.fromarray(px.reshape(1, -1, 3).astype('uint8')).quantize(colors=44, method=Image.Quantize.MEDIANCUT)
P = np.array(q.getpalette()[:132]).reshape(-1, 3).astype(float); chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
idxs = lambda a: np.argmin(((a[:, :, None, :] - P[None, None]) ** 2).sum(3), axis=2)
enc = lambda a: [''.join('.' if a[j, i, 0] < 0 else chars[idxs(a)[j, i]] for i in range(CW)) for j in range(CH)]
clips = {'idle': {'down': [enc(a) for a in cells['idle']]}, 'walk': {'right': [enc(a) for a in cells['walk']]},
         'attack': {'right': [enc(a) for a in cells['attack']]}, 'hurt': {'down': [enc(a) for a in cells['hurt']]}}
# Variações: troca só as cores de cabelo e roupa, preservando o padrão de luz da base (pele e contornos ficam).
isskin = lambda c: 0.02 <= colorsys.rgb_to_hsv(*[x / 255 for x in c])[0] <= 0.12 and 0.2 <= colorsys.rgb_to_hsv(*[x / 255 for x in c])[1] <= 0.8 and max(c) >= 102
L = lambda c: 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
tally = {}
for a in cells['idle']:
    rr = np.nonzero((a[..., 0] >= 0).any(axis=1))[0]; top, hf = rr.min(), rr.max() - rr.min() + 1; ix = idxs(a)
    for j, i in zip(*np.nonzero(a[..., 0] >= 0)): tally.setdefault(int(ix[j, i]), [0, 0])[0 if j - top < .24 * hf else 1] += 1
group = {c: ('skin' if isskin(P[c]) else 'hair' if t[0] > t[1] else 'keep' if L(P[c]) < 24 else 'outfit') for c, t in tally.items()}
lm = {g: sum(L(P[c]) * sum(tally[c]) for c in group if group[c] == g) / max(1, sum(sum(tally[c]) for c in group if group[c] == g)) for g in ('hair', 'outfit')}
def targets(b):
    fg, rgb = cut(b); h = fg.shape[0]
    def mean(r0, r1, lo):
        p = [p for p in rgb[int(r0 * h):int(r1 * h)][fg[int(r0 * h):int(r1 * h)]] if not isskin(p) and L(p) >= lo]
        return np.mean(p, axis=0) if p else None
    return mean(0, .24, 20), mean(.38, .85, 24)
variants = {'padrao': {}}
for name, b in VAR.items():
    th, to = targets(b); d = {}
    for c, g in group.items():
        t = th if g == 'hair' else to if g == 'outfit' else None
        if t is not None: r = min(2.2, max(.35, L(P[c]) / max(lm[g], 1))); d[chars[c]] = [int(min(255, max(0, v * r))) for v in t]
    variants[name] = d
pal = {chars[i]: [int(v) for v in P[i]] for i in range(len(P))}
open('assets/characters/hero/frames.js', 'w').write('// Quadros copiados do anexo (um por figura), gerados por tools/extract-anim.py\nexport const size = ' + json.dumps([CW, CH]) + ';\nexport const palette = ' + json.dumps(pal) + ';\nexport const variants = ' + json.dumps(variants) + ';\nexport const clips = ' + json.dumps(clips, indent=0) + ';\n')
def img(rows, p):
    im = Image.new('RGBA', (CW, CH))
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != '.': im.putpixel((i, j), tuple(p[ch]) + (255,))
    return im.resize((CW * 3, CH * 3), Image.NEAREST)
lines = [clips['idle']['down'], clips['walk']['right'], clips['attack']['right'], clips['hurt']['down']]
sheet = Image.new('RGB', (9 * CW * 3 + 40, 5 * CH * 3 + 20), (21, 25, 34))
for r, fl in enumerate(lines):
    for k, f in enumerate(fl): s = img(f, pal); sheet.paste(s, (k * (CW * 3 + 4), r * (CH * 3 + 4)), s)
for k, (n, d) in enumerate(variants.items()): s = img(clips['idle']['down'][0], {**pal, **d}); sheet.paste(s, (k * (CW * 3 + 4), 4 * (CH * 3 + 4)), s)
sheet.save('/home/claude/preview.png'); print('ok', CW, CH, {k: len(v) for k, v in clips.items()}, list(variants))
