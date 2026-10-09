import { testYard } from '../../data/maps/test_yard.js';
import { Animator } from '../characters/animator.js';
import { domBar } from '../engine/domBar.js';
const SPEED = 72; // pixels de arte por segundo
// Mundo de prova: o personagem anda no mapa por dados, com câmera e limites.
export class TestScene {
  enter(c) {
    const m = (this.m = testYard), t = m.tile;
    this.c = c; this.a = new Animator(c.family); this.sx = this.sy = 0; c.camera.bounds = { w: m.w * t, h: m.h * t };
    this.prev = { x: (m.w * t) / 2, y: (m.h * t) / 2 }; this.cur = { ...this.prev };
    this.bar = domBar([['laboratório', () => c.go.lab()]]);
    c.debug.add('pos', () => `${this.cur.x.toFixed(1)}, ${this.cur.y.toFixed(1)}`);
    c.debug.addDraw(ctx => { ctx.strokeStyle = '#ff40ff'; ctx.strokeRect(this.sx - 5 + 0.5, this.sy - 6 + 0.5, 10, 6); });   // pegada 10×6 nos pés
  }
  exit() { this.bar.remove(); }
  update(dt) {
    const m = this.m, t = m.tile, a = this.a.lock ? { x: 0, y: 0 } : this.c.input.axis(), lo = t + 8;
    if (this.c.input.hit('attack')) this.a.play('attack');
    this.prev = { ...this.cur };
    this.cur.x = Math.min(Math.max(this.cur.x + a.x * SPEED * dt, lo), m.w * t - lo);
    this.cur.y = Math.min(Math.max(this.cur.y + a.y * SPEED * dt, lo), m.h * t - lo);
    this.a.face(a.x, a.y); this.a.update(Math.hypot(this.cur.x - this.prev.x, this.cur.y - this.prev.y));
  }
  draw(pass, ctx, r, alpha) {
    const { camera: cam, assets, sprites } = this.c, m = this.m, t = m.tile, A = this.a;
    const px = this.prev.x + (this.cur.x - this.prev.x) * alpha, py = this.prev.y + (this.cur.y - this.prev.y) * alpha;
    if (pass === 'ground') {
      cam.follow(px, py, r.w, r.h);
      const cx = cam.px, cy = cam.py;
      for (let y = Math.max(0, Math.floor(cy / t)); y < Math.min(m.h, Math.ceil((cy + r.h) / t)); y++)
        for (let x = Math.max(0, Math.floor(cx / t)); x < Math.min(m.w, Math.ceil((cx + r.w) / t)); x++)
          ctx.drawImage(assets.get(m.legend[m.rows[y][x]]), x * t - cx, y * t - cy, t, t);
    } else if (pass === 'actors') {
      this.sx = Math.round(px) - cam.px; this.sy = Math.round(py) - cam.py;
      ctx.drawImage(sprites.get(this.c.look ?? (this.c.look = { pele: 'media', cabelo: 'preto', casaco: 'azul', cachecol: 'vermelho', arma: true }), A.dir, A.state, A.frame), this.sx - this.c.family.origin[0], this.sy - this.c.family.origin[1]);
    }
  }
}
