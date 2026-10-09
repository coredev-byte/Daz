export const defaultBindings = {
  up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
  attack: ['Space'], pause: ['Escape', 'KeyP'], debug: ['F3'], freeze: ['KeyU'], step: ['KeyI'], slow: ['KeyO'],
};
// Teclas e toque viram AÇÕES remapeáveis; o jogo lê ações, nunca teclas.
export class Input {
  constructor(el, bindings = defaultBindings) {
    Object.assign(this, { b: bindings, down: new Set(), tp: new Set(), fp: new Set(), stick: { x: 0, y: 0 }, touch: null });
    addEventListener('keydown', e => {
      if (Object.values(this.b).some(a => a.includes(e.code))) e.preventDefault();
      if (!e.repeat) { this.down.add(e.code); this.tp.add(e.code); this.fp.add(e.code); }
    });
    addEventListener('keyup', e => this.down.delete(e.code));
    addEventListener('blur', () => this.down.clear());
    // Joystick flutuante: nasce onde o polegar toca, na metade esquerda da tela.
    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch' && e.clientX < innerWidth / 2) { this.touch = { id: e.pointerId, x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); }
    });
    el.addEventListener('pointermove', e => {
      const t = this.touch; if (!t || t.id !== e.pointerId) return;
      const dx = e.clientX - t.x, dy = e.clientY - t.y, d = Math.hypot(dx, dy), k = Math.min(d, 40) / 40;
      this.stick = d > 6 ? { x: (dx / d) * k, y: (dy / d) * k } : { x: 0, y: 0 };
    });
    const end = e => { if (this.touch?.id === e.pointerId) { this.touch = null; this.stick = { x: 0, y: 0 }; } };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  held(a) { return this.b[a].some(c => this.down.has(c)); }
  hit(a) { return this.b[a].some(c => this.tp.has(c)); }       // 1x por toque, lido no tick
  frameHit(a) { return this.b[a].some(c => this.fp.has(c)); }  // lido por quadro (debug/UI)
  axis() {
    const x = this.held('right') - this.held('left') || this.stick.x, y = this.held('down') - this.held('up') || this.stick.y, l = Math.hypot(x, y);
    return l > 1 ? { x: x / l, y: y / l } : { x, y };
  }
  endTick() { this.tp.clear(); }
  endFrame() { this.fp.clear(); }
}
