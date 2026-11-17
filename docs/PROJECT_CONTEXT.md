# Contexto do projeto — ted-io

> Última revisão: 2026-11-15
> Fonte de verdade do comportamento: `index.html`. Este documento descreve a intenção, as regras e o estado esperado.

## 1. Visão

**ted-io** é um site de jogos casuais para navegador com três modos. No **Clássico**, inspirado no JezzBall, o jogador constrói paredes para dividir a arena e isolar bolinhas; áreas fechadas sem bolinhas são preenchidas automaticamente e o objetivo é preencher **75%** da área antes de perder todas as vidas. No **Doce**, um match-3 de 100 fases, o jogador troca doces, cumpre metas e administra o tempo. No **Flappy**, um voo entre canos com meta de 500 canos no total, o jogador bate as asas para passar pelos canos e sobrevive com 3 vidas.

O projeto tem uma restrição deliberada: **o núcleo do jogo fica em um único `index.html`** e funciona offline. A única dependência externa é o SDK modular do Firebase, carregado sob demanda para login Google e ranking; não há back-end próprio. A documentação de contexto e segurança é externa ao runtime.

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
- Volume mestre ajustável de 0 a 100% (padrão 78%), persistido nas preferências.
- O contexto de áudio é desbloqueado por gesto do usuário.

### Interface

- Tela de menu ao entrar, com **Jogar**, **Ranking** e **Configurações**.
- O menu principal usa o fundo ambiente do tema (ondas no escuro, fita laranja no claro) e oculta o app clássico atrás.
- **Jogar** abre um seletor com **Modo Clássico**, **Modo Doce** e **Modo Flappy**.
- **Configurações** ficam disponíveis no clássico e também nos modos doce e flappy (engrenagem no cabeçalho); nesses modos a seção de dificuldade é ocultada e o jogo pausa.
- **Modo Doce**: match-3 8×8, 100 fases, tempo em vez de vidas, metas de pontos e dificuldade crescente.
- A meta é 750 pontos nas fases 1–5 e sobe **500 a cada 5 fases**, chegando a 10.250 na fase 100.
- Combinações válidas: 3+ em linha/coluna ou um quadrado 2×2 do mesmo tipo.
- O especial **⚡** trocado com um doce elimina todos os doces daquele tipo; duas ⚡ juntas limpam o tabuleiro.
- A partir da fase 21 aparecem doces com **cadeado** (2 detonações para sumir); eles não podem ser trocados e não caem, mas podem ser atingidos por matches, bombas ou ⚡.
- O tempo base é 60 s e cai a cada 10 fases, até 33 s na fase 100.
- Bombas aparecem no tabuleiro doce e explodem a área 3×3 ao serem trocadas com qualquer doce; bombas vizinhas entram em cadeia.
- Trocar **bomba + bomba** produz uma explosão dupla: 5×5 ao redor de cada bomba, +500 de bônus e efeitos/som mais fortes.
- Explosões usam som próprio, faísca, texto de pontos e tremida; o fundo ambiente é o mesmo do modo clássico (ondas/fita).
- No modo doce, cada troca válida aumenta a sequência; troca inválida zera. Cascatas geram combos e mais pontos.
- O modo doce termina quando o tempo chega a zero ou na vitória da fase 100; o resultado entra no ranking próprio.
- **Modo Flappy**: voo entre canos com 500 canos no total e 3 vidas. Clique, toque, **Espaço**, **↑** e **W** fazem o pássaro bater as asas.
- Cada fase é um bloco de dificuldade com 4 a 8 canos; a velocidade sobe e o vão diminui conforme os canos passados avançam.
- Bater em um cano ou no chão perde 1 vida, zera a sequência e reinicia os canos e o progresso da fase, mas preserva o total de canos; o teto apenas limita o voo.
- Com vidas restantes, a batida pausa o voo e mostra **TOQUE PARA CONTINUAR** com **VOCÊ AINDA TEM N VIDAS**; o próximo toque/clique/tecla retoma a corrida.
- Passar por um cano soma pontos; completar os canos do bloco soma um bônus e aumenta a sequência sem interromper o voo.
- Os canos entram em fluxo contínuo: a troca de bloco de dificuldade não recria a fila, não reposiciona o pássaro e não mostra popup/mensagem de fase.
- O HUD do flappy mostra vidas, pontos, sequência, recorde, tier e barra de progresso, sem contador numérico de canos.
- O modo flappy termina sem vidas ou ao passar pelo 500º cano; o resultado entra no ranking próprio.
- Tutorial em modal, acessível pelo botão **Como jogar** nas configurações; o conteúdo acompanha o modo ativo (Clássico, Doce ou Flappy).
- HUD: sequência, nível, vidas, área, direção, configurações e botão **← Menu**.
- Botão de compartilhar removido por decisão de produto.
- Modo **Escuro**: preto e laranja.
- Modo **Claro**: laranja e branco.
- Fundo ambiente em SVG inline: ondas desfocadas à direita no tema escuro e fita laranja desfocada sobre creme no tema claro.
- Estética “liquid glass”, com brilho reduzido.
- Configurações pausam o jogo; fechar retorna ao jogo ou ao menu, conforme a origem.
- Configurações incluem tema, dificuldade, som, volume (0–100%) e atalho **Como jogar**.
- O tutorial aberto pelas configurações volta para elas ao fechar; **Voltar ao jogo** fecha ambos e retoma a partida.
- Tela de fim de jogo com estatísticas da corrida, **Entrar com Google**, perfil e acesso ao ranking.
- Ranking com três menus principais: **Clássico 🧱**, **Doce 🍪** e **Flappy 🐦**.
- Dentro de **Clássico 🧱**: **Geral / Fácil / Normal / Difícil / Hardcore**, com abas **🔥 Streak** e **🏆 Níveis**, top 10.
- Dentro de **Doce 🍪**: abas **🔥 Streak**, **🏆 Níveis** e **⭐ Pontos**, top 10.
- Dentro de **Flappy 🐦**: abas **🔥 Streak**, **🏆 Níveis** e **⭐ Pontos**, top 10.
- O título do ranking acompanha a seleção: “Ranking clássico — Fácil”, “Ranking doce”, “Ranking flappy”, etc.
- Perfil personalizável: nick (até 30 caracteres na UI) e foto opcional.
- Preferências persistidas em `localStorage` (`kbounce.settings.v1`).

### Conta e ranking

- Login via Firebase Authentication com Google.
- Perfil em Firestore `balljumpProfiles/{uid}` com `name`, `photo`, `bestStreak`, `bestLevel`, `scores`, `candy`, `flappy` e `updatedAt`.
- `scores` guarda `{ bestStreak, bestLevel }` por dificuldade (`easy`, `normal`, `hard`, `hardcore`); os campos globais preservam o melhor histórico geral.
- `candy` guarda `{ bestStreak, bestLevel, bestScore }` do modo doce, separado do ranking clássico.
- `flappy` guarda `{ bestStreak, bestLevel, bestScore }` do modo flappy, com `bestLevel` limitado a 500 e separado do ranking clássico.
- Os rankings Doce e Flappy têm três categorias: **Streak**, **Níveis** e **Pontos**.
- O modo da corrida é salvo junto ao resultado pendente e aplicado apenas ao ranking daquela dificuldade.
- O perfil é criado no primeiro login e entra no ranking geral.
- O nick começa como o nome do Google, mas pode ser alterado; sincronizações preservam o nick/foto salvos.
- Nicks são únicos: uma reserva em `balljumpNicknames/{key}` usa a versão normalizada (minúscula, sem acentos) e impede duas contas com o mesmo nome.
- Se o nome do Google já estiver ocupado, o primeiro login cria uma variante automática (`Lucas 2`, `Lucas 3`, ...).
- Perfis antigos com nomes iguais são corrigidos no próximo login, quando a reserva é criada.
- A foto é opcional, recortada em 160×160, comprimida para JPEG em data URL e limitada a 90.000 caracteres; não usamos Firebase Storage.
- Leitura do ranking exige autenticação; escrita só pelo próprio UID, com validação de schema e scores monotônicos.
- Não armazenamos e-mail, telefone ou analytics.
- O SDK é carregado sob demanda; sem rede, o jogo continua jogável e a tela final mostra erro de conexão sem bloquear o reinício.

## 4. Fora de escopo

- Back-end próprio, analytics ou publicidade.
- Multijogador.
- Dependências de runtime no núcleo do jogo; a exceção é o SDK Firebase 10.14.1 sob demanda.
- Coleta de e-mail, telefone ou outros dados pessoais além de nick, foto opcional e scores.
- Upload de imagens em Firebase Storage ou arquivos externos.
- Aplicativo nativo.
- Sistema de compartilhamento.

## 5. Estado atual

- Publicado em Cloudflare Pages: https://ted-io.pages.dev
- Repositório GitHub privado: `Xolotzx/Ted-io`
- Branch principal: `main`
- Deploy atual: **upload direto** pelo Wrangler a partir de `dist/` (allowlist: jogo, página 404 e headers); `git push` não dispara deploy automático.
- Documentação interna (`docs/`, `AGENTS.md`, `context/`) não é publicada no site.
- Headers de segurança declarados em `_headers`.
- Firebase projeto compartilhado `botanicstudio`: Auth Google, Firestore default, domínio autorizado e coleção `balljumpProfiles`.
- Ranking e login Google implementados; regras do Firestore publicadas junto das regras do Botanica.
- Sem CI/CD e sem suíte automatizada de navegador.

## 6. Limitações e riscos conhecidos

- Toda a lógica está em um único arquivo, o que aumenta o custo de leitura por agentes; use busca por símbolos.
- A CSP precisa permitir scripts e estilos inline porque o runtime é single-file. É um trade-off consciente (ver ADR-006).
- `localStorage` pode ser alterado pelo usuário; nunca trate esses valores como confiáveis para segurança.
- Não há testes automatizados de gameplay; a validação é manual (ver `docs/TESTING.md`).
- Cloudflare não está conectado ao repositório; publicações são manuais.
- Níveis altos podem gerar muitas bolinhas (até 51 no nível 100); monitorar desempenho em dispositivos modestos.
- Login e ranking exigem conexão; o jogo principal continua offline.
- O Firebase é compartilhado com o Botanica Studio; alterações nas regras precisam preservar os dois conjuntos.
- Nick e foto do perfil são visíveis para outros usuários autenticados; e-mail/telefone não são armazenados.
- A unicidade de nick é garantida pela transação do cliente e pela coleção `balljumpNicknames`; a coleção é legível por usuários autenticados e gravável apenas pelo dono da reserva.
- Nicks antigos duplicados só são corrigidos quando cada conta faz login novamente.
- Perfis criados antes dos rankings por dificuldade não têm `scores`; eles aparecem no ranking **Geral** e entram nos rankings de modo ao jogar cada dificuldade.
- O ranking exibe o top 10 por modo e métrica; não calcula a posição global de quem está fora do topo.
- A foto em data URL aumenta o tamanho do documento no Firestore; o limite de 90.000 caracteres evita abuso, mas ainda é um custo de leitura do ranking.
- Não há App Check nem suíte automatizada de login; o fluxo Google e o upload de foto precisam de validação manual com uma conta real.
- O ranking exibe o top 10 por métrica; não calcula a posição global de quem está fora do topo.

## 7. Próximos passos sugeridos

1. Validar o login Google completo (popup e fallback de redirect) em desktop e mobile.
2. Adicionar testes de navegador (Playwright ou similar) para menu, jogo, ranking e mobile.
3. Conectar o Cloudflare Pages ao GitHub para deploy automático com revisão.
4. Avaliar Firebase App Check e alertas de uso.
5. Avaliar CSP com hash/nonce caso o runtime deixe de ser single-file.
6. Adicionar verificação de acessibilidade automatizada.
7. Medir performance em hardware móvel modesto.

## 8. Como usar este documento

- Antes de mudar regras, confirme se a mudança é intencional e atualize este arquivo.
- Se o código e este documento divergirem, investigue: o comportamento observado no código é a fonte de verdade; depois alinhe a documentação.
- Não copie segredos, tokens ou dados pessoais para este documento.
