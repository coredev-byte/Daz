import { Animator } from '../characters/animator.js';
import { domBar } from '../engine/domBar.js';
const DIRS = ['down', 'left', 'up', 'right'], SPEED = 72, Z = 4;
// Tela de Teste: mostra o módulo do personagem com o MESMO desenho do jogo. O chão rola para conferir se o pé patina.
export class LabScene {
  enter(c) {
    this.c = c; this.a = new Animator(c.family); this.walk = true; this.sc = 0; this.pos = [0, 0];
    const vs = Object.keys(c.family.variants), look = (this.look = c.look = c.look ?? {}); look.variant ??= vs[0];
    this.bar = domBar([
      ['direção', () => (this.a.dir = DIRS[(DIRS.indexOf(this.a.dir) + 1) % 4])],
      ['andar/parar', () => (this.walk = !this.walk)],
      [`variação: ${look.variant}`, b => { look.variant = vs[(vs.indexOf(look.variant) + 1) % vs.length]; b.textContent = `variação: ${look.variant}`; }],
      ['atacar', () => this.a.play('attack')], ['dano', () => this.a.play('hurt')], ['morrer', () => this.a.play('death')], ['levantar', () => this.a.reset()],
      ['mapa', () => c.go.map()],
    ]);
    c.debug.add('anim', () => `${this.a.state} ${this.a.dir} f${this.a.frame}`);
    c.debug.addDraw(ctx => { const [x, y] = this.pos, [ox, oy] = c.family.origin; ctx.fillStyle = '#ff40ff'; ctx.fillRect(x + ox * Z - 6, y + (oy + 1) * Z, 12, 1); });
  }
  exit() { this.bar.remove(); }
  update(dt) {
    const a = this.c.input.axis(); this.a.face(a.x, a.y);
    const moved = this.walk && !this.a.lock ? SPEED * dt : 0; this.a.update(moved); this.sc += moved;
  }
  draw(pass, ctx, r) {
    if (pass !== 'ground') return;
    const A = this.a, d = A.dir, S = this.c.sprites, [cw, ch] = this.c.family.cell, mod = v => ((v % 32) + 32) % 32;
    const ox = mod((d === 'right' ? -1 : d === 'left' ? 1 : 0) * this.sc), oy = mod((d === 'down' ? -1 : d === 'up' ? 1 : 0) * this.sc);
    for (let ty = 0; ty < r.h / 16 + 3; ty++) for (let tx = 0; tx < r.w / 16 + 3; tx++) {
      ctx.fillStyle = (tx + ty) & 1 ? '#10172b' : '#141c34'; ctx.fillRect(tx * 16 + ox - 32, ty * 16 + oy - 32, 16, 16);
    }
    const mx = 16, my = Math.max(4, (r.h - ch * Z) >> 1); this.pos = [mx, my];
    ctx.drawImage(S.get(this.look, d, A.state, A.frame), 0, 0, cw, ch, mx, my, cw * Z, ch * Z);   // lupa 4× (só inspeção)
    DIRS.forEach((dir, i) => ctx.drawImage(S.get(this.look, dir, A.state, A.frame), mx + cw * Z + 16 + i * (cw + 4), my + ch * Z - ch));   // tamanho real
  }
}
