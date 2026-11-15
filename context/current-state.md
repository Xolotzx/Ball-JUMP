# Estado atual — Balljump-game

> Atualizar este arquivo a cada release ou mudança relevante.

## Snapshot

- **Data:** 2026-11-15
- **Status:** publicado e funcional
- **Jogo local:** `index.html` (~87 KB, single-file)
- **Deploy:** https://balljump-game.pages.dev
- **Projeto Cloudflare:** `balljump-game`
- **Repositório:** privado, branch `main`
- **Modo de deploy:** upload manual direto a partir de `dist/` (allowlist: `index.html` + `404.html` + `_headers`).
- **Documentação interna:** não publicada no site.

## Regras em vigor

- Meta: **95%**.
- **+1 vida** por fase concluída.
- 100 níveis; +1 bolinha a cada 2 níveis.
- 4 dificuldades.
- Menus: Jogar, Configurações, Como jogar.
- Modos escuro/claro; sem botão de compartilhamento.

## Segurança em vigor

- `_headers` com CSP restritiva, nosniff, no-referrer, frame-ancestors none, COOP/CORP, Permissions-Policy e HSTS.
- Deploy por allowlist em `dist/` (`index.html`, `404.html`, `_headers`); documentação interna não é publicada.
- Caminhos internos como `/AGENTS.md` retornam 404 com página própria.
- Zero dependências/rede no runtime.
- Repositório privado; sem segredos no Git.
- `node scripts/check-context.mjs` disponível para verificação local.

## Últimas mudanças

- Documentação de engenharia de contexto adicionada.
- Headers de segurança e CSP adicionados ao deploy.
- Página 404 e allowlist de publicação adicionadas.
- Paleta alterada para preto/laranja (escuro) e laranja/branco (claro).
- Sequência 🔥 adicionada: +1 por parede concluída, zera ao levar dano, com som de fogo sutil.
- Fundo ambiente em SVG adicionado: ondas desfocadas à direita no escuro e fita laranja desfocada no claro.
- Áudio aprimorado com reverb, harmônicos, compressor e pan estéreo.
- README e política de segurança adicionados.

## Pendências e próximos passos

- Revalidar headers/CSP no ambiente de produção a cada deploy (validado em 2026-11-15).
- Conectar Cloudflare Pages ao GitHub para deploy automático (requer autorização do GitHub App).
- Adicionar testes de navegador automatizados.
- Avaliar migração de CSP inline para hashes/nonces caso o projeto deixe de ser single-file.
- Testar performance em celular modesto nos níveis altos.

## Observações de handoff

- O `index.html` completo é caro em contexto; usar busca por símbolos.
- `git push` não publica automaticamente no Cloudflare.
- Não registrar tokens, cookies ou credenciais neste arquivo.
