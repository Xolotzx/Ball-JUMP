# ted-io

Jogo web com três modos: **Clássico** (inspirado no JezzBall), **Doce** (match-3) e **Flappy** (voo entre canos), feito em um único arquivo HTML com Canvas, CSS e JavaScript puro.

## Jogar

- **Online:** https://ted-io.pages.dev
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
- Rankings em famílias: **Clássico 🧱** (Geral/Fácil/Normal/Difícil/Hardcore com Streak e Níveis), **Doce 🍪** (Streak, Níveis e Pontos) e **Flappy 🐦** (Streak, Níveis e Pontos).
- O botão **Jogar** abre a escolha entre **Modo Clássico**, **Modo Doce** e **Modo Flappy**.
- O HUD clássico tem **← Menu**, que pausa a partida e permite retomá-la depois.
- **Modo Doce**: match-3 8×8 com 100 fases, tempo em vez de vidas e ranking próprio (streak, níveis e pontos).
- Combine 3+ doces ou um quadrado 2×2.
- O especial **⚡** trocado com um doce elimina todos os doces daquele tipo.
- A partir da fase 21 aparecem doces com **cadeado**, que precisam de 2 detonações para sumir.
- A meta é **750 pontos** nas fases 1–5 e sobe **500 a cada 5 fases** (750 na fase 1, 1.250 na fase 6, até 10.250 na fase 100); o tempo cai a cada 10 fases.
- Bombas aparecem no tabuleiro doce; troque uma bomba com qualquer doce para explodir a área ao redor, com reações em cadeia.
- **Bomba + bomba** vira uma explosão dupla: área 5×5 ao redor de cada bomba, +500 de bônus, flash e som mais fortes.
- Explosões com som, faíscas, texto flutuante e tremida no tabuleiro.
- O modo doce usa o mesmo fundo ambiente (ondas/fita) do modo clássico.
- **Modo Flappy**: voo entre canos com 500 canos no total, 3 vidas e ranking próprio (streak, canos e pontos). Clique, toque ou **Espaço/↑/W** para bater as asas.
- Cada fase tem de 4 a 8 canos; a velocidade sobe e o vão diminui com o avanço. Bater em cano ou chão custa uma vida e reinicia os canos e o progresso da fase.
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
npx wrangler pages deploy dist --project-name ted-io --branch main --commit-dirty=true
```

A pasta `dist/` é gerada localmente e ignorada pelo Git. Ela contém apenas `index.html`, `404.html` e `_headers`, mantendo a documentação interna privada.

## Conta e privacidade

O login usa Firebase Authentication (Google) e o ranking usa Cloud Firestore. O perfil armazena um nick público editável (inicialmente o nome do Google), uma foto opcional em data URL, melhor streak e melhor nível; não armazenamos e-mail ou telefone. O nick é reservado em `balljumpNicknames` para evitar duplicidade. A foto é recortada e comprimida no navegador, sem Firebase Storage. O ranking é visível apenas para usuários autenticados.
