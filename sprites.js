// Monta o quadro de qualquer módulo de personagem: escolhe a direção (com queda para lado/frente), aplica a variação de cor e guarda em cache.
export class Sprites {
  constructor(mod) { this.m = mod; this.cache = new Map(); }
  rows(clip, dir) {
    const f = this.m.clips[clip].frames;
    if (f[dir]) return [f[dir], false];
    return [f.right ?? f.down, dir === 'left' && !!f.right];   // esquerda = espelho exato da direita (largura do quadro é ímpar)
  }
  get(look, dir, clip, i) {
    const v = look?.variant ?? 'padrao', k = `${v}|${dir}|${clip}|${i}`;
    if (!this.cache.has(k)) this.cache.set(k, this.bake(v, dir, clip, i));
    return this.cache.get(k);
  }
  bake(v, dir, clip, i) {
    const [fr, flip] = this.rows(clip, dir), rows = fr[Math.min(i, fr.length - 1)], [cw, ch] = this.m.cell, pal = { ...this.m.palette, ...this.m.variants[v] };
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const x = c.getContext('2d'), img = x.createImageData(cw, ch);
    rows.forEach((r, j) => {
      for (let k = 0; k < cw; k++) {
        if (r[k] === '.') continue;
        const col = pal[r[k]]; if (!col) throw new Error(`${clip}.${dir}[${i}]: cor '${r[k]}' fora da paleta`);
        img.data.set([...col, 255], (j * cw + (flip ? cw - 1 - k : k)) * 4);
      }
    });
    x.putImageData(img, 0, 0); return c;
  }
}
