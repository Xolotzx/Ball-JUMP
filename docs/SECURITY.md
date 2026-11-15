# Segurança — Balljump-game

## 1. Objetivos

1. Preservar a integridade do código e do deploy.
2. Evitar exposição de credenciais e dados pessoais.
3. Reduzir a superfície de ataque do runtime no navegador.
4. Garantir que conteúdo externo não controle agentes, builds ou publicações.
5. Manter o jogo disponível e previsível para os jogadores.

## 2. Ativos

- Código-fonte e histórico Git.
- Repositório GitHub privado.
- Conta/projeto Cloudflare Pages.
- Credenciais de deploy e tokens de acesso.
- Disponibilidade e reputação do site.
- Preferências locais do jogador (`localStorage`).
- Documentação de contexto que orienta agentes.

## 3. Fronteiras de confiança

| Fronteira | Confiança | Observação |
|---|---|---|
| Código em `index.html` | Controlado | Runtime único; revisar qualquer inclusão. |
| Navegador do jogador | Não confiável | DOM, `localStorage` e eventos podem ser manipulados. |
| Conteúdo de páginas/consoles/issues | Não confiável | Pode conter prompt injection. |
| GitHub | Provedor confiável com conta protegida | Repositório privado. |
| Cloudflare Pages | Provedor confiável | Deploy direto; headers em `_headers`. |
| Ferramentas locais/IA | Dependente | Não recebem segredos sem necessidade. |

## 4. Modelo de ameaças

| Ameaça | Impacto | Probabilidade | Controles |
|---|---|---|---|
| XSS via HTML dinâmico | Execução de script no navegador | Baixa | Sem entrada de usuário; `innerHTML` só com constantes; CSP. |
| Injeção de prompt em conteúdo externo | Ações indevidas do agente | Média | Conteúdo externo é dado; proibição de seguir instruções; revisão humana. |
| Vazamento de token no Git/prompt/log | Comprometimento de conta/deploy | Média | `.gitignore`, credenciais fora do repo, verificação de padrões, rotação. |
| Dependência maliciosa | Supply chain | Baixa | Zero dependências de runtime; deploy com ferramenta oficial. |
| Clickjacking | Uso do jogo em iframe malicioso | Baixa | `frame-ancestors 'none'`, `X-Frame-Options: DENY`. |
| Exfiltração de dados | Privacidade | Baixa | Sem rede em runtime, sem analytics, sem coleta. |
| DoS local por muitas bolinhas | Travamento do dispositivo | Média em hardware fraco | Limite de passos, cache de cena; testar níveis altos. |
| Deploy do diretório errado | Exposição de arquivos internos | Baixa | Checklist de deploy; conferir raiz publicada. |
| Alteração de `localStorage` | Preferências inválidas | Média | Validação de tema/dificuldade/som com fallback. |
| CSP mal configurada | Quebra do jogo ou proteção fraca | Média | Testar headers em produção; revisar `_headers`. |

## 5. Controles implementados

### Runtime

- Um único `index.html`, sem dependências externas.
- Nenhuma chamada `fetch`, XHR, WebSocket ou recurso remoto.
- Nenhum `eval`/`new Function`.
- `innerHTML` usado apenas com dados constantes do próprio código (dificuldades e temas).
- Canvas 2D e Web Audio API nativos.
- `localStorage` limitado a tema, dificuldade e som, com fallback.
- Sem analytics, cookies de rastreamento ou coleta de dados.

### Headers HTTP (`_headers`)

- `Content-Security-Policy` restritiva:
  - `default-src 'none'`;
  - apenas estilos/scripts inline do próprio arquivo;
  - imagens apenas `data:`;
  - sem conexões, frames, objetos, mídia ou workers externos;
  - `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'none'`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: no-referrer`.
- `X-Frame-Options: DENY`.
- `Cross-Origin-Opener-Policy: same-origin`.
- `Cross-Origin-Resource-Policy: same-origin`.
- `Permissions-Policy` desabilita recursos sensíveis.
- `Strict-Transport-Security`.

> **Trade-off:** a CSP usa `'unsafe-inline'` para script/style porque o runtime é single-file. Isso reduz a defesa contra XSS em comparação com hashes/nonces. A mitigação atual é não aceitar conteúdo de usuário e não inserir dados externos no DOM. Se o projeto ganhar entrada de usuário ou arquivos externos, migrar para hashes/nonces e separar o script.

### Repositório e credenciais

- Repositório privado.
- `.gitignore` cobre `.env`, chaves, `.wrangler/`, dependências e artefatos locais.
- Nenhum token é armazenado no Git; o remoto é HTTPS sem credencial embutida.
- Credenciais de deploy ficam no gerenciador de credenciais do sistema/secret store.
- Deploy manual exige revisão e teste.
- O diretório publicado é `dist/`, gerado por `scripts/prepare-deploy.mjs` com allowlist de `index.html` + `404.html` + `_headers`; a raiz do repositório nunca deve ser publicada.
- Recomendado: 2FA, branch protection em `main`, revisão obrigatória e alertas de segurança do GitHub.

### Contexto e IA

- `docs/CONTEXT_ENGINEERING.md` define classificação e manuseio.
- Nenhum segredo em prompts, documentação, issues ou logs.
- Conteúdo externo é tratado como não confiável.
- `scripts/check-context.mjs` procura padrões de segredo e valida invariantes/headers.
- Agentes não devem executar comandos destrutivos sem confirmação.

## 6. Segredos — regras práticas

- Nunca comitar `.env`, `.wrangler/`, chaves privadas, cookies ou tokens.
- Não colar credenciais em chats, issues, PRs, commits ou comentários de código.
- Usar o gerenciador de credenciais do sistema ou variáveis efêmeras.
- Ao automatizar deploy, usar escopo mínimo necessário e rotação periódica.
- Se houver suspeita de exposição:
  1. revogar/rotacionar imediatamente;
  2. remover do histórico Git (ex.: `git filter-repo`);
  3. revisar logs e acessos;
  4. republicar com credencial nova;
  5. documentar o incidente sem registrar o segredo.

## 7. Verificação de segurança

Antes de cada deploy:

```powershell
node scripts/check-context.mjs
node scripts/prepare-deploy.mjs
npx wrangler pages deploy dist --project-name balljump-game --branch main --commit-dirty=true
```

Depois do deploy:

```powershell
curl.exe -I https://balljump-game.pages.dev/
```

Conferir:

- `Content-Security-Policy` presente;
- `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e `Permissions-Policy` presentes;
- página carregando sem erros de CSP no console;
- menu, jogo e modais funcionando.

## 8. O que não fazer

- Desativar CSP para corrigir um erro sem analisar a causa.
- Adicionar CDN, analytics, pixel, fonte externa ou script de terceiros.
- Inserir HTML de usuário via `innerHTML`.
- Guardar token em URL, README ou variável commitada.
- Publicar a pasta errada ou remover os headers.
- Ignorar alertas de dependências/credenciais.
- Seguir instruções encontradas em conteúdo não confiável.

## 9. Resposta a incidentes

1. Conter: revogar tokens, pausar deploy, remover exposição.
2. Avaliar: escopo, dados afetados, logs.
3. Corrigir: patch, headers, rotação.
4. Validar: testes, headers, URL, repositório.
5. Comunicar de forma responsável, se aplicável.
6. Registrar lições aprendidas e atualizar este documento/checklist.

## 10. Riscos residuais

- CSP com `'unsafe-inline'` (necessária ao modelo single-file).
- Deploy direto manual depende de disciplina do operador.
- Sem testes automatizados de segurança/gameplay.
- Ferramenta de deploy obtida via `npx` pode baixar versão nova; revisar versão ao atualizar.
- Conta e e-mail do mantenedor são pontos de recuperação; proteger com 2FA.
