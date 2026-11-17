# Testes — ted-io

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

- [ ] Menu inicial aparece ao entrar com o nome **ted-io** no título da aba e no cartão.
- [ ] O fundo do menu usa ondas no tema escuro e fita laranja no claro; o app clássico fica oculto atrás.
- [ ] Existem os botões **Jogar**, **Ranking** e **Configurações**; não há **Como jogar** nem **Modo Doce** duplicado no menu.
- [ ] **Jogar** abre o seletor com **Modo Clássico**, **Modo Doce** e **Modo Flappy**.
- [ ] Escolher **Modo Clássico** fecha o menu e inicia a partida clássica.
- [ ] Escolher **Modo Doce** fecha o menu e abre o tabuleiro de doces.
- [ ] Escolher **Modo Flappy** fecha o menu e abre o voo entre canos.
- [ ] Fechar o seletor (X, clique fora ou Esc) retorna ao menu sem iniciar partida.
- [ ] **← Menu** no HUD clássico pausa a partida e volta ao menu; **Jogar → Modo Clássico** retoma nível, vidas e progresso.
- [ ] **Como jogar** dentro das configurações abre o tutorial do **modo ativo** (Clássico, Doce ou Flappy); “Voltar” retorna às configurações.
- [ ] O tutorial mostra o guia certo ao abrir pelas configurações do menu, do Clássico, do Doce e do Flappy.
- [ ] “Voltar ao jogo” no tutorial aberto pelas configurações retoma a partida.
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
- [ ] Slider de volume ajusta de 0 a 100%, mostra a porcentagem e persiste.
- [ ] Volume 0 deixa o jogo em silêncio; ao subir, os efeitos voltam.
- [ ] Slider fica visualmente esmaecido quando o som está desligado, mas continua ajustável.
- [ ] **Como jogar** dentro das configurações abre o tutorial por cima, com o guia do modo ativo; **Voltar** retorna às configurações.
- [ ] **Voltar ao jogo** no tutorial aberto pelas configurações fecha os dois e retoma a partida.
- [ ] Recarregar a página preserva tema, dificuldade, som e volume, mas volta ao menu.

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
- [ ] `curl.exe -I https://ted-io.pages.dev/` mostra os headers esperados.
- [ ] Console do navegador sem erros de CSP.
- [ ] Menu, jogo, tutorial e configurações funcionam em produção.
- [ ] Repositório permanece privado.

## 8. Firebase, login, perfil e ranking

- [ ] A tela de morte abre ao perder todas as vidas e mostra sequência/nível da corrida.
- [ ] A tela de vitória no nível 100 usa o mesmo fluxo.
- [ ] O botão **Entrar com Google** fica habilitado após o SDK carregar.
- [ ] Login com conta Google real cria `balljumpProfiles/{uid}` e mostra o perfil.
- [ ] O perfil exibe nick, melhor streak e melhor nível, com foto quando houver.
- [ ] O botão **Ver ranking** abre o ranking na família correta.
- [ ] O top 10 é ordenado corretamente; a linha do próprio jogador é destacada.
- [ ] Trocar de família/aba não quebra a lista.
- [ ] **Sair** volta ao estado de login.
- [ ] O menu **Ranking** mostra as famílias **Clássico 🧱**, **Doce 🍪** e **Flappy 🐦**.
- [ ] O menu **Ranking** abre o ranking mesmo antes de morrer.
- [ ] Em **Clássico 🧱**, aparecem as abas **Geral / Fácil / Normal / Difícil / Hardcore** e **Streak / Níveis**.
- [ ] O título do clássico acompanha a dificuldade: “Ranking clássico — Fácil”, etc.
- [ ] O ranking de cada dificuldade lista apenas jogadores que jogaram aquele modo.
- [ ] O ranking **Geral** continua mostrando o melhor histórico.
- [ ] Em **Doce 🍪**, a linha de dificuldades some e aparecem **Streak / Níveis / Pontos**.
- [ ] Em **Flappy 🐦**, a linha de dificuldades some e aparecem **Streak / Níveis / Pontos**.
- [ ] A aba **Pontos** só aparece nas famílias Doce e Flappy.
- [ ] Trocar entre Clássico, Doce e Flappy atualiza título, abas e lista sem misturar dados.
- [ ] Jogar uma corrida no modo Fácil atualiza o ranking Fácil e não altera os outros modos.
- [ ] Trocar de modo rapidamente não deixa linhas de outro modo na lista.
- [ ] Perfil antigo sem `scores` aparece no Geral e passa a aparecer no modo após jogar.
- [ ] O nome do jogador é exibido como texto (testar um nome com `<b>`; não deve virar HTML).

### Modo Doce (match-3)

- [ ] Em **Jogar → Modo Doce**, o tabuleiro de doces abre corretamente.
- [ ] O tabuleiro tem 8×8 doces, sem matches iniciais e com pelo menos uma jogada possível.
- [ ] Um quadrado 2×2 do mesmo tipo também é uma combinação válida.
- [ ] O especial **⚡** aparece no tabuleiro e, trocado com um doce, elimina todos os doces daquele tipo.
- [ ] Duas ⚡ juntas causam a sobrecarga e limpam o tabuleiro.
- [ ] A partir da fase 21 aparecem doces com **cadeado**.
- [ ] Um doce com cadeado não pode ser trocado e precisa de 2 detonações para sumir.
- [ ] Cadeados não caem e bloqueiam a passagem dos doces na coluna.
- [ ] Trocar doces adjacentes que formam 3+ limpa as peças, pontua e preenche a coluna.
- [ ] Uma troca inválida desfaz o movimento e zera a sequência.
- [ ] Cascatas mostram combo e somam pontos.
- [ ] O tempo começa em 60 s na fase 1 e diminui a cada 10 fases; não há vidas.
- [ ] A meta começa em 750 e sobe 500 a cada 5 fases: 750 nas fases 1–5, 1.250 nas fases 6–10, 2.750 na fase 21 e 10.250 na fase 100; a barra de progresso acompanha.
- [ ] O ⚡ aparece com menos frequência que as bombas e não nasce nas fases 1–7.
- [ ] Ao atingir a meta, a próxima fase começa com tabuleiro novo.
- [ ] Na fase 11 entram mais tipos e a mensagem de dificuldade aumentada aparece.
- [ ] São 5 tipos até a fase 10 e 6 tipos da fase 11 em diante; não há sétimo tipo.
- [ ] Na fase 21 surgem os cadeados no lugar do sétimo tipo.
- [ ] Na fase 31 o sétimo tipo não é adicionado.
- [ ] Bombas aparecem no tabuleiro (a partir da fase 4 no início e por chance no refill).
- [ ] Trocar uma bomba com qualquer doce explode a área 3×3 ao redor e soma pontos.
- [ ] Trocar **bomba com bomba** gera a explosão dupla: área 5×5 ao redor de cada uma, bônus de 500, flash laranja, tremida forte e som mais grave.
- [ ] Bombas vizinhas explodem em cadeia (com raio 3×3 normal).
- [ ] A explosão mostra faísca, células explodindo, texto de pontos e tremida no tabuleiro.
- [ ] O som de explosão é audível e o volume respeita o slider.
- [ ] A engrenagem do cabeçalho do modo doce abre as configurações.
- [ ] A seção de dificuldade fica oculta no modo doce e o timer pausa enquanto as configurações estão abertas.
- [ ] Fechar as configurações retoma o timer e o foco volta à engrenagem.
- [ ] **Como jogar** aberto pelas configurações do modo doce volta para elas; **Voltar ao jogo** fecha tudo e retoma o timer.
- [ ] O fundo do modo doce é o mesmo do clássico (ondas/fita), sem imagem nova.
- [ ] Ao esgotar o tempo, abre **FIM DO TEMPO** com streak, fase e pontos.
- [ ] A tela final mostra o botão **Menu** e **Jogar novamente** reinicia o modo doce.
- [ ] O ranking **Doce** tem abas Streak, Níveis e Pontos, separado dos rankings clássicos.
- [ ] O resultado do modo doce não altera os scores do modo clássico.
- [ ] A fase 100 termina em vitória.
- [ ] O tabuleiro e o HUD cabem em 320–390 px sem overflow.

### Modo Flappy (voo entre canos)

- [ ] Em **Jogar → Modo Flappy**, o voo abre com o pássaro, o HUD e a barra de progresso.
- [ ] Clique, toque, **Espaço**, **↑** e **W** fazem o pássaro bater as asas.
- [ ] A gravidade puxa o pássaro e o primeiro flap inicia a corrida.
- [ ] Passar por um cano soma pontos e avança a barra de progresso.
- [ ] Bater em um cano perde 1 vida, zera a sequência e reinicia os canos e o progresso da fase.
- [ ] Bater no chão perde 1 vida; o teto apenas limita o voo sem tirar vida.
- [ ] O HUD mostra vidas, pontos, sequência, recorde, tier e barra de progresso, sem contador numérico de canos.
- [ ] Cada fase tem 4 canos no início e chega a 8 conforme os canos passados aumentam.
- [ ] A velocidade sobe e o vão diminui conforme o total de canos avança.
- [ ] Completar os canos do bloco soma o bônus e a sequência sem interromper o voo.
- [ ] A transição entre fases é contínua: os canos não somem, o pássaro não é reposicionado e não aparece popup/mensagem de fase.
- [ ] Os canos mantêm espaçamento constante e sempre há canos entrando pela direita.
- [ ] Perder as 3 vidas abre **VIDAS ESGOTADAS** com cano e pontos.
- [ ] A tela final mostra **Menu** e **Jogar novamente** reinicia o modo flappy.
- [ ] A engrenagem do cabeçalho do modo flappy abre as configurações e pausa o voo.
- [ ] A seção de dificuldade fica oculta no modo flappy; fechar as configurações retoma o voo.
- [ ] Trocar de aba (visibilidade) pausa e retoma o voo sem teleporte.
- [ ] O ranking **Flappy** tem abas Streak, Canos e Pontos, separado dos rankings clássicos.
- [ ] O resultado do modo flappy não altera os scores do modo clássico nem o campo `candy`.
- [ ] Perder uma vida pausa o voo e mostra **TOQUE PARA CONTINUAR** com **VOCÊ AINDA TEM N VIDAS**; o próximo toque/clique/tecla retoma.
- [ ] Com 1 vida restante o texto mostra **VOCÊ AINDA TEM 1 VIDA** (singular).
- [ ] Bater com 0 vidas abre **VIDAS ESGOTADAS** sem mostrar a tela de continuar.
- [ ] Perder uma vida preserva o total de canos passados (só reseta a fase atual e a sequência).
- [ ] O 500º cano termina em vitória com a tela **500 CANOS**.
- [ ] O palco do flappy e o HUD cabem em 320–390 px sem overflow horizontal.

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
- [ ] `scores` com modo inválido, tipo errado ou valor fora do limite é negado.
- [ ] `candy` com campo inválido, nível fora de 1–100 ou score negativo é negado.
- [ ] `flappy` com campo inválido, nível fora de 1–500 ou score negativo é negado.
- [ ] Schema inválido, nome vazio/longo ou timestamp incorreto é negado.
- [ ] `photo` ausente, fora do prefixo permitido ou acima de 90.000 caracteres é negado.
- [ ] `balljumpNicknames` exige autenticação para leitura e só permite escrita ao UID dono.
- [ ] Criar/atualizar reserva com UID diferente do autenticado é negado.
- [ ] Apagar reserva de outro UID é negado.
- [ ] Nome vazio/longo ou timestamp incorreto na reserva é negado.
- [ ] `ted-io.pages.dev` está em Authorized domains.
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
