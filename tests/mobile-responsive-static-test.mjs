import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const html = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
const mobileCssPath = path.join(root, 'admin-v8.46-mobile.css');

function declarationBlock(css, selector) {
  let selectorStart = -1;
  let cursor = css.indexOf(selector);
  while (cursor !== -1) {
    const next = css.slice(cursor + selector.length).trimStart()[0];
    if (next === ',' || next === '{') selectorStart = cursor;
    cursor = css.indexOf(selector, cursor + selector.length);
  }
  assert.notEqual(selectorStart, -1, `Não existe uma regra final para ${selector}.`);
  const open = css.indexOf('{', selectorStart);
  assert.notEqual(open, -1, `A regra ${selector} não abre um bloco CSS.`);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }
  throw new Error(`A regra ${selector} não fecha um bloco CSS.`);
}

function expectDeclaration(css, selector, declaration) {
  const block = declarationBlock(css, selector).replace(/\s+/g, ' ');
  assert.ok(
    block.includes(declaration),
    `${selector} deve resultar em “${declaration}” no telemóvel.`
  );
}

assert.ok(
  html.indexOf('admin-v8.46-mobile.css?v=8.46') > html.indexOf('admin-v8.45.css?v=8.45'),
  'A camada mobile final tem de vencer as regras antigas da versão 8.45.'
);
assert.ok(fs.existsSync(mobileCssPath), 'A camada de comportamento mobile v8.46 deve existir.');

const css = fs.readFileSync(mobileCssPath, 'utf8');
assert.match(css, /@media\s*\(max-width:\s*760px\)/, 'As alterações devem ficar limitadas ao telemóvel.');

// Contrato de comportamento: a área activa recebe o gesto vertical, em vez de
// deixar o conteúdo crescer dentro de uma moldura que continua bloqueada.
const mainSurface = 'body.admin-body.admin-v838.admin-v839 .admin-dashboard-main';
const viewSurface = 'body.admin-body.admin-v838.admin-v839 .admin-view-section';
for (const surface of [mainSurface, viewSurface]) {
  expectDeclaration(css, surface, 'overflow-y: auto !important;');
  expectDeclaration(css, surface, 'overflow-x: hidden !important;');
  expectDeclaration(css, surface, 'touch-action: pan-y !important;');
  expectDeclaration(css, surface, 'padding-bottom: calc(var(--v846-mobile-bottom) + 24px) !important;');
}

// Presentes tinha uma regra de ID que escondia o overflow; a anulação precisa
// ser tão específica para a página inteira também poder rolar.
expectDeclaration(
  css,
  'body.admin-body.admin-v838.admin-v839 #presentes.admin-view-section.admin-view-active',
  'overflow-y: auto !important;'
);

// Ao ocupar a parte inferior do ecrã, a navegação deve reservar espaço real
// no conteúdo e não encobrir os últimos botões ou campos.
expectDeclaration(
  css,
  'body.admin-body.admin-v838.admin-v839 .admin-mobile-bottom-nav',
  'padding-bottom: calc(7px + env(safe-area-inset-bottom)) !important;'
);

// Os filtros continuam utilizáveis por gesto horizontal, sem esmagar rótulos.
expectDeclaration(css, 'body.admin-body.admin-v838.admin-v839 #convidados .guest-filters', 'flex-wrap: nowrap !important;');
expectDeclaration(css, 'body.admin-body.admin-v838.admin-v839 #convidados .guest-filters', 'overflow-x: auto !important;');

// As listas deixam de criar um segundo ecrã fixo dentro do ecrã principal.
expectDeclaration(css, 'body.admin-body.admin-v838.admin-v839 #presentes .gift-list-scroll', 'height: auto !important;');
expectDeclaration(css, 'body.admin-body.admin-v838.admin-v839 #presentes .gift-list-scroll', 'overflow: visible !important;');

// No editor, as secções extensas continuam navegáveis horizontalmente.
expectDeclaration(css, 'body.admin-body.admin-v838.admin-v839 #site-editor .v837-editor-tabs', 'overflow-x: auto !important;');

console.log('Mobile scroll and density behavior contract passed.');
