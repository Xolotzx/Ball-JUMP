# Decisões arquiteturais — Balljump-game

Formato: contexto → decisão → consequências. Mudanças de decisão exigem nova ADR.

## ADR-001 — Runtime em arquivo único

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** jogo pequeno, distribuição simples, uso offline, facilidade de abrir localmente.
- **Decisão:** manter HTML, CSS e JavaScript no `index.html`; documentação e ferramentas ficam fora do runtime.
- **Consequências:**
  - deploy e distribuição triviais;
  - funciona via `file://`;
  - arquivo grande (~156 KB) e maior custo de leitura por agentes;
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
- **Decisão:** publicar no Cloudflare Pages (`balljump-game`) por upload direto a partir de `dist/`, com allowlist de `index.html` + `404.html` + `_headers`, e manter o código no GitHub privado.
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
