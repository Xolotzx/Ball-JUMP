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
  - arquivo grande (~87 KB) e maior custo de leitura por agentes;
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

## ADR-004 — Meta de 95% e +1 vida por fase

- **Data:** 2026-11-15
- **Status:** aceita
- **Contexto:** aumentar o desafio e recompensar progressão contínua; requisito do produto.
- **Decisão:** meta de **95%** da área interna; ao concluir cada fase, conceder **+1 vida**.
- **Consequências:**
  - `GOAL_CELLS = 479`;
  - níveis mais longos e exigentes;
  - a vida extra reduz a punição acumulada;
  - tutela e HUD devem refletir 95% e a recompensa.

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
  - tutorial deve ser atualizado quando regras mudarem.

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
