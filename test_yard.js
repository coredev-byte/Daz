// Mapa como dado: a legenda aponta para IDs de asset; o motor não conhece tiles específicos.
const W = 48, H = 32;
const rows = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) =>
  x === 0 || y === 0 || x === W - 1 || y === H - 1 ? '#' : (y >= 15 && y <= 16) || (x >= 23 && x <= 24) ? ':' : '.').join(''));
export const testYard = { id: 'test_yard', tile: 16, w: W, h: H, legend: { '.': 'tile.grass', ':': 'tile.stone', '#': 'tile.wall' }, rows };
