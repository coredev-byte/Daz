// AssetRegistry: a arte é pedida por ID. Pixmaps indexados são validados e compilados uma única vez.
export class Assets {
  constructor(palette) { this.pal = palette; this.defs = new Map(); this.items = new Map(); this.bundles = new Map(); }
  define(id, bundle, def) { this.defs.set(id, def); if (!this.bundles.has(bundle)) this.bundles.set(bundle, []); this.bundles.get(bundle).push(id); }
  async load(bundle, onProgress = () => {}) {
    const ids = this.bundles.get(bundle) ?? [];
    for (const [i, id] of ids.entries()) { this.items.set(id, this.compile(id, this.defs.get(id))); onProgress((i + 1) / ids.length); await 0; }
  }
  get(id) { const a = this.items.get(id); if (!a) throw new Error(`Asset não carregado: ${id}`); return a; }
  compile(id, { rows, map }) {
    const h = rows.length, w = rows[0].length, c = document.createElement('canvas'), x = c.getContext('2d');
    c.width = w; c.height = h;
    const img = x.createImageData(w, h);
    rows.forEach((row, j) => {
      if (row.length !== w) throw new Error(`${id}: linha ${j} com largura ${row.length}, esperado ${w}`);
      [...row].forEach((ch, i) => {
        const key = map[ch];
        if (key === undefined) throw new Error(`${id}: caractere '${ch}' sem slot`);
        if (key === null) return;                       // transparente: alpha é sempre 0 ou 255
        const rgb = this.pal[key];
        if (!rgb) throw new Error(`${id}: cor '${key}' fora da paleta`);
        img.data.set([...rgb, 255], (j * w + i) * 4);
      });
    });
    x.putImageData(img, 0, 0); return c;
  }
}
