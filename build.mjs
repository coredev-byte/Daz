// Empacota o jogo num único HTML (para celular/compartilhar). Uso: npm run build
import './validate-art.mjs';
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const r = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false });
const js = r.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const html = readFileSync('index.html', 'utf8').replace('<script type="module" src="src/main.js"></script>', () => `<script>${js}</script>`);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/distrito-zero.html', html);
console.log('dist/distrito-zero.html', (html.length / 1024).toFixed(1) + ' KB');
