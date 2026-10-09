// Um canvas lógico (pixels de arte) ampliado por escala INTEIRA do aparelho, sem suavização.
export class Renderer {
  constructor(canvas) {
    Object.assign(this, { canvas, ctx: canvas.getContext('2d', { alpha: false }), buf: document.createElement('canvas'), w: 480, h: 270, scale: 1,
      order: ['ground', 'actors', 'above', 'light', 'fx', 'ui'] });   // ordem de desenho (luz já tem lugar reservado)
    this.bctx = this.buf.getContext('2d');
    addEventListener('resize', () => this.resize()); this.resize();
  }
  resize() {
    const r = this.canvas.getBoundingClientRect(), d = devicePixelRatio || 1;
    const W = Math.max(1, Math.round(r.width * d)), H = Math.max(1, Math.round(r.height * d));
    let s = Math.max(1, Math.round(Math.min(W / 480, H / 270)));
    while (s > 1 && (W / s < 320 || H / s < 180)) s--;
    while (W / s > 640 || H / s > 360) s++;
    this.scale = s; this.w = Math.floor(W / s); this.h = Math.floor(H / s);
    this.canvas.width = W; this.canvas.height = H; this.buf.width = this.w; this.buf.height = this.h;
  }
  frame(draw) {
    const c = this.bctx, x = this.ctx, s = this.scale;
    c.imageSmoothingEnabled = false; c.fillStyle = '#0b1020'; c.fillRect(0, 0, this.w, this.h);
    draw(c);
    x.imageSmoothingEnabled = false; x.fillStyle = '#000'; x.fillRect(0, 0, this.canvas.width, this.canvas.height);
    x.drawImage(this.buf, 0, 0, this.w, this.h, (this.canvas.width - this.w * s) >> 1, (this.canvas.height - this.h * s) >> 1, this.w * s, this.h * s);
  }
}
