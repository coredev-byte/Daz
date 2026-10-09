// Validador de arte: todo quadro com o tamanho do módulo, só cores da paleta, pés na última linha, largura ímpar (espelho exato).
import { hero } from '../assets/characters/hero/index.js';
const [CW, CH] = hero.cell; let n = 0;
if (CW % 2 === 0) throw new Error('largura do quadro deve ser ímpar');
for (const [clip, def] of Object.entries(hero.clips)) for (const [dir, frames] of Object.entries(def.frames)) frames.forEach((rows, i) => {
  const tag = `${clip}.${dir}[${i}]`; let feet = false;
  if (rows.length !== CH) throw new Error(`${tag}: ${rows.length} linhas, esperado ${CH}`);
  rows.forEach((r, j) => {
    if (r.length !== CW) throw new Error(`${tag}: linha ${j} com ${r.length} colunas, esperado ${CW}`);
    for (const ch of r) if (ch !== '.') { if (!hero.palette[ch]) throw new Error(`${tag}: cor '${ch}' fora da paleta`); if (j === CH - 1) feet = true; }
  });
  if (!feet) throw new Error(`${tag}: nenhum pixel na linha dos pés`);
  n++;
});
for (const [v, map] of Object.entries(hero.variants)) for (const ch of Object.keys(map)) if (!hero.palette[ch]) throw new Error(`variação ${v}: '${ch}' fora da paleta`);
console.log(`arte OK: ${n} quadros ${CW}×${CH}, ${Object.keys(hero.variants).length} variações`);
