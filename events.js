// Eventos entram numa fila e só são entregues no fim do tick (flush).
export class EventBus {
  constructor() { this.h = new Map(); this.q = []; }
  on(type, fn) { if (!this.h.has(type)) this.h.set(type, []); this.h.get(type).push(fn); }
  emit(type, data) { this.q.push([type, data]); }
  flush() { const q = this.q; this.q = []; for (const [t, d] of q) for (const fn of this.h.get(t) ?? []) fn(d, t); }
}
