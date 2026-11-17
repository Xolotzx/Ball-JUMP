#!/usr/bin/env node
/**
 * Verificação local de contexto e segurança do ted-io.
 * Sem dependências. Requer Node.js 18+ e Git no PATH.
 *
 * Uso: node scripts/check-context.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const failures = [];
let checks = 0;

function pass(name) {
  checks++;
  console.log(`  OK   ${name}`);
}

function fail(name, detail = '') {
  checks++;
  failures.push({ name, detail });
  console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
}

function check(condition, name, detail = '') {
  if (condition) pass(name);
  else fail(name, detail);
}

function exists(rel) {
  try {
    return fs.statSync(path.join(root, rel)).isFile();
  } catch {
    return false;
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

console.log('ted-io — verificação de contexto e segurança\n');

// 1. Arquivos obrigatórios
console.log('Contexto e documentação:');
const required = [
  'index.html',
  '404.html',
  '_headers',
  'README.md',
  'AGENTS.md',
  'SECURITY.md',
  'docs/PROJECT_CONTEXT.md',
  'docs/ARCHITECTURE.md',
  'docs/CONTEXT_ENGINEERING.md',
  'docs/SECURITY.md',
  'docs/FIREBASE.md',
  'docs/DECISIONS.md',
  'docs/TESTING.md',
  'context/manifest.json',
  'context/current-state.md',
  '.github/pull_request_template.md',
  'scripts/check-context.mjs',
  'scripts/prepare-deploy.mjs'
];

for (const file of required) {
  if (!exists(file)) {
    fail(`arquivo obrigatório: ${file}`);
    continue;
  }
  const size = fs.statSync(path.join(root, file)).size;
  check(size > 40, `conteúdo mínimo: ${file}`, 'arquivo vazio ou muito pequeno');
}

let manifest = null;
try {
  manifest = JSON.parse(read('context/manifest.json'));
  pass('manifest.json é JSON válido');
} catch (error) {
  fail('manifest.json é JSON válido', error.message);
}

check(manifest?.runtimeFacts?.goalPercent === 75, 'manifesto declara meta de 75%');
check(String(manifest?.runtimeFacts?.preferences || '').includes('volume'), 'manifesto declara volume nas preferências');
check(manifest?.firebase?.collection === 'balljumpProfiles', 'manifesto declara coleção do ranking');
check(manifest?.firebase?.nicknameCollection === 'balljumpNicknames', 'manifesto declara coleção de nicks');
check(manifest?.firebase?.profileFields?.includes('photo'), 'manifesto declara foto no perfil');
check(manifest?.firebase?.profileFields?.includes('scores'), 'manifesto declara scores por modo');
check(manifest?.firebase?.profileFields?.includes('candy'), 'manifesto declara dados do modo doce');
check(manifest?.firebase?.profileFields?.includes('flappy'), 'manifesto declara dados do modo flappy');
check(String(manifest?.firebase?.profileCustomization?.photo || '').includes('90000'), 'manifesto declara limite da foto');
check(manifest?.firebase?.profileCustomization?.nicknameUnique === true, 'manifesto declara nick único');
check(
  Array.isArray(manifest?.firebase?.profileCustomization?.rankScopes)
    && manifest.firebase.profileCustomization.rankScopes.includes('geral')
    && manifest.firebase.profileCustomization.rankScopes.includes('easy')
    && manifest.firebase.profileCustomization.rankScopes.includes('doce')
    && manifest.firebase.profileCustomization.rankScopes.includes('flappy'),
  'manifesto declara escopos de ranking'
);
check(manifest?.firebase?.profileCustomization?.candyMode?.levels === 100, 'manifesto declara 100 fases do modo doce');
check(manifest?.firebase?.profileCustomization?.flappyMode?.pipes === 500, 'manifesto declara 500 canos do modo flappy');
check(manifest?.project?.repositoryVisibility === 'private', 'manifesto declara repositório privado');
check(manifest?.deployment?.headersFile === '_headers', 'manifesto aponta para _headers');

const projectContext = exists('docs/PROJECT_CONTEXT.md') ? read('docs/PROJECT_CONTEXT.md') : '';
check(projectContext.includes('75%'), 'contexto do projeto menciona 75%');
check(projectContext.includes('+1 vida'), 'contexto do projeto menciona +1 vida por fase');

const firebaseDocs = exists('docs/FIREBASE.md') ? read('docs/FIREBASE.md') : '';
check(firebaseDocs.includes('photo'), 'docs/FIREBASE.md documenta a foto');
check(firebaseDocs.includes('90000'), 'docs/FIREBASE.md documenta o limite da foto');
check(firebaseDocs.includes('balljumpNicknames'), 'docs/FIREBASE.md documenta nicks únicos');
check(firebaseDocs.includes('scores'), 'docs/FIREBASE.md documenta scores por modo');
check(firebaseDocs.includes('candy'), 'docs/FIREBASE.md documenta o modo doce');
check(firebaseDocs.includes('flappy'), 'docs/FIREBASE.md documenta o modo flappy');

const securityDocs = exists('docs/SECURITY.md') ? read('docs/SECURITY.md') : '';
check(/data URL|data:image/.test(securityDocs), 'docs/SECURITY.md cobre a foto de perfil');

const agents = exists('AGENTS.md') ? read('AGENTS.md') : '';
check(agents.includes('Segurança') || agents.includes('segurança'), 'AGENTS.md contém regras de segurança');
check(agents.includes('Nunca'), 'AGENTS.md contém proibições explícitas');

// 2. Invariantes do jogo
console.log('\nInvariantes do jogo:');
const index = exists('index.html') ? read('index.html') : '';
check(index.includes('<title>ted-io'), 'título ted-io presente');
check(index.includes('<h1 id="menuTitle">ted-io</h1>'), 'marca ted-io no menu presente');
check(index.includes('const GOAL_PCT = 75'), 'GOAL_PCT definido como 75');
check(index.includes('state.lives++'), 'incremento de vida por fase presente');
check(!/id=["']shareBtn["']/.test(index), 'botão de compartilhar removido');
check(!/navigator\.share|navigator\.clipboard/.test(index), 'sem Web Share/clipboard no runtime');
check(index.length < 280_000, 'index.html abaixo de 280 KB', `${index.length} bytes`);
check((index.match(/<script\b/gi) || []).length === 1, 'exatamente um bloco de script inline');

// 3. Superfície de rede/execução
console.log('\nSuperfície de rede e execução:');
const externalPatterns = [
  { name: 'sem src/href externo', re: /<(?:script|link|img|iframe|audio|video|source)[^>]+(?:src|href)\s*=\s*["']https?:/i },
  { name: 'sem @import externo', re: /@import\s+(?:url\()?["']?https?:/i },
  { name: 'sem fetch/XHR/WebSocket', re: /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/i },
  { name: 'sem sendBeacon', re: /navigator\.sendBeacon/i }
];
for (const item of externalPatterns) {
  check(!item.re.test(index), item.name);
}
check(!/<[a-z][^>]*\son[a-z]+\s*=/i.test(index), 'sem handlers inline (on...)');
check(!/\beval\s*\(/.test(index), 'sem eval()');
check(!/new\s+Function\s*\(/.test(index), 'sem new Function()');

// 4. Headers de segurança
console.log('\nHeaders HTTP:');
const headers = exists('_headers') ? read('_headers') : '';
const headerChecks = [
  ["Content-Security-Policy presente", headers.includes('Content-Security-Policy:')],
  ["CSP default-src 'none'", headers.includes("default-src 'none'")],
  ["CSP script-src inline", headers.includes("script-src 'unsafe-inline'")],
  ["CSP style-src inline", headers.includes("style-src 'unsafe-inline'")],
  ["CSP frame-ancestors 'none'", headers.includes("frame-ancestors 'none'")],
  ['nosniff presente', headers.includes('X-Content-Type-Options: nosniff')],
  ['no-referrer presente', headers.includes('Referrer-Policy: no-referrer')],
  ['X-Frame-Options presente', headers.includes('X-Frame-Options: DENY')],
  ['Permissions-Policy presente', headers.includes('Permissions-Policy:')],
  ['COOP permite popups de login', headers.includes('Cross-Origin-Opener-Policy: same-origin-allow-popups')],
  ['HSTS presente', headers.includes('Strict-Transport-Security:')]
];
for (const [name, condition] of headerChecks) check(condition, name);
check(headers.includes('https://www.gstatic.com'), 'CSP permite o SDK Firebase');
check(
  headers.includes('https://firestore.googleapis.com')
    && headers.includes('https://identitytoolkit.googleapis.com')
    && headers.includes('https://securetoken.googleapis.com'),
  'CSP permite as APIs do Firebase'
);
check(index.includes('https://www.gstatic.com/firebasejs/'), 'Firebase SDK via gstatic');
check(index.includes("FIREBASE_SDK_VERSION = '10.14.1'"), 'versão do Firebase fixada');
check(index.includes("RANK_COLLECTION = 'balljumpProfiles'"), 'coleção do ranking definida');
check(index.includes("NICK_COLLECTION = 'balljumpNicknames'"), 'coleção de nicks definida');
check(index.includes('function nicknameKeyFor') && index.includes('function claimNickname'), 'reserva de nick presente');
check(index.includes('nickname-taken'), 'erro de nick duplicado presente');
check(index.includes('scores.${scope}.bestStreak'), 'ranking por dificuldade presente');
check(index.includes('function buildRankModeButtons') && index.includes('rank-modes'), 'seletor de modo do ranking presente');
check(index.includes('id="rankFamilies"') && index.includes('function setRankFamily'), 'famílias de ranking presentes');
check(index.includes('Clássico 🧱') && index.includes('Doce 🍪') && index.includes('Flappy 🐦'), 'rótulos Clássico, Doce e Flappy presentes');
check(index.includes('rankScoreTab.hidden = !(isCandy || isFlappy)'), 'aba Pontos restrita ao Doce e Flappy');
check(index.includes('CANDY_MAX_LEVEL = 100') && index.includes('function startCandyMode'), 'modo doce presente');
check(index.includes('CANDY_BOMB') && index.includes('function candyExplodeBombs'), 'bombas e explosões presentes');
check(index.includes('CANDY_LIGHTNING') && index.includes('function candyLightningStrike'), 'relâmpago presente');
check(index.includes('candySeedLocks') && index.includes('candyState.locks'), 'cadeados presentes');
check(index.includes('60 - candyTier'), 'tempo base de 60s presente');
check(index.includes('function lockHit') && index.includes('function lightning'), 'sons de cadeado e relâmpago presentes');
check(index.includes('radius: mega ? 2 : 1') && index.includes('megaExplosion'), 'explosão dupla bomba+bomba presente');
check(index.includes('function candyTargetScore') && index.includes('750 + Math.floor((level - 1) / 5) * 500'), 'meta +500 a cada 5 fases presente');
check(index.includes('Math.min(0.018, 0.002 + level * 0.00015)'), 'spawn de relâmpago reduzido presente');
check(index.includes('id="candySettings"') && index.includes("ui.candySettings.addEventListener('click', openSettings)"), 'configurações no modo doce presentes');
check(index.includes('settingsDifficultySection.hidden = inCandy'), 'dificuldade oculta nas configurações do doce');
check(index.includes('body.menu-active .app') && index.includes("classList.add('menu-active')"), 'menu principal com fundo temático');
check(index.includes('function explosion') && index.includes('function candyPop'), 'sons do modo doce presentes');
check(index.includes('body.candy-active .app') && index.includes("classList.add('candy-active')"), 'fundo compartilhado do modo doce');
check(index.includes('candy.bestScore'), 'ranking doce presente');
check(index.includes('id="modeModal"') && index.includes('id="modeClassicBtn"') && index.includes('id="modeCandyBtn"'), 'seletor de modo presente');
check(index.includes('function openModeChooser') && index.includes('function chooseMode'), 'lógica do seletor de modo presente');
check(!index.includes('menuCandyBtn'), 'sem botão duplicado de modo doce no menu');
check(index.includes('id="candyBoard"'), 'tabuleiro do modo doce presente');
check(index.includes('FLAPPY_MAX_PIPES = 500') && index.includes('function startFlappyMode'), 'modo flappy com 500 canos presente');
check(index.includes('id="flappyCanvas"') && index.includes('function flappyRender'), 'canvas e renderização do flappy presentes');
check(index.includes('FLAPPY_LIVES = 3') && index.includes('function flappyLoseLife'), 'vidas e dano do flappy presentes');
check(index.includes('function flappyPipeCountFor') && index.includes('4 + Math.min(4, Math.floor(pipes / 100))'), 'canos por fase do flappy presentes');
check(index.includes("family === 'flappy'") && index.includes('flappy.bestScore'), 'ranking flappy presente');
check(index.includes('id="flappySettings"') && index.includes("ui.flappySettings.addEventListener('click', openSettings)"), 'configurações no modo flappy presentes');
check(index.includes('settingsDifficultySection.hidden = inCandy || inFlappy'), 'dificuldade oculta nas configurações do flappy');
check(index.includes('body.flappy-active .app') && index.includes("classList.add('flappy-active')"), 'tela do flappy isolada do app clássico');
check(index.includes('sanitizeFlappy') && index.includes('mergePendingFlappy') && index.includes('flappy: values.flappy'), 'perfil e sync do flappy presentes');
check(index.includes('function flappyCompletePhase') && index.includes('passou pelos 500 canos'), 'vitória do flappy em 500 canos presente');
check(index.includes('id="classicMenuBtn"') && index.includes('function returnClassicToMenu'), 'botão menu do clássico presente');
check(index.includes('id="volumeSlider"') && index.includes('function changeVolume'), 'slider de volume presente');
check(index.includes("setVolume"), 'controle de volume do áudio presente');
check(index.includes('id="settingsHowBtn"') && index.includes('openTutorial(true)'), 'como jogar nas configurações presente');
check(!index.includes('menuHowBtn'), 'como jogar removido do menu principal');
check(!/service_account|private_key\s*:/i.test(index), 'sem service account no cliente');
check(index.includes('function isPhotoDataURL'), 'validação de foto presente');
check(index.includes('90000'), 'limite de foto presente no cliente');
check(index.includes('createImageBitmap') && index.includes('FileReader'), 'foto decodificada sem blob URL');
check(!index.includes('createObjectURL'), 'sem blob URL na foto (compatível com CSP)');
check(index.includes('function processPhotoFile') && index.includes('function saveProfileEdits'), 'edição de perfil presente');
check(!index.includes('firebase-storage'), 'sem Firebase Storage no cliente');
check(headers.includes('img-src data:'), 'CSP permite fotos em data URL');

// 5. Repositório e segredos
console.log('\nRepositório e segredos:');
const gitignore = exists('.gitignore') ? read('.gitignore') : '';
for (const entry of ['.wrangler/', '.env', '*.pem', '*.key', 'dist/']) {
  check(gitignore.includes(entry), `.gitignore cobre ${entry}`);
}

const distDir = path.join(root, 'dist');
if (fs.existsSync(distDir)) {
  const distFiles = fs.readdirSync(distDir).sort();
  const allowed = new Set(['index.html', '404.html', '_headers']);
  check(
    distFiles.every((file) => allowed.has(file)),
    'dist contém somente runtime, 404 e headers',
    distFiles.join(', ')
  );
}

let files = [];
try {
  const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: root,
    encoding: 'utf8'
  });
  files = [...new Set(out.split('\0').filter(Boolean))];
  check(files.length > 0, 'lista de arquivos Git obtida');
} catch (error) {
  fail('lista de arquivos Git', 'execute dentro do repositório e com Git no PATH');
}

const forbiddenFiles = files.filter((file) =>
  /(^|\/)\.env(?:\.|$)|\.pem$|\.key$|\.p12$|^\.wrangler\/|(^|\/)credentials\//i.test(file)
);
check(forbiddenFiles.length === 0, 'nenhum arquivo sensível rastreado', forbiddenFiles.join(', '));

const secretPatterns = [
  { name: 'token GitHub', re: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { name: 'token GitHub fine-grained', re: /github_pat_[A-Za-z0-9_]{30,}/g },
  { name: 'chave AWS', re: /AKIA[0-9A-Z]{16}/g },
  { name: 'chave privada PEM', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'token Cloudflare atribuído', re: /CLOUDFLARE_API_TOKEN\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}/g },
  { name: 'token Cloudflare alternativo', re: /CF_API_TOKEN\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}/g },
  { name: 'segredo AWS atribuído', re: /AWS_SECRET_ACCESS_KEY\s*[:=]\s*["']?[A-Za-z0-9/+=]{20,}/g },
  { name: 'token Slack', re: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { name: 'bearer token', re: /authorization\s*:\s*bearer\s+[A-Za-z0-9._-]{20,}/gi }
];

const textFile = (file) =>
  file === '_headers' ||
  file === '.gitignore' ||
  /\.(html|md|json|mjs|js|css|txt|yml|yaml|toml|ps1|sh)$/i.test(file);

const secretFindings = [];
for (const file of files) {
  if (file === 'scripts/check-context.mjs' || !textFile(file)) continue;
  let content = '';
  try {
    const info = fs.statSync(path.join(root, file));
    if (info.size > 2_000_000) continue;
    content = fs.readFileSync(path.join(root, file), 'utf8');
  } catch {
    continue;
  }
  for (const pattern of secretPatterns) {
    pattern.re.lastIndex = 0;
    if (pattern.re.test(content)) {
      // Nunca imprimir o valor encontrado.
      secretFindings.push(`${file}: ${pattern.name}`);
    }
  }
}
check(secretFindings.length === 0, 'nenhum padrão de segredo encontrado', secretFindings.join('; '));

const privateDataPatterns = [
  { name: 'caminho absoluto de usuário Windows', re: /[A-Z]:\\Users\\[^\\\s]+/i },
  { name: 'caminho absoluto de usuário Unix', re: /\/Users\/[^/\s]+\//i },
  { name: 'e-mail pessoal', re: /[A-Za-z0-9._%+-]+@(?!users\.noreply\.github\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/i }
];
const piiFindings = [];
for (const file of files) {
  if (file === 'scripts/check-context.mjs' || !textFile(file)) continue;
  let content = '';
  try {
    if (fs.statSync(path.join(root, file)).size > 2_000_000) continue;
    content = fs.readFileSync(path.join(root, file), 'utf8');
  } catch {
    continue;
  }
  for (const pattern of privateDataPatterns) {
    if (pattern.re.test(content)) piiFindings.push(`${file}: ${pattern.name}`);
  }
}
check(piiFindings.length === 0, 'nenhum dado pessoal/caminho local nos arquivos', piiFindings.join('; '));

// 6. Resumo
console.log('');
if (failures.length > 0) {
  console.error(`FALHOU: ${failures.length} problema(s) em ${checks} verificações.`);
  for (const failure of failures) {
    console.error(` - ${failure.name}${failure.detail ? `: ${failure.detail}` : ''}`);
  }
  process.exitCode = 1;
} else {
  console.log(`OK: ${checks} verificações concluídas sem problemas.`);
}
