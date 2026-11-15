# Testes — Balljump-game

## 1. Antes de testar

```powershell
node scripts/check-context.mjs
```

Servir localmente:

```powershell
python -m http.server 8765 --directory .
```

Abrir `http://127.0.0.1:8765/` ou abrir `index.html` diretamente.

## 2. Smoke test de interface

- [ ] Menu inicial aparece ao entrar.
- [ ] Existem os botões **Jogar**, **Configurações** e **Como jogar**.
- [ ] “Jogar” fecha o menu e inicia a partida.
- [ ] “Como jogar” abre o tutorial e o botão “Voltar” retorna ao menu.
- [ ] “Jogar agora” no tutorial inicia a partida.
- [ ] “Configurações” abre o modal, pausa o jogo e, ao fechar, retorna ao menu ou ao jogo.
- [ ] HUD mostra nível, vidas, área (x%/75%), direção e configurações.
- [ ] Botão de compartilhamento não existe.

## 3. Gameplay e visual

- [ ] Clique esquerdo/toque em célula vazia inicia parede.
- [ ] Parede cresce nos dois sentidos.
- [ ] Botão HORIZ/VERT, clique direito e `Espaço` alternam direção.
- [ ] Parede que chega às bordas fica fixa.
- [ ] Parede atingida por bolinha é destruída e perde 1 vida.
- [ ] Área fechada sem bolinha é preenchida automaticamente.
- [ ] Progresso do HUD aumenta após flood fill.
- [ ] Ao atingir 75%, o nível é concluído.
- [ ] Overlay mostra “+1 VIDA”.
- [ ] Após a transição, o próximo nível começa com a vida extra.
- [ ] +1 bolinha a cada 2 níveis.
- [ ] Ao zerar vidas, aparece Game Over e o reinício volta ao nível 1.
- [ ] Nível 100 exibe vitória (pode ser validado por simulação/estado).
- [ ] Modo escuro usa preto e laranja; modo claro usa laranja e branco.
- [ ] Fundo SVG aparece corretamente: ondas desfocadas à direita no escuro e fita laranja desfocada no claro, sem prejudicar a leitura.
- [ ] Painéis de texto mantêm contraste sobre o fundo.
- [ ] Sequência 🔥 fica oculta com zero e aparece após a primeira parede concluída.
- [ ] Cada parede concluída aumenta o número; o ícone pulsa e toca o som de fogo.
- [ ] Levar dano zera a sequência e oculta o chip.
- [ ] A sequência persiste ao avançar de nível e zera em novo jogo.

## 4. Dificuldades e persistência

- [ ] Fácil: 5 vidas; parede quase instantânea (conclusão em 1–2 frames).
- [ ] Normal: 3 vidas.
- [ ] Difícil: 2 vidas.
- [ ] Hardcore: 1 vida; parede mais lenta.
- [ ] Alterar dificuldade reinicia no nível 1.
- [ ] Tema escuro/claro alterna sem reiniciar a fase.
- [ ] Som liga/desliga e persiste.
- [ ] Recarregar a página preserva tema, dificuldade e som, mas volta ao menu.

## 5. Mobile e acessibilidade

- [ ] Canvas com `touch-action: none` não rola nem dá zoom acidental.
- [ ] Toque constrói na célula correta em tela redimensionada.
- [ ] Botão HORIZ/VERT é grande o suficiente para o polegar.
- [ ] Menu e tutorial cabem em 320–390 px de largura.
- [ ] Modal é rolável e o footer permanece acessível.
- [ ] Navegação por Tab/Enter funciona nos overlays.
- [ ] `Escape` fecha tutorial/configurações.
- [ ] Foco retorna ao elemento anterior ao fechar.
- [ ] Contraste legível nos dois modos.

## 6. Áudio

- [ ] Bipe durante construção.
- [ ] Som ascendente ao concluir parede.
- [ ] Som descendente ao perder vida.
- [ ] Fanfarra ao concluir nível.
- [ ] Quique sutil com pan estéreo.
- [ ] Tons com reverb e harmônicos, sem estalos ou clipping.
- [ ] Sem erros de autoplay; áudio só após gesto do usuário.

## 7. Segurança e deploy

- [ ] `node scripts/check-context.mjs` retorna sucesso.
- [ ] `node scripts/prepare-deploy.mjs` gera `dist/` com apenas `index.html`, `404.html` e `_headers`.
- [ ] Nenhum segredo no `git diff`.
- [ ] `_headers` contém CSP e headers de proteção, incluindo Firebase/Google Auth.
- [ ] Regras do Firestore publicadas sem remover as regras do Botanica.
- [ ] Deploy feito de `dist/`, não da raiz do repositório.
- [ ] Caminhos internos (ex.: `/AGENTS.md`) retornam 404 e não expõem documentação.
- [ ] URL de produção carrega a versão nova.
- [ ] `curl.exe -I https://balljump-game.pages.dev/` mostra os headers esperados.
- [ ] Console do navegador sem erros de CSP.
- [ ] Menu, jogo, tutorial e configurações funcionam em produção.
- [ ] Repositório permanece privado.

## 8. Firebase, login, perfil e ranking

- [ ] A tela de morte abre ao perder todas as vidas e mostra sequência/nível da corrida.
- [ ] A tela de vitória no nível 100 usa o mesmo fluxo.
- [ ] O botão **Entrar com Google** fica habilitado após o SDK carregar.
- [ ] Login com conta Google real cria `balljumpProfiles/{uid}` e mostra o perfil.
- [ ] O perfil exibe nick, melhor streak e melhor nível, com foto quando houver.
- [ ] O botão **Ver ranking** abre as abas **Streak** e **Níveis**.
- [ ] O top 10 é ordenado corretamente; a linha do próprio jogador é destacada.
- [ ] Trocar de aba não quebra a lista.
- [ ] **Sair** volta ao estado de login.
- [ ] O menu **Ranking** abre o ranking mesmo antes de morrer.
- [ ] O nome do jogador é exibido como texto (testar um nome com `<b>`; não deve virar HTML).

### Edição de perfil

- [ ] **Editar perfil** (tela de morte) e **Editar** (ranking) abrem o mesmo modal.
- [ ] O modal inicia com o nick e a foto atuais.
- [ ] Um nick vazio mostra erro e não salva.
- [ ] O nick é normalizado (espaços repetidos) e limitado a 30 caracteres.
- [ ] Um nick já usado por outra conta mostra **"Esse nick já está em uso"** e mantém o modal aberto.
- [ ] Nicks equivalentes (`Lucas`, `lucas`, `LUCAS!`, `João`/`Joao`) são tratados como iguais.
- [ ] Duas contas tentando salvar o mesmo nick ao mesmo tempo: apenas uma consegue.
- [ ] Renomear libera o nick antigo para outra conta.
- [ ] No primeiro login com nome do Google ocupado, o app cria `Nome 2`/`Nome 3` automaticamente.
- [ ] Perfil antigo duplicado recebe sufixo no próximo login.
- [ ] Escolher JPG/PNG/WebP gera uma prévia quadrada e salva em data URL JPEG.
- [ ] Uma imagem grande (>15 MB) é recusada com mensagem clara.
- [ ] Uma foto HEIC do iPhone mostra a orientação para converter para JPG.
- [ ] O processamento funciona em produção sob a CSP `img-src data:` (sem blob URL).
- [ ] **Remover foto** volta para a inicial do nick.
- [ ] **Salvar** atualiza a tela de morte e o ranking sem recarregar.
- [ ] Recarregar a página mantém nick e foto.
- [ ] O ranking mostra fotos e iniciais corretamente.
- [ ] Foto inválida ou acima do limite cai para a inicial (fallback).
- [ ] O modal fecha com X, Cancelar, clique fora e Esc.

### Firebase, ranking e rede

- [ ] Sem rede, o jogo continua e a tela final não bloqueia **Jogar novamente**.
- [ ] Popup bloqueado cai no fallback de redirect e preserva a corrida pendente.
- [ ] Recarregar a página mantém a sessão Firebase quando já autenticado.

### Regras e configuração do Firebase

- [ ] Regras do Firestore publicadas com as regras do Botanica preservadas.
- [ ] Leitura sem autenticação é negada.
- [ ] Escrita com UID diferente é negada.
- [ ] `bestStreak`/`bestLevel` não podem diminuir.
- [ ] Schema inválido, nome vazio/longo ou timestamp incorreto é negado.
- [ ] `photo` ausente, fora do prefixo permitido ou acima de 90.000 caracteres é negado.
- [ ] `balljumpNicknames` exige autenticação para leitura e só permite escrita ao UID dono.
- [ ] Criar/atualizar reserva com UID diferente do autenticado é negado.
- [ ] Apagar reserva de outro UID é negado.
- [ ] Nome vazio/longo ou timestamp incorreto na reserva é negado.
- [ ] `balljump-game.pages.dev` está em Authorized domains.
- [ ] Provedor Google está habilitado.
- [ ] API key aceita o domínio de produção.
- [ ] CSP permite gstatic/Firebase/Google Auth, `img-src data:` e COOP é `same-origin-allow-popups`.
- [ ] Console sem erros de CSP ao abrir login/ranking e ao renderizar uma foto.

## 9. Navegadores recomendados

- Chrome/Edge desktop (últimas versões).
- Firefox desktop.
- Safari iOS.
- Chrome Android.

## 10. Riscos de regressão

- Colisão de bolinhas com paredes em construção.
- Flood fill preenchendo região com bolinha.
- Contagem de 75% (`GOAL_CELLS`).
- +1 vida por fase e transição de nível.
- Pausa/retomada com menu, tutorial e configurações.
- Edição de perfil: nick/foto preservados na sincronização, limites de tamanho e fallback de avatar.
- CSP bloqueando script/style/favicon ou a foto em data URL.
- Coordenadas de toque em telas redimensionadas.
- Desempenho em níveis altos.

## 11. Automação futura

Não há suíte automatizada de gameplay no momento. Se adicionada, priorizar:

1. smoke de carregamento e menu;
2. construção/flood fill via estado;
3. conclusão de nível e incremento de vida;
4. headers/CSP;
5. screenshots de regressão visual.
