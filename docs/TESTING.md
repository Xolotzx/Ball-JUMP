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
- [ ] `_headers` contém CSP e headers de proteção.
- [ ] Deploy feito de `dist/`, não da raiz do repositório.
- [ ] Caminhos internos (ex.: `/AGENTS.md`) retornam 404 e não expõem documentação.
- [ ] URL de produção carrega a versão nova.
- [ ] `curl.exe -I https://balljump-game.pages.dev/` mostra os headers esperados.
- [ ] Console do navegador sem erros de CSP.
- [ ] Menu, jogo, tutorial e configurações funcionam em produção.
- [ ] Repositório permanece privado.

## 8. Navegadores recomendados

- Chrome/Edge desktop (últimas versões).
- Firefox desktop.
- Safari iOS.
- Chrome Android.

## 9. Riscos de regressão

- Colisão de bolinhas com paredes em construção.
- Flood fill preenchendo região com bolinha.
- Contagem de 75% (`GOAL_CELLS`).
- +1 vida por fase e transição de nível.
- Pausa/retomada com menu, tutorial e configurações.
- CSP bloqueando script/style/favicon.
- Coordenadas de toque em telas redimensionadas.
- Desempenho em níveis altos.

## 10. Automação futura

Não há suíte automatizada de gameplay no momento. Se adicionada, priorizar:

1. smoke de carregamento e menu;
2. construção/flood fill via estado;
3. conclusão de nível e incremento de vida;
4. headers/CSP;
5. screenshots de regressão visual.
