# Contexto do projeto — Balljump-game

> Última revisão: 2026-11-15
> Fonte de verdade do comportamento: `index.html`. Este documento descreve a intenção, as regras e o estado esperado.

## 1. Visão

Balljump-game é um jogo casual de estratégia para navegador, inspirado no clássico JezzBall. O jogador constrói paredes para dividir a arena e isolar bolinhas. Áreas fechadas sem bolinhas são preenchidas automaticamente. O objetivo é preencher **75%** da área interna antes de perder todas as vidas.

O projeto tem uma restrição deliberada: **todo o runtime fica em um único `index.html`**, sem dependências, sem back-end e sem chamadas de rede. A documentação de contexto e segurança é externa ao runtime.

## 2. Público e experiência

- **Público:** jogadores casuais em desktop e celular.
- **Sessão típica:** partidas curtas, progressão por níveis, reinício rápido.
- **Prioridades de UX:**
  1. entender o objetivo em poucos segundos;
  2. construir paredes com precisão;
  3. feedback claro de sucesso, falha, vida e progresso;
  4. funcionar bem com toque e com mouse;
  5. não exigir instalação, login ou conexão após o carregamento.

## 3. Regras atuais

### Arena

- Dimensões lógicas: **600 × 400 px**.
- Bloco: **20 × 20 px** (`TILE`).
- Grid: **30 colunas × 20 linhas**.
- Borda: parede sólida permanente.
- Área interna jogável: **28 × 18 = 504 células**.
- Meta: **75%** da área interna; `GOAL_CELLS = ceil(504 × 0,75) = 378`.

### Construção de paredes

- Clique esquerdo ou toque em uma célula vazia inicia uma parede.
- A parede cresce em duas direções opostas: horizontal ou vertical.
- A direção é alternada pelo botão **HORIZ/VERT**, pelo clique direito ou pela tecla `Espaço`.
- Se uma bolinha tocar na parede durante o crescimento:
  - a parede é destruída;
  - o jogador perde **1 vida**;
  - a célula inicial e os blocos em construção são liberados.
- Se a parede alcançar extremidades sólidas sem ser atingida, ela se torna parede fixa.

### Flood fill

Ao concluir uma parede, o jogo procura regiões vazias conectadas. Toda região que **não contenha nenhuma bolinha** é convertida em parede e conta para a porcentagem.

### Bolinhas

- Nível 1 começa com **2 bolinhas**.
- A cada **2 níveis**, entra **+1 bolinha**.
- Velocidade base: **1.2 px por passo fixo de 1/60 s**.
- Direção diagonal com pequena variação aleatória de ângulo.
- Colisão axis-aligned com o grid.
- Bolinhas não colidem entre si.

### Níveis e vidas

- **100 níveis**.
- Ao concluir **cada fase**, o jogador ganha **+1 vida**.
- Vidas zeradas: **Game Over** e reinício no nível 1.
- Nível 100 concluído: tela de vitória.
- Dificuldades:
  - Fácil: 5 vidas, parede quase instantânea (`divisor = 2`, 1 ms por bloco, até 32 passos por atualização).
  - Normal: 3 vidas, velocidade média (`divisor = 3`).
  - Difícil: 2 vidas, parede lenta (`divisor = 4`).
  - Hardcore: 1 vida, parede bem lenta (`divisor = 6`).
- Alterar dificuldade reinicia no nível 1.

### Sequência 🔥

- Cada **parede concluída com sucesso** aumenta a sequência em **+1**.
- Levar dano (parede destruída por bolinha) **zera** a sequência.
- A sequência persiste entre níveis; é zerada em um novo jogo/reinício.
- O HUD mostra 🔥 + número apenas; o ícone pulsa e emite um som de fogo sutil ao aumentar.
- O contador é apenas visual/sonoro; não altera velocidade, pontuação ou vidas.

### Áudio

- Web Audio API, sintetizado em tempo real, sem arquivos de mídia.
- Cadeia com compressor, barramento seco, reverb por convolução e pan estéreo.
- Tons com harmônicos e envelopes suaves.
- Bipe contínuo durante a construção.
- Arpejo ascendente com sinos ao concluir parede.
- Queda grave e macia ao perder vida.
- Fanfarra e acorde de vitória.
- Quique sutil com variação de tom e posição estéreo.
- O contexto de áudio é desbloqueado por gesto do usuário.

### Interface

- Tela de menu ao entrar, com **Jogar**, **Configurações** e **Como jogar**.
- Tutorial em modal, com regras e controles para PC e celular.
- HUD: sequência, nível, vidas, área, direção, configurações.
- Botão de compartilhar removido por decisão de produto.
- Modo **Escuro**: preto e laranja.
- Modo **Claro**: laranja e branco.
- Fundo ambiente em SVG inline: ondas desfocadas à direita no tema escuro e fita laranja desfocada sobre creme no tema claro.
- Estética “liquid glass”, com brilho reduzido.
- Configurações pausam o jogo; fechar retorna ao jogo ou ao menu, conforme a origem.
- Preferências persistidas em `localStorage` (`kbounce.settings.v1`).

## 4. Fora de escopo

- Back-end, contas de usuário, ranking online, analytics ou publicidade.
- Multijogador.
- Dependências de runtime, CDNs, fontes externas ou arquivos de mídia.
- Coleta de dados pessoais.
- Aplicativo nativo.
- Sistema de compartilhamento.

## 5. Estado atual

- Publicado em Cloudflare Pages: https://balljump-game.pages.dev
- Repositório GitHub privado: `Xolotzx/Balljump-game`
- Branch principal: `main`
- Deploy atual: **upload direto** pelo Wrangler a partir de `dist/` (allowlist: jogo, página 404 e headers); `git push` não dispara deploy automático.
- Documentação interna (`docs/`, `AGENTS.md`, `context/`) não é publicada no site.
- Headers de segurança declarados em `_headers`.
- Sem CI/CD e sem suíte automatizada de navegador.

## 6. Limitações e riscos conhecidos

- Toda a lógica está em um único arquivo, o que aumenta o custo de leitura por agentes; use busca por símbolos.
- A CSP precisa permitir scripts e estilos inline porque o runtime é single-file. É um trade-off consciente (ver ADR-006).
- `localStorage` pode ser alterado pelo usuário; nunca trate esses valores como confiáveis para segurança.
- Não há testes automatizados de gameplay; a validação é manual (ver `docs/TESTING.md`).
- Cloudflare não está conectado ao repositório; publicações são manuais.
- Níveis altos podem gerar muitas bolinhas (até 51 no nível 100); monitorar desempenho em dispositivos modestos.

## 7. Próximos passos sugeridos

1. Adicionar testes de navegador (Playwright ou similar) para menu, jogo e mobile.
2. Conectar o Cloudflare Pages ao GitHub para deploy automático com revisão.
3. Avaliar CSP com hash/nonce caso o runtime deixe de ser single-file.
4. Adicionar verificação de acessibilidade automatizada.
5. Medir performance em hardware móvel modesto.

## 8. Como usar este documento

- Antes de mudar regras, confirme se a mudança é intencional e atualize este arquivo.
- Se o código e este documento divergirem, investigue: o comportamento observado no código é a fonte de verdade; depois alinhe a documentação.
- Não copie segredos, tokens ou dados pessoais para este documento.
