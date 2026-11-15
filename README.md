# Balljump-game

Jogo web inspirado no clássico JezzBall, feito em um único arquivo HTML com Canvas, CSS e JavaScript puro.

## Jogar

- **Online:** https://balljump-game.pages.dev
- **Local:** abra o arquivo `index.html` no navegador.

## Como funciona

Preencha **95%** da arena construindo paredes para isolar as bolinhas. Se uma bolinha tocar em uma parede que ainda está crescendo, você perde uma vida. Ao concluir cada fase, você ganha **+1 vida**.

- **PC:** clique esquerdo constrói · clique direito alterna a direção · `Espaço` também alterna.
- **Celular:** toque constrói · use o botão **HORIZ / VERT** para alternar a direção.

## Recursos

- 100 níveis e uma bolinha extra a cada 2 níveis.
- 4 dificuldades.
- Modo **Preto & laranja** e modo **Laranja & branco**.
- Fundo ambiente em SVG: ondas laranja desfocadas no tema escuro (concentradas à direita) e fita laranja desfocada no tema claro.
- Efeitos sonoros gerados com Web Audio API, com reverb, harmônicos e pan estéreo.
- Layout responsivo com suporte a toque.
- Sem dependências ou arquivos externos.

## Contexto e segurança

Este repositório mantém uma camada de engenharia de contexto para humanos e agentes de IA:

- [`AGENTS.md`](AGENTS.md) — ponto de entrada, invariantes e regras de segurança.
- [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) — objetivo, regras e estado atual.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitetura técnica.
- [`docs/CONTEXT_ENGINEERING.md`](docs/CONTEXT_ENGINEERING.md) — como preparar e manter contexto.
- [`docs/SECURITY.md`](docs/SECURITY.md) — modelo de ameaças e controles.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decisões arquiteturais.
- [`docs/TESTING.md`](docs/TESTING.md) — plano de testes.
- [`SECURITY.md`](SECURITY.md) — como relatar vulnerabilidades.
- [`context/manifest.json`](context/manifest.json) — mapa legível por máquina.

Verificação local de contexto e segurança:

```powershell
node scripts/check-context.mjs
```

## Desenvolvimento e deploy

```powershell
# Servir localmente
python -m http.server 8765 --directory .

# Preparar somente o runtime público + headers
node scripts/prepare-deploy.mjs

# Publicar (Cloudflare Pages)
npx wrangler pages deploy dist --project-name balljump-game --branch main --commit-dirty=true
```

A pasta `dist/` é gerada localmente e ignorada pelo Git. Ela contém apenas `index.html`, `404.html` e `_headers`, mantendo a documentação interna privada.
