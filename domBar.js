// Barra de botões em HTML, só para ferramentas de desenvolvimento (Laboratório). O jogo em si usa canvas.
export function domBar(buttons) {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'fixed', left: '0', right: '0', bottom: 'env(safe-area-inset-bottom,0px)', display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '6px', justifyContent: 'center' });
  for (const [label, fn] of buttons) {
    const b = Object.assign(document.createElement('button'), { textContent: label, onclick: () => fn(b) });
    Object.assign(b.style, { font: '13px monospace', color: '#e8e8f0', background: '#1a2748', border: '2px solid #46619e', padding: '8px 10px', borderRadius: '0' });
    el.append(b);
  }
  document.body.append(el); return el;
}
