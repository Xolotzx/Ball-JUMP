# Arquitetura — ted-io

## 1. Visão geral

O núcleo do projeto é um aplicativo estático de arquivo único. O navegador baixa `index.html`, que contém markup, CSS e JavaScript. Não há servidor de aplicação nem banco de dados próprio. Firebase Authentication e Firestore são usados apenas para login, perfil e ranking, carregados sob demanda; o jogo principal funciona offline.

```text
Navegador
  └── index.html
        ├── CSS (tokens de tema, layout, liquid glass)
        ├── HTML (HUD, menu, tutorial, modais, death/rank, canvas)
        └── JavaScript
              ├── constantes e estado
              ├── áudio (Web Audio API)
              ├── lógica do jogo
              ├── renderização 2D (Canvas)
              ├── interface e overlays
              ├── persistência local (localStorage)
              └── Firebase sob demanda
                    ├── Auth Google
                    └── Firestore (balljumpProfiles)
                    ↑ SDK modular 10.14.1 via gstatic
```

## 2. Mapa de arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | Aplicação completa: UI, estilos, lógica, renderização e áudio. |
| `_headers` | Headers HTTP de segurança para o Cloudflare Pages. |
| `AGENTS.md` | Ponto de entrada de contexto e regras para agentes. |
| `docs/` | Contexto, arquitetura, segurança, Firebase, decisões e testes. |
| `context/manifest.json` | Mapa do contexto legível por máquina. |
| `scripts/check-context.mjs` | Verificação local de invariantes e sinais de segredo. |
| `README.md` | Apresentação e links. |
| `SECURITY.md` | Política de relato de vulnerabilidades. |

## 3. Constantes e modelo de dados

Constantes principais em `index.html`:

| Constante | Valor | Significado |
|---|---|---|
| `GAME_W`, `GAME_H` | `600`, `400` | Dimensões lógicas do canvas. |
| `TILE` | `20` | Tamanho do bloco. |
| `COLS`, `ROWS` | `30`, `20` | Grid. |
| `BALL_R` | `6.5` | Raio de colisão da bolinha. |
| `SPEED` | `1.2` | Velocidade por passo fixo. |
| `GOAL_PCT` | `75` | Meta de preenchimento. |
| `MAX_LEVEL` | `100` | Último nível. |
| `STEP_MS` | `1000 / 60` | Passo fixo da simulação. |

Valores do grid:

- `EMPTY = 0`
- `WALL = 1`
- `BUILD = 2`

O estado global `state` contém:

- `grid`, `balls`, `build`;
- `level`, `lives`, `streak`, `runBestStreak`, `difficulty`, `theme`, `dir`;
- `phase` (`playing`, `levelup`, `gameover`, `victory`);
- `paused`, `transition`, `filled`, `progress`;
- efeitos visuais (`fills`, `particles`, `shake`, `flash`);
- `hover`, `sceneDirty`, `time`.

## 4. Loop e tempo

- `requestAnimationFrame` mantém o loop.
- A física usa um acumulador de passo fixo de `STEP_MS` (60 Hz), com limite de passos para evitar espirais de tempo.
- `state.paused`, `modalOpen`, `tutorialOpen`, `menuOpen` e `document.hidden` interrompem a simulação.
- A renderização continua acontecendo para desenhar o fundo/estado congelado mesmo quando pausado.

Fluxo de um frame:

```text
requestAnimationFrame
  ├── calcula delta limitado
  ├── se não pausado: consome passos fixos e chama update()
  └── draw(): renderiza cena em cache + elementos dinâmicos
```

## 5. Renderização

- Canvas principal: `#game`, escala lógica 600×400, ajustado por `devicePixelRatio` (máximo 2).
- Cena estática (`sceneCanvas`): fundo, grade, paredes e moldura são desenhados em um canvas auxiliar de 2× e reutilizados até `sceneDirty = true`.
- Elementos dinâmicos: paredes em construção, preenchimentos animados, hover, bolinhas, partículas, flash e shake.
- Tema: variáveis CSS em `html` e paleta do canvas em `THEMES.dark` (preto/laranja) / `THEMES.light` (laranja/branco).
- Fundo ambiente: SVG inline; ondas laranja desfocadas e deslocadas para a direita no tema escuro e uma fita laranja desfocada no tema claro. Decorativo, sem dependência externa.
- A estética “liquid glass” fica no CSS; o canvas usa cores e brilho reduzido.

### Cache de cena

`markSceneDirty()` é chamado ao:
- concluir parede;
- executar flood fill;
- iniciar/reiniciar nível;
- trocar o modo de aparência.

## 6. Construção de paredes

Funções principais:

- `tryBuild(px, py)`: valida célula e inicia `state.build`.
- `updateGrowth(dt)`: consome intervalos e chama `growStep`.
- `growStep(build)`: expande os dois lados, marca `BUILD`, verifica colisão.
- `ballTouchesBuild()`: colisão bolinha × parede em construção.
- `failBuild(ball)`: limpa blocos em construção, perde vida, **zera a sequência** e efeitos/áudio.
- `completeBuild()`: converte `BUILD` em `WALL`, incrementa a sequência, atualiza o HUD, toca o som de fogo e dispara flood fill/progresso.

Intervalo de crescimento: `difficulty.divisor * 23` ms por bloco; no modo Fácil, `1 ms` com até 32 passos por atualização (quase instantâneo).

## 7. Flood fill e progresso

- `floodFill()` percorre regiões vazias com DFS.
- Uma região é preenchida se não contém a célula central de nenhuma bolinha.
- Células preenchidas entram em `state.fills` para efeito visual.
- `refreshProgress()` conta paredes internas e atualiza HUD.
- `completeLevel()` é chamado quando `state.filled >= GOAL_CELLS`.

## 8. Física das bolinhas

- Movimento em eixos separados (`moveAxis`).
- A colisão é resolvida contra tiles `WALL` com círculo × retângulo.
- Ao colidir, a posição é corrigida e a velocidade do eixo é invertida.
- Um clamp de segurança mantém a bolinha dentro da área.
- `Sound.bounce()` é limitado por taxa para não saturar o áudio.

## 9. Níveis e dificuldade

- `beginLevel(level)` recria grid, bolinhas e progresso, mantendo vidas.
- `ballCountForLevel(level) = 2 + floor((level - 1) / 2)`.
- Ao concluir fase, `completeLevel()` adiciona **+1 vida** e mostra overlay.
- `advanceLevel()` inicia o próximo nível.
- `restartGame()` restaura vidas da dificuldade e volta ao nível 1.
- Dificuldade altera vidas iniciais e `divisor` de velocidade da parede.

## 10. Interface e estado de overlays

Componentes de UI:

- menu inicial: `#startMenu`;
- seletor de modo: `#modeModal` (Clássico ou Doce);
- tutorial: `#tutorialModal`;
- configurações: `#settingsModal` (acessível no HUD clássico e pela engrenagem do modo doce);
- menu principal sobre o fundo ambiente do tema; `body.menu-active` oculta o `.app` clássico e `body.candy-active` oculta no modo doce.
- overlay de nível/game over/vitória: `#overlay`;
- HUD, toast e meta-informações;
- HUD clássico inclui **← Menu**, que pausa a partida e abre o menu; **Jogar → Clássico** retoma o estado.
- chip de sequência `#streakChip` com apenas 🔥 + número, oculto quando a sequência é zero;
- tela de fim de jogo: `#deathModal` com estatísticas, login Google, perfil e acesso ao ranking;
- ranking: `#rankModal` com famílias Clássico/Doce, dificuldades no clássico e abas de streak/níveis/pontos; top 10.
- configurações incluem volume (0–100%) e botão **Como jogar**.

Controle de sobreposição:

- `menuOpen`, `tutorialOpen`, `modalOpen`, `deathOpen`, `rankOpen`, `profileOpen`, `candyOpen`, `modeOpen`;
- `syncOverlayLock()` aplica `inert` no conteúdo de fundo, bloqueia scroll do body e libera ao fechar;
- foco é enviado para o overlay ativo;
- o tutorial aberto pelas configurações fica por cima delas; ao fechar, as configurações continuam abertas (exceto em **Voltar ao jogo**);
- `Escape` fecha tutorial/configurações;
- o jogo não inicia até **Jogar**.

## 11. Áudio

O módulo `Sound` encapsula:

- criação preguiçosa de `AudioContext`;
- compressor master e barramento seco;
- convolver com impulso gerado em memória para reverb;
- tons com harmônicos, envelopes suaves e pan estéreo;
- bipe contínuo de construção;
- efeitos de sucesso, perda de vida, fanfarra, vitória e quique;
- volume mestre 0–100% (ganho linear até 0,9) persistido e ajustável em tempo real;
- ativação/desativação persistida.

O áudio é desbloqueado no primeiro gesto do usuário; se o contexto estiver suspenso, `resume()` é chamado.

O fundo ambiente usa SVG inline: ondas laranja desfocadas e deslocadas para a direita no tema escuro e uma fita laranja desfocada no tema claro; não há imagem externa.

## 12. Persistência

- Chave: `kbounce.settings.v1`.
- Campos: `theme`, `difficulty`, `sound`, `volume` (0–100).
- Leitura/escrita em `localStorage` com tratamento de exceção para modo privado.
- Nenhum dado pessoal é coletado.
- O valor é tratado como preferência, nunca como fonte de segurança.

## 13. Deploy e segurança de entrega

- Cloudflare Pages, projeto `ted-io`.
- Diretório publicado: `dist/`, gerado por `scripts/prepare-deploy.mjs`.
- O staging usa allowlist: apenas `index.html`, `404.html` e `_headers`. Documentação e contexto não são publicados.
- Deploy manual:
  ```powershell
  node scripts/prepare-deploy.mjs
  npx wrangler pages deploy dist --project-name ted-io --branch main --commit-dirty=true
  ```
- `_headers` define CSP e headers de proteção. Ver `docs/SECURITY.md`.
- O deploy atual não é conectado ao GitHub; o push não publica automaticamente.
- O repositório é privado.

## 14. Firebase, perfil e ranking

- Projeto compartilhado: `botanicstudio` (mesmo Firebase do Botanica Studio).
- SDK modular **10.14.1** importado dinamicamente de `https://www.gstatic.com/firebasejs/10.14.1/` somente ao abrir a tela de morte/ranking ou iniciar login.
- Auth: Google via `signInWithPopup`, com fallback para `signInWithRedirect`.
- Firestore: banco `(default)`, coleção `balljumpProfiles/{uid}` com `name`, `photo`, `bestStreak`, `bestLevel`, `scores`, `updatedAt`.
- No game over/vitória, a corrida é salva em `sessionStorage` com `difficulty` até o login/submissão; depois é enviada com `runTransaction`.
- Melhores scores são monotônicos (`max`) e `updatedAt` usa `serverTimestamp`.
- `scores` guarda `{ bestStreak, bestLevel }` por dificuldade (`easy`, `normal`, `hard`, `hardcore`). A chave só é criada quando o jogador conclui uma corrida naquele modo. Os campos globais continuam sendo o máximo histórico.
- Perfil editável em `#profileModal`:
  - nick de 1 a 30 caracteres, normalizado e renderizado com `textContent`;
  - foto opcional processada em canvas 160×160 via `createImageBitmap` (fallback
    `FileReader` + data URL), JPEG com qualidade decrescente, limitada a 90.000
    caracteres e validada como data URL; sem blob URL por causa da CSP;
  - `saveProfileEdits` usa transação, preserva scores e atualiza o cache `fb.profile`.
- `syncProfile` preserva `name`/`photo`/`scores` existentes; só usa o nome do Google na
  criação do perfil e mescla a corrida pendente apenas no modo correspondente.
- Unicidade de nick:
  - `nicknameKeyFor()` normaliza o nick (minúsculas, sem acentos, separadores
    colapsados) e `claimNickname()` reserva a chave em `balljumpNicknames/{key}`;
  - o salvamento e a sincronização usam transação, então duas contas não
    conseguem confirmar o mesmo nick;
  - nomes do Google já ocupados recebem sufixo automático no primeiro login;
  - ao renomear, a reserva antiga é apagada na mesma transação.
- Avatares (perfil e linhas do ranking) usam `background-image` com data URL
  validada; sem foto, mostram a inicial do nick.
- Ranking:
  - famílias principais **Clássico 🧱** e **Doce 🍪**;
  - **Clássico 🧱**: abas **Geral / Fácil / Normal / Difícil / Hardcore**, com
    **Streak** e **Níveis**;
  - **Doce 🍪**: abas **Streak**, **Níveis** e **Pontos** (a aba Pontos só aparece
    nessa família);
  - título dinâmico: “Ranking clássico — Fácil”, “Ranking doce”, etc.;
  - consultas por modo: `orderBy('scores.<modo>.bestStreak'|'bestLevel')`;
  - modo **Geral**: `orderBy('bestStreak'|'bestLevel')`;
  - modo **Doce**: `orderBy('candy.bestStreak'|'bestLevel'|'bestScore')`;
  - cache por modo em `rankData[modo]`, com `rankRequest` para descartar respostas
    antigas ao trocar de modo rapidamente.
- Leitura exige autenticação; escrita apenas pelo UID do usuário. Regras publicadas no projeto compartilhado.
- CSP permite somente gstatic/Firebase/Google Auth e `img-src data:`; COOP `same-origin-allow-popups` para o popup OAuth.
- O jogo principal não depende de Firebase. Falha de rede não bloqueia o reinício.

## 15. Modo Doce (match-3)

- Tela própria `#candyScreen`, aberta pela opção **Modo Doce** do seletor de modo.
- Tabuleiro DOM 8×8 (`#candyBoard`) com até 6 tipos de doce; o tipo é aplicado por
  `data-type` e o glifo vem de `CANDY_TYPES`.
- Geração inicial sem matches e com pelo menos uma jogada possível.
- Troca de células adjacentes por clique/toque; combinações válidas são 3+ em
  linha/coluna **ou um quadrado 2×2**. Troca sem combinação é desfeita e zera a
  sequência.
- Bombas (`CANDY_BOMB`) aparecem no tabuleiro (seed por fase + chance no refill),
  não entram em matches e explodem quando trocadas com qualquer doce:
  - a explosão limpa a área 3×3 ao redor;
  - bombas dentro da área entram em cadeia;
  - o dano soma pontos, faíscas, texto flutuante, tremida e `Sound.explosion()`;
  - depois do refill, cascatas normais continuam com `Sound.candyPop()`.
- Relâmpago (`CANDY_LIGHTNING`, ⚡) aparece por seed/chance. Trocado com um doce,
  elimina **todos** os doces daquele tipo; duas ⚡ juntas causam uma sobrecarga
  que atinge o tabuleiro inteiro. Usa `Sound.lightning()`, flash e células
  `is-zapped`.
- Cadeados: a partir da fase 21, `candyState.locks` marca doces com 2 cargas.
  Eles não podem ser trocados e não caem; matches, bombas e ⚡ reduzem a carga.
  Com 2 detonações o doce some. `candyCollapseAndRefill` divide cada coluna em
  segmentos entre cadeados, então os doces acima/abaixo não passam por eles.
- O fundo do modo doce é transparente sobre o mesmo fundo ambiente do clássico
  (body + `.wave-bg`/`.ribbon-bg`); o `.app` fica oculto enquanto `body.candy-active`.
- `candyFindMatches` detecta runs horizontais/verticais e quadrados 2×2;
  `candyCollapseAndRefill` remove, colapsa e preenche; cascatas geram combos e
  multiplicam pontos. `candyHasMove` ignora trocas com cadeados e considera
  bombas/relâmpagos como jogadas válidas.
- Pontuação: `doces × 50 × combo`; a sequência sobe +1 por troca válida.
- 100 fases; cada fase tem meta (`candyTargetScore`) e tempo (`candyTimeLimit`)
  próprios, sem vidas. O tempo base é 60 s e cai 3 s a cada 10 fases (33 s na
  fase 100). É controlado por `setInterval` de 250 ms e pausa quando a aba fica
  oculta ou o overlay abre.
- A cada 5 fases a meta sobe 500 pontos (`candyTargetScore`): 500 nas fases 1–5,
  1.000 nas fases 6–10, e assim por diante até 10.000 na fase 100. Os tipos vão
  de 5 para 6 na fase 11 e, a partir da fase 21, o desafio extra são os cadeados
  (sem sétimo tipo).
- Fase concluída → próxima fase; fase 100 → vitória. Tempo esgotado → fim da run.
- O resultado usa `mode:'candy'` e grava `candy.bestStreak`, `candy.bestLevel` e
  `candy.bestScore`; o ranking Doce tem abas Streak/Níveis/Pontos.
- O modal de fim de jogo reutiliza `#deathModal`, mostrando a estatística de
  pontos apenas no modo doce; **Menu** sai para o menu e **Jogar novamente**
  reinicia o modo doce.
- A engrenagem do cabeçalho abre `#settingsModal` sobre o modo doce: a seção de
  dificuldade fica oculta, o timer pausa e, ao fechar (ou voltar do tutorial),
  o timer retoma. Tema, som, volume e **Como jogar** continuam disponíveis.

## 16. Extensibilidade

Se o projeto crescer além de um arquivo:

1. abrir uma ADR justificando a mudança;
2. separar em módulos ES, mantendo build zero-dependência;
3. migrar a CSP para hashes/nonces;
4. adicionar testes automatizados;
5. atualizar esta arquitetura e o manifesto de contexto.

Não introduza framework ou bundler sem uma necessidade concreta e uma decisão registrada.
