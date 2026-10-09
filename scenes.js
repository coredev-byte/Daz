// Pilha de cenas: só a de cima recebe update; todas desenham (permite overlays).
export class Scenes {
  constructor(ctx) { this.ctx = ctx; this.stack = []; }
  get top() { return this.stack[this.stack.length - 1]; }
  push(s) { this.stack.push(s); s.enter?.(this.ctx); }
  pop() { this.stack.pop()?.exit?.(); }
  replace(s) { while (this.stack.length) this.pop(); this.push(s); }
  update(dt, tick) { this.top?.update?.(dt, tick); }
  draw(r, alpha) { for (const p of r.order) for (const s of this.stack) s.draw?.(p, r.bctx, r, alpha); }
}
