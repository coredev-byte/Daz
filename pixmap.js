// Pixmap indexado: cada caractere vira [slot, tom]. Validação pura (sem DOM), usada no jogo e em tools/validate-art.mjs.
export function parsePart(name, rows, CH) {
  const h = rows.length, w = rows[0].length, px = new Array(w * h).fill(null);
  rows.forEach((r, j) => {
    if (r.length !== w) throw new Error(`${name}: linha ${j} tem ${r.length} colunas, esperado ${w}`);
    [...r].forEach((ch, i) => { if (ch === '.') return; if (!CH[ch]) throw new Error(`${name}: caractere '${ch}' desconhecido (linha ${j})`); px[j * w + i] = CH[ch]; });
  });
  return { name, w, h, px };
}
