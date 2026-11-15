# ted-io

Jogo web com dois modos: **Clássico** (inspirado no JezzBall) e **Doce** (match-3), feito em um único arquivo HTML com Canvas, CSS e JavaScript puro.

## Jogar

- **Online:** https://balljump-game.pages.dev
- **Local:** abra o arquivo `index.html` no navegador.

## Como funciona

Preencha **75%** da arena construindo paredes para isolar as bolinhas. Se uma bolinha tocar em uma parede que ainda está crescendo, você perde uma vida. Ao concluir cada fase, você ganha **+1 vida**.

- **PC:** clique esquerdo constrói · clique direito alterna a direção · `Espaço` também alterna.
- **Celular:** toque constrói · use o botão **HORIZ / VERT** para alternar a direção.

## Recursos

- 100 níveis e uma bolinha extra a cada 2 níveis.
- 4 dificuldades.
- Sequência 🔥: cada parede concluída aumenta o contador; levar dano zera. Inclui animação e som de fogo sutil.
- Login com Google no fim da partida, perfil e ranking de **streak** e **níveis**.
- Rankings separados por dificuldade (**Fácil**, **Normal**, **Difícil**, **Hardcore**) e um ranking **Geral**.
- O botão **Jogar** abre a escolha entre **Modo Clássico** e **Modo Doce**.
- **Modo Doce**: match-3 8×8 com 100 fases, tempo em vez de vidas e ranking próprio (streak, níveis e pontos).
- Dificuldade do modo doce aumenta a cada 10 fases: mais tipos, meta maior e menos tempo.
- Bombas aparecem no tabuleiro doce; troque uma bomba com qualquer doce para explodir a área ao redor, com reações em cadeia.
- Explosões com som, faíscas, texto flutuante e tremida no tabuleiro.
- O modo doce usa o mesmo fundo ambiente (ondas/fita) do modo clássico.
- Perfil editável com nick e foto (a foto é opcional, recortada e comprimida no navegador). Nicks são únicos.
- Modo **Preto & laranja** e modo **Laranja & branco**.
- Fundo ambiente em SVG: ondas laranja desfocadas no tema escuro (concentradas à direita) e fita laranja desfocada no tema claro.
- Tutorial **Como jogar** acessível pelas configurações.
- Efeitos sonoros gerados com Web Audio API, com reverb, harmônicos e pan estéreo, além de controle de volume (0–100%) nas configurações.
- Layout responsivo com suporte a toque.
- Núcleo do jogo em arquivo único; Firebase carregado sob demanda para login/ranking.

## Contexto e segurança

Este repositório mantém uma camada de engenharia de contexto para humanos e agentes de IA:

- [`AGENTS.md`](AGENTS.md) — ponto de entrada, invariantes e regras de segurança.
- [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) — objetivo, regras e estado atual.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitetura técnica.
- [`docs/CONTEXT_ENGINEERING.md`](docs/CONTEXT_ENGINEERING.md) — como preparar e manter contexto.
- [`docs/SECURITY.md`](docs/SECURITY.md) — modelo de ameaças e controles.
- [`docs/FIREBASE.md`](docs/FIREBASE.md) — Auth Google, Firestore, regras e ranking.
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

## Conta e privacidade

O login usa Firebase Authentication (Google) e o ranking usa Cloud Firestore. O perfil armazena um nick público editável (inicialmente o nome do Google), uma foto opcional em data URL, melhor streak e melhor nível; não armazenamos e-mail ou telefone. O nick é reservado em `balljumpNicknames` para evitar duplicidade. A foto é recortada e comprimida no navegador, sem Firebase Storage. O ranking é visível apenas para usuários autenticados.
