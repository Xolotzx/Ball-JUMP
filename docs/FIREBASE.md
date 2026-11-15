# Firebase — autenticação e ranking

> O jogo usa um Firebase **compartilhado com o Botanica Studio**. O projeto é
> `botanicstudio`; as contas Google e o Firestore são os mesmos, mas os dados do
> Balljump ficam em coleções separadas.

## 1. Status atual

- **Projeto:** `botanicstudio`
- **App Web:** `Botanica Studio Web` (configuração pública reutilizada)
- **Auth:** Google habilitado
- **Domínio autorizado:** `ted-io.pages.dev`
- **Domínio legado:** `balljump-game.pages.dev` (mantido autorizado durante a transição)
- **Firestore:** banco `(default)`
- **Coleção do jogo:** `balljumpProfiles`
- **SDK:** Firebase JS modular **10.14.1**, carregado sob demanda do gstatic
- **Regras:** publicadas no projeto compartilhado, incluindo as regras do Botanica

A `apiKey` do Firebase é pública por design. As regras do Firestore são o
controle de acesso. **Nunca** coloque service account, chave privada, token
administrativo ou `.env` no repositório.

## 2. Experiência do jogador

1. O jogo funciona offline e sem login.
2. Ao morrer (ou vencer), abre a tela de fim de jogo com o botão
   **Entrar com Google**.
3. Ao entrar:
   - um perfil `balljumpProfiles/{uid}` é criado/atualizado;
   - o nick é reservado em `balljumpNicknames/{key}` para garantir unicidade;
   - o melhor streak e o maior nível da corrida são enviados;
   - o perfil entra no ranking.
4. O jogador pode personalizar o perfil (nick e foto) pela tela de morte ou
   pelo ranking. A foto é opcional e fica salva no próprio documento.
5. Nicks são únicos por chave normalizada: minúsculas, sem acentos e com
   separadores colapsados. `Lucas`, `lucas` e `LUCAS!` são o mesmo nick.
6. Se o nome do Google já estiver em uso, o primeiro login cria uma variante
   automática (`Lucas 2`, `Lucas 3`, ...). O jogador pode trocar depois.
7. O jogador pode abrir o ranking pelo botão **Ranking** no menu ou pelo botão
   **Ver ranking** na tela de fim de jogo.
8. O ranking tem um seletor **Geral / Fácil / Normal / Difícil / Hardcore / Doce** e
   abas **🔥 Streak**, **🏆 Níveis** e **⭐ Pontos** (Pontos aparece no modo Doce),
   mostrando o top 10 do modo selecionado.
9. O modo **Doce** é um match-3 de 100 fases: troque doces adjacentes, junte 3+,
   cumpra a meta antes do tempo e avance. As vidas são substituídas por tempo.
   Bombas aparecem no tabuleiro e explodem a área 3×3 quando trocadas com um doce.
10. A cada 10 fases o modo Doce aumenta a dificuldade (mais tipos, meta maior e
    menos tempo), até a fase 100.
11. O título acompanha a seleção: “Ranking geral”, “Ranking modo fácil”,
    “Ranking modo doce”, etc.

## 3. Modelo de dados

```text
balljumpProfiles/{uid} {
  name: string          // nick público, 1..40 caracteres (UI limita a 30)
  photo: string         // opcional: data URL JPEG/PNG/WebP, até 90.000 chars
  bestStreak: int       // 0..1.000.000, melhor histórico geral
  bestLevel: int        // 1..100, maior nível histórico geral
  scores: map           // opcional: melhores por dificuldade
  candy: map            // opcional: melhores do modo doce
  updatedAt: timestamp  // serverTimestamp()
}

scores = {
  easy:     { bestStreak: int, bestLevel: int },
  normal:   { bestStreak: int, bestLevel: int },
  hard:     { bestStreak: int, bestLevel: int },
  hardcore: { bestStreak: int, bestLevel: int }
}

candy = {
  bestStreak: int,      // 0..1.000.000
  bestLevel: int,       // 1..100
  bestScore: int        // 0..100.000.000
}
```

- `candy` só existe depois que o jogador conclui uma corrida no modo doce.
- O ranking Doce consulta `candy.bestStreak`, `candy.bestLevel` e `candy.bestScore`.
- Uma corrida do modo doce não altera os campos globais do modo clássico.

- Cada chave de `scores` só existe depois que o jogador conclui uma corrida naquela
  dificuldade. Perfis antigos sem `scores` continuam válidos e aparecem no ranking
  **Geral**; entram nos rankings de modo ao jogar.
- As chaves ausentes não aparecem nas consultas `orderBy('scores.<modo>...')`, então
  o ranking de um modo não lista quem nunca jogou nele.
- `bestStreak`/`bestLevel` globais continuam sendo o máximo histórico e alimentam o
  ranking **Geral**.

balljumpNicknames/{key} {
  uid: string           // dono da reserva
  name: string          // nick na grafia original
  updatedAt: timestamp  // serverTimestamp()
}
```

- O nick começa como o `displayName` do Google, mas pode ser alterado; nas
  sincronizações seguintes o nick e a foto já salvos são preservados.
- A reserva de nick é criada e liberada dentro da mesma transação do perfil.
  Ao renomear, o cliente apaga a reserva antiga e cria a nova.
- Conflitos de nome simultâneos são resolvidos pela transação: um jogador fica
  com o nick e o outro recebe `nickname-taken` (ou uma variante automática no
  primeiro login).
- Perfis antigos com nomes duplicados são corrigidos no próximo login: quem
  chegar depois recebe um sufixo automático.
- A foto é opcional, recortada em 160×160 e comprimida no navegador para JPEG
  (data URL). Não usamos Firebase Storage.
- Não armazenamos e-mail, telefone ou qualquer dado além de nick, foto opcional
  e scores.
- O perfil é criado no primeiro login, mesmo com scores 0/1, para que o jogador
  já tenha uma entrada no ranking.
- Atualizações são monotônicas: os scores nunca podem diminuir.
- O documento é público para **usuários autenticados** (necessário para o rank).
- Não há exclusão automática; uma solicitação de remoção deve ser tratada pelo
  mantenedor no console do Firestore.

## 4. Regras do Firestore

As regras vivem no projeto compartilhado, no arquivo:

```text
Botanica Studio/botanicstudio/firebase/firestore.rules
```

O bloco do ranking e dos nicks é:

```javascript
function isBalljumpOwner(uid) {
  return request.auth != null && request.auth.uid == uid;
}

function isBalljumpModeScore(score) {
  return score is map
    && score.keys().hasOnly(['bestStreak', 'bestLevel'])
    && score.bestStreak is int && score.bestStreak >= 0 && score.bestStreak <= 1000000
    && score.bestLevel is int && score.bestLevel >= 1 && score.bestLevel <= 100;
}

function isBalljumpScores(scores) {
  return scores is map
    && scores.size() <= 4
    && scores.keys().hasOnly(['easy', 'normal', 'hard', 'hardcore'])
    && (!scores.keys().hasAny(['easy']) || isBalljumpModeScore(scores.easy))
    && (!scores.keys().hasAny(['normal']) || isBalljumpModeScore(scores.normal))
    && (!scores.keys().hasAny(['hard']) || isBalljumpModeScore(scores.hard))
    && (!scores.keys().hasAny(['hardcore']) || isBalljumpModeScore(scores.hardcore));
}

function isBalljumpCandy(candy) {
  return candy is map
    && candy.keys().hasOnly(['bestStreak', 'bestLevel', 'bestScore'])
    && candy.bestStreak is int && candy.bestStreak >= 0 && candy.bestStreak <= 1000000
    && candy.bestLevel is int && candy.bestLevel >= 1 && candy.bestLevel <= 100
    && candy.bestScore is int && candy.bestScore >= 0 && candy.bestScore <= 100000000;
}

function isBalljumpProfile(p) {
  return p.keys().hasOnly(['name', 'photo', 'bestStreak', 'bestLevel', 'scores', 'candy', 'updatedAt'])
    && p.name is string && p.name.size() >= 1 && p.name.size() <= 40
    && p.photo is string && p.photo.size() <= 90000
    && (p.photo.size() == 0 || p.photo.matches('^data:image/(jpeg|png|webp);base64,.*'))
    && p.bestStreak is int && p.bestStreak >= 0 && p.bestStreak <= 1000000
    && p.bestLevel is int && p.bestLevel >= 1 && p.bestLevel <= 100
    && (!p.keys().hasAny(['scores']) || isBalljumpScores(p.scores))
    && (!p.keys().hasAny(['candy']) || isBalljumpCandy(p.candy))
    && p.updatedAt == request.time;
}

match /balljumpProfiles/{uid} {
  allow read: if request.auth != null;
  allow create: if isBalljumpOwner(uid) && isBalljumpProfile(request.resource.data);
  allow update: if isBalljumpOwner(uid)
    && isBalljumpProfile(request.resource.data)
    && request.resource.data.bestStreak >= resource.data.bestStreak
    && request.resource.data.bestLevel >= resource.data.bestLevel;
  allow delete: if false;
}

function isBalljumpNickname(n) {
  return n.keys().hasOnly(['uid', 'name', 'updatedAt'])
    && n.uid is string && n.uid.size() >= 1 && n.uid.size() <= 128
    && n.name is string && n.name.size() >= 1 && n.name.size() <= 40
    && n.updatedAt == request.time;
}

match /balljumpNicknames/{key} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && key.size() >= 1 && key.size() <= 80
    && request.resource.data.uid == request.auth.uid
    && isBalljumpNickname(request.resource.data);
  allow update: if request.auth != null
    && key.size() >= 1 && key.size() <= 80
    && resource.data.uid == request.auth.uid
    && request.resource.data.uid == request.auth.uid
    && isBalljumpNickname(request.resource.data);
  allow delete: if request.auth != null
    && key.size() >= 1 && key.size() <= 80
    && resource.data.uid == request.auth.uid;
}
```

Publicação:

```powershell
cd "C:\...\Botanica Studio\botanicstudio"
npx --yes firebase-tools deploy --only firestore:rules --project botanicstudio
```

> Ao alterar regras do Botanica, inclua também as regras do Balljump no mesmo
> arquivo. Caso contrário, um deploy futuro do Botanica remove o acesso ao rank.

## 5. Autorização do domínio

O domínio `ted-io.pages.dev` está em **Authentication → Settings →
Authorized domains**. Sem ele, o login retorna `auth/unauthorized-domain`.

Também foi validado:

- provedor Google habilitado;
- `apiKey` aceita requisições com referer `https://ted-io.pages.dev/`;
- CSP permite os domínios do Firebase;
- COOP usa `same-origin-allow-popups` para o popup OAuth funcionar.

## 6. Cliente

- Configuração pública em `FIREBASE_CONFIG` no `index.html`.
- O SDK é importado dinamicamente somente ao abrir a tela de morte/ranking ou
  clicar em login; o jogo principal não depende de rede.
- `signInWithPopup` é o caminho principal. Se o navegador bloquear popups, o
  app tenta `signInWithRedirect` e usa `sessionStorage` para preservar a corrida
  pendente.
- O login persiste entre recarregamentos (persistência padrão do Firebase Auth).
- `signOut` limpa o perfil da sessão na interface; o documento permanece no
  ranking.
- O nome do jogador é renderizado sempre com `textContent` (nunca `innerHTML`).
- A foto é validada (`data:image/(jpeg|png|webp);base64,`) antes de virar
  `background-image`; valores inválidos caem para a inicial do nick.
- O editor de perfil abre pela tela de morte (**Editar perfil**) ou pelo
  ranking (**Editar**). Ele permite trocar o nick e escolher/remover a foto.
- A imagem escolhida é recortada em 160×160, comprimida em JPEG (qualidade
  decrescente) e rejeitada se passar de 90.000 caracteres.
- O arquivo é decodificado com `createImageBitmap` (sem URL) e, como fallback,
  com `FileReader` + data URL. Não usamos `blob:` porque a CSP permite apenas
  `img-src data:`.
- Fotos HEIC de iPhone não são decodificadas pelo navegador; a UI orienta a
  converter para JPG/PNG/WebP. O limite de entrada é 15 MB.
- A gravação usa `runTransaction`, preserva `bestStreak`/`bestLevel` atuais e
  atualiza `updatedAt` com `serverTimestamp()`.
- Unicidade de nick:
  - `nicknameKeyFor()` normaliza o nick (minúsculas, sem acentos, separadores
    colapsados em `-`) e usa essa chave em `balljumpNicknames/{key}`.
  - `claimNickname()` lê a reserva e, se a chave já pertence a outro UID, o
    salvamento falha com `nickname-taken` ("Esse nick já está em uso").
  - No primeiro login/sincronização, se o nome do Google estiver ocupado, o app
    tenta sufixos `2..40` e, em último caso, um sufixo derivado do UID.
  - Ao renomear, a reserva antiga é apagada e a nova é gravada na mesma
    transação. Duas pessoas não conseguem confirmar o mesmo nick ao mesmo tempo
    porque as transações conflitam na mesma reserva.
- Ranking por dificuldade:
  - `openEndModal` salva a corrida pendente com `difficulty` (easy/normal/hard/hardcore).
  - `syncProfile` mescla o resultado em `scores.<modo>` com `max`, preservando
    os outros modos e atualizando os campos globais.
  - `loadRanks` consulta `orderBy('scores.<modo>.bestStreak')` e
    `.bestLevel`; o modo **Geral** consulta `bestStreak`/`bestLevel`.
  - O cache é por modo (`rankData[modo]`), com requisições concorrentes
    descartadas por `rankRequest`.
  - O seletor de modo é gerado a partir de `DIFFICULTIES`; o título vira
    “Ranking modo fácil”, “Ranking modo normal”, etc.
- Modo Doce (match-3):
  - tabuleiro 8×8; troca de doces adjacentes, detecção de 3+ e cascatas;
  - 100 fases; cada fase tem meta de pontos e tempo próprio (sem vidas);
  - a cada 10 fases entram mais tipos de doce, a meta sobe e o tempo cai;
  - o resultado pendente usa `mode:'candy'` com `bestStreak`, `bestLevel` e
    `bestScore`;
  - `syncProfile` grava/atualiza apenas `candy`, sem mexer nos scores clássicos;
  - o ranking Doce consulta `candy.bestStreak`, `candy.bestLevel` e
    `candy.bestScore`.

## 7. CSP e rede

`_headers` permite somente:

- `script-src https://www.gstatic.com https://apis.google.com`;
- `connect-src` para Firestore, Identity Toolkit, Secure Token, Google APIs e
  o domínio de autenticação;
- `frame-src` para o domínio de autenticação e Google;
- `img-src data:` (necessário para as fotos de perfil em data URL).

O jogo em si continua sem chamadas de rede. Se o SDK falhar, a tela de fim de
jogo mostra o erro e o botão **Jogar novamente** continua disponível.

## 8. Teste manual recomendado

1. Abra https://ted-io.pages.dev.
2. Jogue até perder as vidas.
3. Na tela de morte, clique em **Entrar com Google**.
4. Autorize a conta; verifique se o perfil aparece e se o botão de ranking
   carrega as duas abas.
5. Clique em **Editar perfil**, troque o nick, escolha uma foto e salve.
6. Confirme que o nick e a foto aparecem na tela de morte, no ranking e na
   linha do jogador; recarregue a página e confira que persistiram.
7. Remova a foto, salve e confirme o fallback para a inicial do nick.
8. Com outra conta Google, tente salvar o mesmo nick: deve aparecer
   **"Esse nick já está em uso"**. Confirme que o primeiro jogador mantém o nick.
9. Altere o nick da segunda conta para um nome livre e confirme que o antigo
   volta a ficar disponível.
10. Jogue uma corrida em cada dificuldade e confira:
    - **Ranking modo fácil/normal/difícil/hardcore** lista apenas quem jogou o modo;
    - as abas **Streak** e **Níveis** mostram os valores daquele modo;
    - o **Ranking geral** continua com o melhor histórico.
11. No menu, abra **Modo Doce**:
    - troque doces, faça 3+ e confira pontos, sequência e progresso;
    - deixe o tempo acabar e confira a tela **FIM DO TEMPO** com pontos;
    - entre com Google e confira **Ranking → Doce** nas abas Streak, Níveis e Pontos;
    - avance de fase e confira a meta/tempo; na fase 11 a dificuldade deve aumentar;
    - complete a fase 100 para validar a vitória.
12. Abra em outro navegador/dispositivo com a mesma conta e confira o perfil.
13. Confira no console do Firebase → Firestore → `balljumpProfiles` e
    `balljumpNicknames`.
14. Teste o botão **Sair** e o login novamente.
15. Teste com popups bloqueados para validar o fallback de redirecionamento.

## 9. Troubleshooting

| Sintoma | Causa provável | Correção |
| --- | --- | --- |
| `auth/unauthorized-domain` | domínio fora da lista | adicionar em Authorized domains |
| Popup não abre | bloqueador de popups | permitir popups; fallback de redirect |
| `permission-denied` | regras ausentes/desatualizadas | publicar as regras mescladas |
| `unavailable` | rede/offline | o jogo segue local; tentar novamente |
| `api-key-not-valid` / referrer | restrição de API key | revisar restrições no Google Cloud |
| Perfil não aparece | transação falhou | ver console/rede e regras |
| Foto não salva | imagem acima de 90.000 chars ou campo `photo` fora das regras | usar imagem menor; publicar as regras mescladas |
| Nick volta ao nome do Google | sincronização sobrescreveu o perfil | confirmar que a regra e o cliente preservam `name`/`photo` |
| Nick duplicado em perfis antigos | perfis criados antes da reserva | fazer login com cada conta; o app cria a reserva e aplica sufixo se necessário |
| Nick recusado mesmo livre | reserva antiga ainda existe | verificar `balljumpNicknames/{key}`; o dono precisa renomear/liberar |
| `permission-denied` ao salvar nick | regras de `balljumpNicknames` não publicadas | publicar as regras mescladas |
| Ranking de um modo vazio | ninguém jogou aquele modo ou falta `scores.<modo>` | jogar uma corrida no modo; conferir o campo `scores` |
| Ranking por modo não carrega | consulta `orderBy('scores.<modo>...')` inválida | conferir o nome do modo (`easy/normal/hard/hardcore`) e as regras |
| Ranking Doce vazio | ninguém terminou uma corrida no modo doce | jogar até o tempo acabar e entrar com Google |
| Pontuação do Doce não salva | campo `candy` fora das regras | conferir `candy.bestScore` e publicar as regras |
| Ranking vazio | nenhum perfil criado ainda | entrar com Google para criar o primeiro |

Não registre tokens, cookies ou credenciais nos logs de suporte.
