export class BootScene {
  enter(c) { this.p = 0; c.assets.load('boot', p => (this.p = p)).then(() => c.go.lab()); }
  draw(pass, ctx, r) {
    if (pass !== 'ui') return;
    const w = 80, x = (r.w - w) >> 1, y = r.h >> 1;
    ctx.fillStyle = '#2a2f3d'; ctx.fillRect(x - 1, y - 1, w + 2, 6);
    ctx.fillStyle = '#e8a33d'; ctx.fillRect(x, y, Math.round(w * this.p), 4);
  }
}
