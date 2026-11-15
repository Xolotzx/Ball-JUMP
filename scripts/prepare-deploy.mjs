#!/usr/bin/env node
/**
 * Prepara um diretório de deploy com allowlist explícita.
 * Somente runtime público e headers são publicados; docs/contexto ficam privados.
 *
 * Uso: node scripts/prepare-deploy.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist');
const allowlist = ['index.html', '404.html', '_headers'];

// Garantia de que o destino está dentro do projeto.
const relative = path.relative(root, outDir);
if (relative.startsWith('..') || path.isAbsolute(relative)) {
  throw new Error('Diretório de deploy inválido.');
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of allowlist) {
  const source = path.join(root, file);
  const stat = fs.statSync(source);
  if (!stat.isFile()) throw new Error(`Arquivo de deploy ausente: ${file}`);
  fs.copyFileSync(source, path.join(outDir, file));
}

const staged = fs.readdirSync(outDir).sort();
const unexpected = staged.filter((file) => !allowlist.includes(file));
if (unexpected.length > 0) {
  throw new Error(`Arquivos inesperados no deploy: ${unexpected.join(', ')}`);
}

console.log('Deploy preparado em dist/');
for (const file of staged) {
  const bytes = fs.statSync(path.join(outDir, file)).size;
  console.log(` - ${file} (${bytes} bytes)`);
}
console.log('Próximo passo: npx wrangler pages deploy dist --project-name ted-io --branch main --commit-dirty=true');
