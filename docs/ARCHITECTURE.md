# Arquitetura — Balljump-game

## 1. Visão geral

O projeto é um aplicativo estático de arquivo único. O navegador baixa `index.html`, que contém markup, CSS e JavaScript. Não há servidor de aplicação, banco de dados, API ou dependências externas em runtime.

```text
Navegador
  └── index.html
        ├── CSS (tokens de tema, layout, liquid glass)
        ├── HTML (HUD, menu, tutorial, modais, canvas)
        └── JavaScript
              ├── constantes e estado
              ├── áudio (Web Audio API)
              ├── lógica do jogo
              ├── renderização 2D (Canvas)
              ├── interface e overlays
              └── persistência local (localStorage)
```

## 2. Mapa de arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | Aplicação completa: UI, estilos, lógica, renderização e áudio. |
| `_headers` | Headers HTTP de segurança para o Cloudflare Pages. |
| `AGENTS.md` | Ponto de entrada de contexto e regras para agentes. |
| `docs/` | Contexto, arquitetura, segurança, decisões e testes. |
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
| `GOAL_PCT` | `95` | Meta de preenchimento. |
| `MAX_LEVEL` | `100` | Último nível. |
| `STEP_MS` | `1000 / 60` | Passo fixo da simulação. |

Valores do grid:

- `EMPTY = 0`
- `WALL = 1`
- `BUILD = 2`

O estado global `state` contém:

- `grid`, `balls`, `build`;
- `level`, `lives`, `difficulty`, `theme`, `dir`;
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
- Tema: variáveis CSS em `html` e paleta do canvas em `THEMES.dark` / `THEMES.light`.
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
- `failBuild(ball)`: limpa blocos em construção, perde vida, efeitos e áudio.
- `completeBuild()`: converte `BUILD` em `WALL`, dispara flood fill e progresso.

Intervalo de crescimento: `difficulty.divisor * 23` ms por bloco.

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
- tutorial: `#tutorialModal`;
- configurações: `#settingsModal`;
- overlay de nível/game over/vitória: `#overlay`;
- HUD, toast e meta-informações.

Controle de sobreposição:

- `menuOpen`, `tutorialOpen`, `modalOpen`;
- `syncOverlayLock()` aplica `inert` no conteúdo de fundo, bloqueia scroll do body e libera ao fechar;
- foco é enviado para o overlay ativo;
- `Escape` fecha tutorial/configurações;
- o jogo não inicia até **Jogar**.

## 11. Áudio

O módulo `Sound` encapsula:

- criação preguiçosa de `AudioContext`;
- compressor master;
- tons sintetizados;
- bipe contínuo de construção;
- efeitos de sucesso, perda de vida, fanfarra, vitória e quique;
- ativação/desativação persistida.

O áudio é desbloqueado no primeiro gesto do usuário; se o contexto estiver suspenso, `resume()` é chamado.

## 12. Persistência

- Chave: `kbounce.settings.v1`.
- Campos: `theme`, `difficulty`, `sound`.
- Leitura/escrita em `localStorage` com tratamento de exceção para modo privado.
- Nenhum dado pessoal é coletado.
- O valor é tratado como preferência, nunca como fonte de segurança.

## 13. Deploy e segurança de entrega

- Cloudflare Pages, projeto `balljump-game`.
- Diretório publicado: `dist/`, gerado por `scripts/prepare-deploy.mjs`.
- O staging usa allowlist: apenas `index.html`, `404.html` e `_headers`. Documentação e contexto não são publicados.
- Deploy manual:
  ```powershell
  node scripts/prepare-deploy.mjs
  npx wrangler pages deploy dist --project-name balljump-game --branch main --commit-dirty=true
  ```
- `_headers` define CSP e headers de proteção. Ver `docs/SECURITY.md`.
- O deploy atual não é conectado ao GitHub; o push não publica automaticamente.
- O repositório é privado.

## 14. Extensibilidade

Se o projeto crescer além de um arquivo:

1. abrir uma ADR justificando a mudança;
2. separar em módulos ES, mantendo build zero-dependência;
3. migrar a CSP para hashes/nonces;
4. adicionar testes automatizados;
5. atualizar esta arquitetura e o manifesto de contexto.

Não introduza framework ou bundler sem uma necessidade concreta e uma decisão registrada.
