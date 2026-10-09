// Câmera: segue o alvo, respeita os limites do mapa e arredonda ao pixel.
export class Camera {
  constructor() { this.x = 0; this.y = 0; this.bounds = null; }
  follow(tx, ty, vw, vh) {
    const b = this.bounds, fit = (t, v, m) => (m <= v ? (m - v) / 2 : Math.min(Math.max(t - v / 2, 0), m - v));
    this.x = b ? fit(tx, vw, b.w) : tx - vw / 2; this.y = b ? fit(ty, vh, b.h) : ty - vh / 2;
  }
  get px() { return Math.round(this.x); }
  get py() { return Math.round(this.y); }
}
