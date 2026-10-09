export const TICK_MS = 1000 / 60;
// Passo fixo de 60 Hz com acumulador. O desenho recebe alpha (0..1) para interpolar.
export class Loop {
  constructor({ update, render }) {
    Object.assign(this, { update, render, acc: 0, last: 0, tick: 0, fps: 60, scale: 1, paused: false, stepOnce: false });
    this.frame = this.frame.bind(this);
  }
  start() { this.last = performance.now(); requestAnimationFrame(this.frame); }
  frame(now) {
    const dt = Math.min(Math.max(now - this.last, 0), 250); this.last = now;
    this.fps += (1000 / Math.max(dt, 1) - this.fps) * 0.1;
    if (!this.paused) this.acc += dt * this.scale;
    let n = 0;
    while (this.acc >= TICK_MS && n < 5) { this.update(TICK_MS / 1000, this.tick++); this.acc -= TICK_MS; n++; }
    if (n === 5) this.acc = 0;
    if (this.stepOnce) { this.stepOnce = false; this.update(TICK_MS / 1000, this.tick++); }
    this.render(this.acc / TICK_MS);
    requestAnimationFrame(this.frame);
  }
}
