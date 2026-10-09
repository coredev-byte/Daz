import { size, palette, variants, clips as f } from './frames.js';
// MÓDULO DO PERSONAGEM: arte, tempos e variações do herói num só lugar. Todo personagem novo (inimigo, NPC) segue este formato.
// frames: direção -> lista de quadros. Direção ausente cai na de lado (esquerda = espelho da direita) ou na de frente.
export const hero = {
  id: 'heroi', cell: size, origin: [size[0] >> 1, size[1] - 1], palette, variants,
  clips: {
    idle: { frames: f.idle, hold: 8, loop: true },
    walk: { frames: f.walk, stride: 7, loop: true },   // stride: pixels por quadro (o pé não patina)
    attack: { frames: f.attack, hold: 10, loop: false },
    hurt: { frames: f.hurt, hold: 4, loop: false },
    death: { frames: { down: f.hurt.down.slice(-3) }, hold: 14, loop: false },   // a ficha não traz quadros de morte
  },
};
