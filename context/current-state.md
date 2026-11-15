# Estado atual — ted-io

> Atualizar este arquivo a cada release ou mudança relevante.

## Snapshot

- **Data:** 2026-11-15
- **Status:** publicado e funcional
- **Jogo local:** `index.html` (~202 KB, núcleo single-file; Firebase SDK sob demanda)
- **Deploy:** https://ted-io.pages.dev
- **Projeto Cloudflare:** `ted-io`
- **Repositório:** privado, branch `main`
- **Firebase:** projeto compartilhado `botanicstudio` (Auth Google + Firestore default; `balljumpProfiles`)
- **Modo de deploy:** upload manual direto a partir de `dist/` (allowlist: `index.html` + `404.html` + `_headers`).
- **Documentação interna:** não publicada no site.

## Regras em vigor

- Meta: **75%**.
- **+1 vida** por fase concluída.
- 100 níveis; +1 bolinha a cada 2 níveis.
- 4 dificuldades.
- Menus: Jogar, Ranking, Configurações; **Jogar** abre a escolha entre Clássico e Doce; tutorial acessível pelas configurações.
- Menu principal com fundo ambiente do tema (ondas no escuro, fita no claro) e marca **ted-io**.
- Configurações disponíveis no clássico e no modo doce (engrenagem); no doce a dificuldade é ocultada e o timer pausa.
- Modos escuro/claro; sem botão de compartilhamento.
- Configurações com tema, dificuldade, som, volume (0–100%) e botão **Como jogar**.
- Tutorial aberto pelas configurações fica por cima e retorna a elas; **Voltar ao jogo** fecha ambos.
- Tela de morte/vitória com login Google, perfil e ranking de streak/níveis.
- **Modo Doce**: match-3 8×8, 100 fases, tempo em vez de vidas, ranking próprio (streak, níveis, pontos) e dificuldade crescente a cada 10 fases. Combina 3+ ou 2×2; ⚡ limpa um tipo; cadeados (2 cargas) entram na fase 21; tempo base 60 s.
- Ranking em famílias **Clássico 🧱** e **Doce 🍪**: clássico com Geral/Fácil/Normal/Difícil/Hardcore e abas Streak/Níveis; doce com Streak/Níveis/Pontos.
- Perfil editável: nick e foto opcional (160×160 JPEG em data URL, até 90.000 caracteres); fallback para a inicial.
- Nicks únicos: reserva transacional em `balljumpNicknames/{key}`; nomes do Google ocupados recebem sufixo automático; renomear libera o nick antigo.

## Segurança em vigor

- `_headers` com CSP restritiva allowlisted para Firebase/Google, nosniff, no-referrer, frame-ancestors none, COOP `same-origin-allow-popups`, CORP, Permissions-Policy e HSTS.
- Deploy por allowlist em `dist/` (`index.html`, `404.html`, `_headers`); documentação interna não é publicada.
- Caminhos internos como `/AGENTS.md` retornam 404 com página própria.
- Núcleo offline; Firebase SDK/APIs carregados apenas para login/ranking.
- Firestore: leitura autenticada, escrita somente pelo UID com schema/monotonicidade/server timestamp; `photo` validada como data URL até 90.000 chars; `scores` validado por modo; `candy` validado para o modo doce; `balljumpNicknames` legível por autenticados e gravável só pelo dono; regras preservam o Botanica.
- Domínio `ted-io.pages.dev` autorizado; provedor Google habilitado.
- Repositório privado; sem segredos no Git (apiKey Firebase é pública por design).

## Últimas mudanças

- Perfil editável com nick e foto; modal com prévia, remoção e validação.
- Foto processada em canvas 160×160 e salva como data URL JPEG, sem Firebase Storage.
- Logo oficial do Google e botão de login branco suave no tema claro / preto suave no escuro.
- `syncProfile` preserva nick/foto existentes; ranking renderiza avatares com fallback.
- Corrigido `footer` global que aplicava `opacity:.38` aos rodapés dos modais.
- Corrigido o carregamento de fotos em produção: a CSP bloqueava `blob:`; agora o arquivo é decodificado com `createImageBitmap`/`FileReader` (data URL), sem blob.
- Nicks únicos implementados com `balljumpNicknames` e transação; regras publicadas preservando Botanica e Balljump.
- Rankings por dificuldade implementados (`scores.easy/normal/hard/hardcore`) e ranking Geral; seletor no modal de ranking.
- Regras do Firestore atualizadas para validar `scores` e publicadas.
- Slider de volume 0–100% adicionado às configurações, persistido e aplicado ao ganho mestre.
- Botão **Como jogar** adicionado às configurações, abrindo o tutorial por cima do modal.
- Modo Doce (match-3) adicionado: 100 fases, tempo em vez de vidas, streak/pontos, ranking próprio e rampa a cada 10 fases.
- Botão **Jogar** agora abre um seletor com **Modo Clássico** e **Modo Doce**; o menu não tem mais botão duplicado.
- Bombas aparecem no modo doce e explodem a área 3×3 ao serem trocadas com qualquer doce; cadeias, faíscas, texto de pontos, tremida e som próprio.
- O modo doce usa o mesmo fundo ambiente do clássico (ondas/fita); o `.app` clássico fica oculto durante o modo doce.
- Configurações adicionadas ao modo doce (engrenagem), com timer pausado e dificuldade oculta.
- Menu principal passou a usar o fundo do tema e o app clássico fica oculto enquanto o menu está aberto.
- Site renomeado para **ted-io** no título da aba e no cartão do menu.
- Botão **← Menu** adicionado ao HUD clássico; ele pausa a partida e preserva nível/vidas/área para retomar.
- Ranking ganhou escopo **Doce** e a aba **Pontos**; perfil ganhou o mapa `candy`.
- Ranking reorganizado em famílias **Clássico 🧱** (dificuldades + Streak/Níveis) e **Doce 🍪** (Streak/Níveis/Pontos).
- Modo doce ganhou match 2×2, especial ⚡, cadeados a partir da fase 21 e tempo base de 60 s; tipos limitados a 6.
- Regras do Firestore atualizadas para validar `candy` e publicadas.
- Firebase Auth Google + Firestore `balljumpProfiles` integrados.
- Tela de morte/vitória redesenhada com login, perfil e acesso ao ranking.
- Ranking com abas de streak/níveis e top 10.
- Regras do Firestore publicadas junto das regras do Botanica; domínio autorizado.
- CSP ampliada para Firebase/Google, `img-src data:` e COOP ajustado para popup OAuth.
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
- Validar manualmente a edição de perfil (nick, foto JPG/PNG/WebP, remoção e persistência) com conta real.
- Validar o modo doce em navegador real: trocas, cascatas, 2×2, ⚡, bombas/cadeias, cadeados, tempo de 60 s, fases 10/11, 20/21, 30/31, 90/100 e ranking Doce.
- Ajustar metas/tempos e frequência/força das bombas após playtest em celular e desktop.
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
