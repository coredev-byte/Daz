// Modo desenvolvedor: F3, toque no canto superior esquerdo ou ?dev=1. U congela, I avança 1 tick, O câmera lenta.
export class Debug {
  constructor(loop) {
    Object.assign(this, { loop, on: /[?&]dev=1/.test(location.search), lines: new Map(), draws: [], el: document.createElement('pre') });
    Object.assign(this.el.style, { position: 'fixed', left: '8px', top: '8px', margin: '0', color: '#9fe8d0', font: '12px/1.3 monospace', pointerEvents: 'none', textShadow: '1px 1px #000' });
    document.body.append(this.el);
  }
  add(name, fn) { this.lines.set(name, fn); }   // inspetor de texto
  addDraw(fn) { this.draws.push(fn); }          // desenho de debug (hitbox, colisor...)
  update(input) {
    if (input.frameHit('debug')) this.on = !this.on;
    if (!this.on) return;
    if (input.frameHit('freeze')) this.loop.paused = !this.loop.paused;
    if (input.frameHit('step')) this.loop.stepOnce = true;
    if (input.frameHit('slow')) this.loop.scale = this.loop.scale === 1 ? 0.25 : 1;
  }
  draw(ctx) { if (this.on) for (const f of this.draws) f(ctx); }
  text() { this.el.textContent = this.on ? [...this.lines].map(([k, f]) => `${k}: ${f()}`).join('\n') : ''; }
}
