# Decisões arquiteturais — ted-io

Formato: contexto → decisão → consequências. Mudanças de decisão exigem nova ADR.

## ADR-001 — Runtime em arquivo único

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** jogo pequeno, distribuição simples, uso offline, facilidade de abrir localmente.
- **Decisão:** manter HTML, CSS e JavaScript no `index.html`; documentação e ferramentas ficam fora do runtime.
- **Consequências:**
  - deploy e distribuição triviais;
  - funciona via `file://`;
  - arquivo grande (~202 KB) e maior custo de leitura por agentes;
  - CSP precisa permitir inline;
  - buscar por símbolos em vez de ler o arquivo inteiro.

## ADR-002 — Zero dependências e zero rede em runtime

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** reduzir supply chain, preservar privacidade e funcionar offline.
- **Decisão:** nenhuma biblioteca, CDN, fonte externa, analytics ou chamada de rede no jogo.
- **Consequências:**
  - superfície de ataque menor;
  - CSP mais restritiva;
  - funcionalidades que dependam de serviço externo exigem nova decisão;
  - ferramentas de desenvolvimento (Node, Wrangler) não entram no runtime.
  - **Exceção posterior:** Firebase SDK sob demanda para login/ranking (ADR-014).

## ADR-003 — Canvas 2D + Web Audio API

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** jogo 2D com grid, física simples e áudio retrô sem assets.
- **Decisão:** renderizar em Canvas 2D e sintetizar efeitos com Web Audio API.
- **Consequências:**
  - controle visual e de performance;
  - nenhum arquivo de imagem/áudio;
  - acessibilidade do canvas depende de rótulos e da UI HTML;
  - cache de cena necessário para desempenho.

## ADR-004 — Meta de 75% e +1 vida por fase

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** equilibrar desafio e progressão; meta ajustada para 75% nesta iteração.
- **Decisão:** meta de **75%** da área interna; ao concluir cada fase, conceder **+1 vida**.
- **Consequências:**
  - `GOAL_CELLS = 378`;
  - níveis mais acessíveis;
  - a vida extra reduz a punição acumulada;
  - tutorial e HUD devem refletir 75% e a recompensa.

## ADR-005 — Remover compartilhamento

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** simplificar HUD e eliminar API opcional/alertas; requisito do produto.
- **Decisão:** remover botão e código de Web Share/clipboard.
- **Consequências:**
  - HUD mais limpo;
  - uma permissão/API a menos;
  - compartilhamento passa a ser manual (copiar URL do navegador).

## ADR-006 — Menu inicial e tutorial

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** o jogo não tinha onboarding; requisito do produto.
- **Decisão:** menu inicial com Jogar/Configurações/Como jogar e tutorial em modal.
- **Consequências:**
  - jogo inicia pausado até “Jogar”;
  - overlays precisam de gestão de foco, `inert` e scroll;
  - tutorial deve ser atualizado quando regras mudarem;
  - revisão posterior: o botão **Como jogar** saiu do menu e passou para as configurações (ADR-018).

## ADR-007 — Liquid glass e dois modos de aparência

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** reduzir glow, modernizar a UI e simplificar os temas.
- **Decisão:** adotar estética liquid glass (glassmorphism) e apenas dois modos: escuro e claro.
- **Consequências:**
  - remove temas Pacman/Egito/Retrô/Futurista;
  - CSS com variáveis por modo;
  - blur/backdrop-filter pode custar desempenho em dispositivos fracos;
  - manter contraste e legibilidade.

## ADR-008 — Cloudflare Pages com upload direto + GitHub privado

- **Data:** 2026-11-15
- **Status:** aceita (revisar se automação for necessária)
- **Contexto:** publicação rápida e versionamento privado.
- **Decisão:** publicar no Cloudflare Pages (`ted-io`) por upload direto a partir de `dist/`, com allowlist de `index.html` + `404.html` + `_headers`, e manter o código no GitHub privado.
- **Consequências:**
  - deploy manual em duas etapas (`prepare-deploy` + `pages deploy`);
  - documentação interna e contexto não vão para produção;
  - `git push` não publica automaticamente;
  - integração Git do Cloudflare exigiria autorização do GitHub App e revisão;
  - repositório privado não é armazenamento de segredos.

## ADR-009 — CSP com `'unsafe-inline'`

- **Data:** 2026-11-15
- **Status:** aceita com revisão periódica
- **Contexto:** o runtime single-file usa `<style>` e `<script>` inline.
- **Decisão:** CSP restritiva com `default-src 'none'`, permitindo apenas inline para script/style e `data:` para o favicon.
- **Consequências:**
  - boa redução de rede/frames/objetos;
  - `'unsafe-inline'` enfraquece a defesa contra XSS;
  - mitigação: nenhuma entrada de usuário no DOM;
  - se houver entrada externa, migrar para hashes/nonces e separar arquivos.
  - **Revisão posterior:** hosts allowlisted do Firebase/Google Auth adicionados em ADR-014.

## ADR-010 — Engenharia de contexto versionada

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** colaboração com agentes de IA e necessidade de segurança/reprodutibilidade.
- **Decisão:** manter `AGENTS.md`, documentos de contexto/arquitetura/segurança/decisões/testes, manifesto e script de verificação.
- **Consequências:**
  - onboarding mais rápido;
  - menos leitura desnecessária do código;
  - documentação precisa ser mantida;
  - nenhum segredo pode entrar no contexto.

## ADR-011 — Paleta preto/laranja, laranja/branco e fundo ambiente

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** identidade visual mais quente e imersiva, alinhada às referências de ondas laranja sobre preto e à fita laranja sobre fundo creme.
- **Decisão:** usar preto + laranja no modo escuro, laranja + branco no claro, com fundo SVG inline: ondas desfocadas à direita no escuro e fita laranja desfocada no claro.
- **Consequências:**
  - remove azul/verde/amarelo da identidade principal;
  - botões de direção usam laranja e creme/branco;
  - fundo é decorativo, sem requisição externa;
  - textos fora da arena usam painéis de vidro para manter contraste.

## ADR-012 — Áudio com reverb e harmônicos

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** efeitos anteriores eram funcionais, mas secos e pouco satisfatórios.
- **Decisão:** adicionar compressor, convolver com impulso gerado em memória, harmônicos, pan estéreo e envelopes suaves.
- **Consequências:**
  - timbre mais agradável e espacial;
  - maior custo de CPU no áudio (aceitável);
  - nenhum arquivo de áudio externo;
  - bounce limitado por taxa para evitar saturação.

## ADR-013 — Sequência 🔥 por movimentos sem dano

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** recompensar consistência sem alterar o balanceamento principal.
- **Decisão:** +1 na sequência por parede concluída; zerar ao levar dano. Exibir apenas 🔥 + número no HUD, com animação e som de fogo sutil.
- **Consequências:**
  - feedback positivo a cada parede concluída;
  - reinício/dano limpam a sequência;
  - a sequência persiste entre níveis;
  - não concede vantagem mecânica além do feedback.

## ADR-014 — Firebase Auth Google, perfil e ranking

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** ranking global de streak/níveis e perfil de jogador, com login na tela de morte.
- **Decisão:** usar o projeto Firebase compartilhado `botanicstudio` com Auth Google e Firestore `(default)`, coleção `balljumpProfiles`, SDK modular 10.14.1 carregado sob demanda, regras validadas por UID e CSP/COOP allowlisted.
- **Consequências:**
  - jogo principal continua offline; login/rank exigem rede;
  - perfil mínimo (nome público, scores, timestamp), sem e-mail; a foto opcional foi adicionada depois em ADR-015;
  - regras são compartilhadas com o Botanica e devem ser deployadas juntas;
  - COOP `same-origin-allow-popups` necessário para OAuth;
  - API key é pública; segurança depende das regras e domínios autorizados;
  - login Google real precisa de teste manual.

## ADR-015 — Nick e foto de perfil sem Firebase Storage

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** jogadores querem personalizar o perfil com nick e foto, mantendo o ranking simples e sem custo de Storage.
- **Decisão:** permitir editar `name` e `photo` no documento `balljumpProfiles/{uid}`. A foto é opcional, recortada em 160×160 no navegador, comprimida para JPEG em data URL e limitada a 90.000 caracteres. A gravação usa transação e preserva os scores.
- **Consequências:**
  - não é necessário Firebase Storage nem upload de arquivos;
  - a foto trafega e é armazenada no próprio Firestore;
  - a CSP precisa manter `img-src data:`;
  - as regras precisam validar o prefixo e o tamanho da foto;
  - documentos com foto aumentam o custo de leitura do ranking;
  - nicks e fotos continuam visíveis apenas para usuários autenticados;
  - fallback para a inicial do nick quando não há foto ou o valor é inválido.

## ADR-016 — Unicidade de nick por reserva transacional

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** impedir duas contas com o mesmo nick sem adicionar back-end próprio.
- **Decisão:** criar `balljumpNicknames/{key}` com `uid`, `name` e `updatedAt`. A chave é o nick normalizado (minúsculas, sem acentos, separadores colapsados em `-`). O cliente reserva/libera o nick dentro da mesma transação que grava o perfil. Conflitos retornam `nickname-taken`; no primeiro login, nomes do Google ocupados recebem sufixo automático.
- **Consequências:**
  - duas contas não confirmam o mesmo nick ao mesmo tempo;
  - renomear libera o nick antigo;
  - perfis antigos duplicados são corrigidos no próximo login;
  - reservas são legíveis por usuários autenticados e graváveis apenas pelo dono;
  - a unicidade é garantida pelo fluxo do cliente e pela transação; um cliente malicioso ainda pode criar reservas sem uso, mas não duplicar nicks pela UI;
  - a coleção de reservas é compartilhada no mesmo projeto Firebase do Botanica.

## ADR-017 — Rankings separados por dificuldade

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** scores de dificuldades diferentes não são comparáveis; o jogador precisa de um ranking justo por modo.
- **Decisão:** guardar `scores.{easy,normal,hard,hardcore}.{bestStreak,bestLevel}` no perfil. A corrida pendente inclui `difficulty`; `syncProfile` mescla o resultado apenas no modo correspondente. A UI do ranking ganha um seletor **Geral / Fácil / Normal / Difícil / Hardcore** e consulta `orderBy('scores.<modo>...')`. O ranking **Geral** usa `bestStreak`/`bestLevel`.
- **Consequências:**
  - cada modo tem seu próprio top 10 de streak e níveis;
  - o ranking geral é preservado;
  - perfis antigos sem `scores` aparecem no geral e entram nos modos ao jogar;
  - as consultas usam campos aninhados e dependem dos índices automáticos do Firestore;
  - as regras validam o mapa `scores` e mantêm o schema compatível com perfis antigos;
  - o cache do ranking é por modo e descarta respostas antigas.

## ADR-018 — Volume ajustável e tutorial dentro das configurações

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** o jogador precisa controlar a intensidade dos efeitos e acessar as regras sem voltar ao menu.
- **Decisão:** adicionar `volume` (0–100, padrão 78) às preferências e um slider no modal de configurações. O ganho mestre usa `volume/100 * 0.9`; o slider atualiza em tempo real e persiste em `localStorage`. Adicionar também o botão **Como jogar** nas configurações, abrindo o tutorial por cima do modal; ao fechar, as configurações continuam abertas.
- **Consequências:**
  - o volume é linear e previsível, com 78%≈ganho 0,70 (equivalente ao antigo 0,7);
  - volume 0 silencia sem desligar o contexto de áudio;
  - o tutorial compartilha o mesmo modal, reduzindo duplicação;
  - `inert` é aplicado às configurações enquanto o tutorial está por cima;
  - **Voltar ao jogo** fecha tutorial e configurações e retoma a partida.

## ADR-019 — Modo Doce (match-3) com tempo e ranking próprio

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** adicionar um modo inspirado em Candy Crush, com fases, streak, tempo e ranking próprios.
- **Decisão:** criar um match-3 8×8 em DOM (`#candyBoard`), aberto pelo seletor de modo do botão **Jogar**, com 100 fases. Em vez de vidas, cada fase tem meta de pontos e tempo. A cada 10 fases aumentam os tipos de doce, a meta e a redução de tempo. O resultado é salvo em `candy` (`bestStreak`, `bestLevel`, `bestScore`) e o ranking Doce tem as categorias Streak, Níveis e Pontos. A tela de fim reutiliza o modal existente, mostrando a pontuação apenas no modo doce.
- **Consequências:**
  - o modo clássico permanece intacto e com seus rankings por dificuldade;
  - o tempo pausa quando a aba fica oculta ou um overlay abre;
  - o streak é definido por trocas válidas consecutivas (cascatas dão combo, não streak adicional);
  - o ranking Doce consulta `candy.*` e não se mistura com `scores.*`;
  - o balanceamento de metas/tempos precisa de teste manual nas faixas de 10 fases;
  - o tabuleiro usa DOM e animações CSS, sem dependências externas;
  - as regras do Firestore validam o mapa `candy`.

## ADR-020 — Botão Jogar abre o seletor de modo

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** com dois modos, o menu tinha um botão direto para o modo doce e outro para o clássico, o que duplicava a entrada e não deixava a escolha explícita.
- **Decisão:** o botão **Jogar** abre o modal `#modeModal` com **Modo Clássico** e **Modo Doce**. A escolha inicia o modo correspondente; X, clique fora ou Esc retornam ao menu.
- **Consequências:**
  - o menu fica com **Jogar**, **Ranking** e **Configurações**;
  - o modo doce não tem mais um botão duplicado no menu;
  - `modeOpen` entra no controle de overlays/`inert`;
  - o foco inicial do seletor vai para **Modo Clássico**;
  - ao escolher o modo doce, o foco vai para **← Menu**.

## ADR-021 — Bombas, explosões e fundo compartilhado no modo doce

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** o modo doce precisava de mais impacto, som satisfatório e uma mecânica especial sem criar uma imagem de fundo separada.
- **Decisão:** adicionar o tipo especial `CANDY_BOMB` (fora dos 7 doces), semeado por fase e por chance no refill. Trocar uma bomba com qualquer doce detona a área 3×3; bombas na área entram em cadeia. A explosão usa `Sound.explosion()`, faísca, texto flutuante, células explodindo e tremida. O modo doce usa o mesmo fundo ambiente do clássico, com `body.candy-active` ocultando o `.app` e a `#candyScreen` transparente.
- **Consequências:**
  - bombas não entram em matches normais e sempre dão uma jogada válida;
  - o refill pode criar novas bombas, mantendo a mecânica presente;
  - combos normais usam `Sound.candyPop()`, com `Sound.fire()` em combos grandes;
  - o fundo não duplica SVGs nem imagens;
  - a animação/score de explosão precisa de playtest para balancear;
  - a CSP não muda, pois tudo é CSS/DOM/Web Audio.

## ADR-022 — Configurações no modo doce, menu temático e marca ted-io

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** o modo doce não tinha acesso às configurações; o menu principal usava um overlay genérico e o nome visível ainda era Balljump-game.
- **Decisão:** adicionar uma engrenagem no cabeçalho do modo doce que abre o mesmo `#settingsModal`. No doce, a seção de dificuldade é ocultada, o timer pausa ao abrir e retoma ao fechar; o tutorial aberto pelas configurações retorna a elas. O menu principal passa a usar o fundo ambiente do tema (`body.menu-active` oculta o app) e a marca visível/título passa a ser **ted-io**.
- **Consequências:**
  - o modo doce pausa de verdade enquanto o jogador ajusta tema/som/volume;
  - dificuldade não aparece onde não se aplica;
  - o menu mostra ondas no escuro e fita laranja no claro, sem novo asset;
  - `settingsTitle`, `settingsSubtitle` e a dica mudam conforme o modo;
  - o título da aba e o cartão do menu exibem **ted-io**;
  - o projeto/repositório continuam com os nomes internos existentes.

## ADR-023 — Ranking em famílias Clássico e Doce

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** o ranking misturava dificuldades clássicas e o modo doce em uma única fileira de botões, dificultando a leitura.
- **Decisão:** dividir o ranking em duas famílias principais: **Clássico 🧱** e **Doce 🍪**. No clássico, as abas de dificuldade vão de Geral/Fácil a Hardcore, com Streak e Níveis. No doce, a fileira de dificuldades some e aparecem Streak, Níveis e Pontos. O título acompanha a família/dificuldade.
- **Consequências:**
  - a família Doce sempre abre na aba Pontos; a Clássico abre em Streak;
  - a aba Pontos fica oculta fora da família Doce;
  - `rankFamily`, `rankClassicScope` e `rankDifficulty` separam a navegação e o cache;
  - abrir o ranking pela tela de morte usa a família correta;
  - o layout foi validado em 320/390 px com as novas linhas.

## ADR-024 — 2×2, relâmpago, cadeados e tempo de 60s no modo doce

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** o modo doce precisava de mais variedade tática e de uma progressão de dificuldade baseada em obstáculos, não apenas em mais tipos de doce.
- **Decisão:** aceitar quadrados 2×2 como match; adicionar o especial ⚡ (troca com um doce elimina todos do tipo; duas ⚡ limpam o tabuleiro); limitar os tipos a 6; a partir da fase 21 substituir o sétimo tipo por doces com cadeado, que têm 2 cargas, não podem ser trocados nem caem e são reduzidos por matches/explosões; reduzir o tempo base para 60 s (33 s na fase 100).
- **Consequências:**
  - `candyFindMatches` ganhou a varredura 2×2;
  - `candyState.locks` guarda as cargas e a coluna é colapsada em segmentos entre cadeados;
  - `CANDY_LIGHTNING` é um tipo especial separado de bombas;
  - o alvo do ⚡ é decidido antes da troca, garantindo o tipo correto;
  - efeitos e sons novos: `Sound.lightning()`, `Sound.lockHit()`, flash e células zap;
  - o balanceamento dos cadeados e do tempo de 60 s precisa de playtest.

## ADR-025 — Meta do modo doce começa em 750 e sobe 500 a cada 5 fases

- **Data:** 2026-11-16
- **Status:** aceita (revisada)
- **Contexto:** a meta anterior crescia por fase (35 + bônus por faixa), gerando valores pouco previsíveis e quase lineares. O jogador precisava de uma progressão clara e fácil de comunicar, com um começo um pouco menos trivial que 500 pontos.
- **Decisão:** `candyTargetScore(level)` passa a ser `750 + floor((level − 1) / 5) × 500`. Ou seja: 750 pontos nas fases 1–5, 1.250 nas fases 6–10, +500 a cada bloco de 5 fases, chegando a 10.250 na fase 100.
- **Consequências:**
  - a meta é 750 + múltiplos de 500 e cada bloco de 5 fases tem o mesmo alvo;
  - o tempo continua caindo a cada 10 fases (60 s → 33 s), então os blocos finais exigem mais pontos no mesmo tempo;
  - simulação com bot guloso confirmou que 10.250 pontos são alcançáveis em ~10 jogadas na fase 100 (33 s);
  - a barra de progresso e as mensagens usam `candyState.target`, sem mudanças adicionais.

## ADR-026 — Spawn de ⚡ reduzido

- **Data:** 2026-11-16
- **Status:** aceita
- **Contexto:** o relâmpago aparecia com frequência próxima à das bombas, o que tornava as limpezas de tipo (e a sobrecarga de duas ⚡) comuns demais e achatava a dificuldade.
- **Decisão:** reduzir `candyLightningChance` para `min(0,018; 0,002 + fase × 0,00015)` (cerca de metade da chance anterior) e atrasar/reduzir os seeds: nenhum ⚡ antes da fase 8 (antes era 5), 1 entre as fases 8–59 (antes 2 a partir da 50) e 2 a partir da fase 60.
- **Consequências:**
  - o ⚡ fica mais raro que as bombas em todas as fases;
  - a fase 100 fica em ~1,8% de chance por doce novo, contra 3,5% antes;
  - `candyHasMove` continua tratando ⚡ como jogada válida, sem mudanças;
  - a frequência ainda precisa de playtest em runs longas.

## ADR-027 — Bomba + bomba gera explosão dupla

- **Data:** 2026-11-16
- **Status:** aceita
- **Contexto:** trocar duas bombas não tinha nenhum efeito especial: o resultado era só a soma de duas explosões 3×3, sem recompensa visual ou de pontos à altura do risco.
- **Decisão:** quando as duas células trocadas são bombas, `candyExplodeBombs` ativa o modo `mega`: `candyExplosionSet` usa raio 2 (5×5) ao redor de cada bomba inicial, bombas em cadeia continuam com raio 1, e a jogada ganha +500 pontos, multiplicadores maiores por célula/bomba/cadeado.
- **Consequências:**
  - duas bombas adjacentes podem limpar até 30 células (contra 9 de uma bomba sozinha);
  - efeitos novos: `.candy-mega-flash`, `.is-mega-shaking`, blasts `is-mega` maiores e `Sound.megaExplosion()`;
  - a mensagem “💥 Explosão dupla!” pode ser substituída pelo combo da cascata seguinte;
  - cadeados atingidos pela explosão dupla perdem carga normalmente.

## ADR-028 — Modo Flappy com 500 canos e ranking próprio

- **Data:** 2026-11-16
- **Status:** aceita (revisada em 2026-11-17: meta passou de 500 fases para 500 canos)
- **Contexto:** o produto já tinha Clássico e Doce; faltava um terceiro modo arcade rápido, com os mesmos conceitos de fase, sequência e ranking, mas com desafio e duração próprios.
- **Decisão:** adicionar um modo **Flappy** em canvas próprio (480×640 lógicos) com **500 canos no total**, 3 vidas e progressão por canos. O jogador toca/clica ou usa **Espaço/↑/W** para bater as asas; passar por um cano pontua e completa o total. As fases continuam como blocos de dificuldade de 4–8 canos; completar todos os canos da fase avança de fase e aumenta a sequência. Bater em cano ou chão custa uma vida, zera a sequência e reinicia os canos/progresso da fase, mas preserva o total de canos. O resultado usa `mode:'flappy'` e grava `flappy.bestStreak`, `flappy.bestLevel` (`min(500, canos + 1)`, ou 500 na vitória) e `flappy.bestScore`.
- **Consequências:**
  - o seletor de modo passa a listar Clássico, Doce e Flappy;
  - o ranking ganha a família **Flappy 🐦** com Streak/Canos/Pontos, sem misturar com `scores.*` ou `candy`;
  - as regras do Firestore validam `flappy` com `bestLevel` entre 1 e 500;
  - 500 canos exigem balanceamento de velocidade/vão e um teste de longa duração separado;
  - a tela de fim reutiliza `#deathModal` com textos de “500 CANOS”/“VIDAS ESGOTADAS”.

## ADR-029 — Tutorial contextual por modo

- **Data:** 2026-11-17
- **Status:** aceita
- **Contexto:** o botão **Como jogar** das configurações abria sempre o tutorial do Clássico, mesmo quando o jogador estava no Doce ou no Flappy.
- **Decisão:** manter um único `#tutorialModal` com três seções estáticas (`data-tutorial-mode` para Clássico, Doce e Flappy). `renderTutorialMode` detecta o modo ativo por `flappyOpen`/`candyOpen` (menu cai no Clássico), ajusta o título para “Como jogar · Modo” e mostra apenas a seção correspondente.
- **Consequências:**
  - o tutorial explica as regras, controles e objetivos do modo em que o jogador está;
  - o modal continua único e sem duplicar lógica de abertura/fechamento;
  - novas regras de um modo exigem atualizar apenas a seção dele;
  - o guia do modo ativo deve ser validado ao abrir as configurações pelo menu, pelo Clássico, pelo Doce e pelo Flappy.
