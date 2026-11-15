# Política de segurança

## Versões suportadas

A versão publicada em https://balljump-game.pages.dev e a branch `main` do repositório privado são as versões suportadas.

## Como relatar uma vulnerabilidade

Não abra uma issue pública com detalhes de exploração.

Use o recurso **Private vulnerability reporting / Security advisories** do GitHub neste repositório. Inclua:

- versão ou URL afetada;
- passos para reproduzir;
- impacto esperado;
- se possível, uma sugestão de correção.

O mantenedor fará a triagem em caráter de melhor esforço, confirmará o recebimento e combinará a divulgação responsável.

## Escopo

- `index.html` e comportamento do jogo no navegador.
- Headers HTTP e configuração de publicação em Cloudflare Pages.
- Exposição acidental de segredos no repositório ou no site.

## Fora de escopo

- Vulnerabilidades na infraestrutura do GitHub, Cloudflare ou provedores de navegador (relate diretamente ao provedor).
- Ataques de engenharia social.
- Negação de serviço volumétrica ou testes destrutivos contra a produção.
- Problemas que exijam acesso físico ao dispositivo do usuário.

## Diretrizes para pesquisadores

- Não acesse, altere ou exfiltre dados de terceiros.
- Não execute testes que degradem o serviço.
- Dê tempo razoável para correção antes de qualquer divulgação.

A política técnica detalhada, o modelo de ameaças e os controles estão em [`docs/SECURITY.md`](docs/SECURITY.md).
