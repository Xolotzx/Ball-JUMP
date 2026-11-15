# Estado atual — Balljump-game

> Atualizar este arquivo a cada release ou mudança relevante.

## Snapshot

- **Data:** 2026-11-15
- **Status:** publicado e funcional
- **Jogo local:** `index.html` (~132 KB, núcleo single-file; Firebase SDK sob demanda)
- **Deploy:** https://balljump-game.pages.dev
- **Projeto Cloudflare:** `balljump-game`
- **Repositório:** privado, branch `main`
- **Firebase:** projeto compartilhado `botanicstudio` (Auth Google + Firestore default; `balljumpProfiles`)
- **Modo de deploy:** upload manual direto a partir de `dist/` (allowlist: `index.html` + `404.html` + `_headers`).
- **Documentação interna:** não publicada no site.

## Regras em vigor

- Meta: **75%**.
- **+1 vida** por fase concluída.
- 100 níveis; +1 bolinha a cada 2 níveis.
- 4 dificuldades.
- Menus: Jogar, Ranking, Configurações, Como jogar.
- Modos escuro/claro; sem botão de compartilhamento.
- Tela de morte/vitória com login Google, perfil e ranking de streak/níveis.

## Segurança em vigor

- `_headers` com CSP restritiva allowlisted para Firebase/Google, nosniff, no-referrer, frame-ancestors none, COOP `same-origin-allow-popups`, CORP, Permissions-Policy e HSTS.
- Deploy por allowlist em `dist/` (`index.html`, `404.html`, `_headers`); documentação interna não é publicada.
- Caminhos internos como `/AGENTS.md` retornam 404 com página própria.
- Núcleo offline; Firebase SDK/APIs carregados apenas para login/ranking.
- Firestore: leitura autenticada, escrita somente pelo UID com schema/monotonicidade/server timestamp; regras preservam o Botanica.
- Domínio `balljump-game.pages.dev` autorizado; provedor Google habilitado.
- Repositório privado; sem segredos no Git (apiKey Firebase é pública por design).

## Últimas mudanças

- Firebase Auth Google + Firestore `balljumpProfiles` integrados.
- Tela de morte/vitória redesenhada com login, perfil e acesso ao ranking.
- Ranking com abas de streak/níveis e top 10.
- Regras do Firestore publicadas junto das regras do Botanica; domínio autorizado.
- CSP ampliada para Firebase/Google e COOP ajustado para popup OAuth.
- Documentação de engenharia de contexto adicionada.
- Headers de segurança e CSP adicionados ao deploy.
- Página 404 e allowlist de publicação adicionadas.
- Paleta alterada para preto/laranja (escuro) e laranja/branco (claro).
- Meta reduzida de 95% para 75%.
- Modo Fácil com parede quase instantânea.
- Segunda iteração do HUD: sequência → nível → vidas, bloco de objetivo removido e rodapé discreto.
- Sequência 🔥 adicionada: +1 por parede concluída, zera ao levar dano, com som de fogo suave.
- Fundo ambiente em SVG adicionado: ondas desfocadas à direita no escuro e fita laranja desfocada no claro.
- Áudio aprimorado com reverb, harmônicos, compressor e pan estéreo.
- README e política de segurança adicionados.

## Pendências e próximos passos

- Validar manualmente o login Google real (popup e fallback de redirect) em desktop e mobile.
- Revalidar headers/CSP no ambiente de produção a cada deploy (validado em 2026-11-15).
- Conectar Cloudflare Pages ao GitHub para deploy automático (requer autorização do GitHub App).
- Adicionar testes de navegador automatizados.
- Avaliar Firebase App Check e monitoramento de quotas.
- Avaliar migração de CSP inline para hashes/nonces caso o projeto deixe de ser single-file.
- Testar performance em celular modesto nos níveis altos.

## Observações de handoff

- O `index.html` completo é caro em contexto; usar busca por símbolos.
- `git push` não publica automaticamente no Cloudflare.
- Regras do Firestore ficam em `../Botanica Studio/botanicstudio/firebase/firestore.rules` e devem preservar os dois projetos.
- Não registrar tokens, cookies ou credenciais neste arquivo.
