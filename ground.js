// Tiles 16×16 como pixmaps indexados: cada caractere aponta para um slot da paleta.
const mk = (base, marks) => {
  const g = Array.from({ length: 16 }, () => Array(16).fill(base));
  for (const [x, y, c] of marks) g[y][x] = c;
  return g.map(r => r.join(''));
};
const bricks = [];
for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (y % 5 === 0 || (x + Math.floor(y / 5) * 4) % 8 === 0) bricks.push([x, y, '-']);
export const tileDefs = {
  'tile.grass': { rows: mk('.', [[2,3,','],[3,3,','],[10,2,"'"],[11,2,"'"],[6,9,','],[13,12,"'"],[4,13,','],[5,13,','],[9,6,"'"],[1,8,"'"],[14,5,','],[8,14,"'"]]), map: { '.': 'grama.2', ',': 'grama.1', "'": 'grama.3' } },
  'tile.stone': { rows: mk('.', [[3,2,','],[4,3,','],[5,4,','],[11,9,','],[10,10,','],[9,11,','],[2,12,"'"],[12,3,"'"],[7,7,"'"]]), map: { '.': 'pedra.2', ',': 'pedra.1', "'": 'pedra.3' } },
  'tile.wall': { rows: mk('.', bricks), map: { '.': 'muro.2', '-': 'muro.1' } },
};
