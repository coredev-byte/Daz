const PRI = { idle: 0, walk: 1, attack: 2, hurt: 3, death: 4 };   // morte > dano > ataque > andar > parado
// Estado de animação: o jogo escreve state/dir; o desenho só lê frame. Ações travam a locomoção até terminar (morte nunca termina).
export class Animator {
  constructor(mod) { this.mod = mod; this.state = 'idle'; this.dir = 'down'; this.phase = 0; this.t = 0; this.lock = null; }
  face(ax, ay) { if (!this.lock && (ax || ay)) this.dir = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'right' : 'left') : ay > 0 ? 'down' : 'up'; }
  play(name) { if (this.lock && PRI[name] < PRI[this.lock]) return; this.lock = this.state = name; this.t = 0; }
  reset() { this.lock = null; this.state = 'idle'; this.t = 0; this.phase = 0; }
  count(clip) { const f = this.mod.clips[clip].frames; return (f[this.dir] ?? f.right ?? f.down).length; }
  update(moved) {
    if (this.lock) { this.t++; if (this.lock !== 'death' && this.t >= this.count(this.lock) * this.mod.clips[this.lock].hold) this.reset(); return; }
    const walking = moved > 0.01;
    if (walking !== (this.state === 'walk')) { this.phase = 0; this.t = 0; }
    this.state = walking ? 'walk' : 'idle';
    if (walking) this.phase += moved / this.mod.clips.walk.stride; else this.t++;
  }
  get frame() {
    const c = this.mod.clips[this.state], n = this.count(this.state), i = Math.floor(this.state === 'walk' ? this.phase : this.t / c.hold);
    return c.loop ? i % n : Math.min(i, n - 1);
  }
}
