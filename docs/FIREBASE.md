# Firebase — autenticação e ranking

> O jogo usa um Firebase **compartilhado com o Botanica Studio**. O projeto é
> `botanicstudio`; as contas Google e o Firestore são os mesmos, mas os dados do
> Balljump ficam em coleções separadas.

## 1. Status atual

- **Projeto:** `botanicstudio`
- **App Web:** `Botanica Studio Web` (configuração pública reutilizada)
- **Auth:** Google habilitado
- **Domínio autorizado:** `balljump-game.pages.dev`
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
   - o melhor streak e o maior nível da corrida são enviados;
   - o perfil entra no ranking.
4. O jogador pode abrir o ranking pelo botão **Ranking** no menu ou pelo botão
   **Ver ranking completo** na tela de fim de jogo.
5. O ranking tem abas **🔥 Streak** e **🏆 Níveis**, mostrando o top 10.

## 3. Modelo de dados

```text
balljumpProfiles/{uid} {
  name: string          // displayName do Google, 1..40 caracteres
  bestStreak: int       // 0..1.000.000, máximo histórico
  bestLevel: int        // 1..100, maior nível alcançado
  updatedAt: timestamp  // serverTimestamp()
}
```

- Não armazenamos e-mail, foto, telefone ou qualquer dado além do nome público
  escolhido no perfil Google e dos scores.
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

O bloco do ranking é:

```javascript
function isBalljumpOwner(uid) {
  return request.auth != null && request.auth.uid == uid;
}

function isBalljumpProfile(p) {
  return p.keys().hasOnly(['name', 'bestStreak', 'bestLevel', 'updatedAt'])
    && p.name is string && p.name.size() >= 1 && p.name.size() <= 40
    && p.bestStreak is int && p.bestStreak >= 0 && p.bestStreak <= 1000000
    && p.bestLevel is int && p.bestLevel >= 1 && p.bestLevel <= 100
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
```

Publicação:

```powershell
cd "C:\...\Botanica Studio\botanicstudio"
npx --yes firebase-tools deploy --only firestore:rules --project botanicstudio
```

> Ao alterar regras do Botanica, inclua também as regras do Balljump no mesmo
> arquivo. Caso contrário, um deploy futuro do Botanica remove o acesso ao rank.

## 5. Autorização do domínio

O domínio `balljump-game.pages.dev` está em **Authentication → Settings →
Authorized domains**. Sem ele, o login retorna `auth/unauthorized-domain`.

Também foi validado:

- provedor Google habilitado;
- `apiKey` aceita requisições com referer `https://balljump-game.pages.dev/`;
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

## 7. CSP e rede

`_headers` permite somente:

- `script-src https://www.gstatic.com https://apis.google.com`;
- `connect-src` para Firestore, Identity Toolkit, Secure Token, Google APIs e
  o domínio de autenticação;
- `frame-src` para o domínio de autenticação e Google;
- `img-src data:` (não usamos fotos de perfil).

O jogo em si continua sem chamadas de rede. Se o SDK falhar, a tela de fim de
jogo mostra o erro e o botão **Jogar novamente** continua disponível.

## 8. Teste manual recomendado

1. Abra https://balljump-game.pages.dev.
2. Jogue até perder as vidas.
3. Na tela de morte, clique em **Entrar com Google**.
4. Autorize a conta; verifique se o perfil aparece e se o botão de ranking
   carrega as duas abas.
5. Abra em outro navegador/dispositivo com a mesma conta e confira o perfil.
6. Confira no console do Firebase → Firestore → `balljumpProfiles`.
7. Teste o botão **Sair** e o login novamente.
8. Teste com popups bloqueados para validar o fallback de redirecionamento.

## 9. Troubleshooting

| Sintoma | Causa provável | Correção |
| --- | --- | --- |
| `auth/unauthorized-domain` | domínio fora da lista | adicionar em Authorized domains |
| Popup não abre | bloqueador de popups | permitir popups; fallback de redirect |
| `permission-denied` | regras ausentes/desatualizadas | publicar as regras mescladas |
| `unavailable` | rede/offline | o jogo segue local; tentar novamente |
| `api-key-not-valid` / referrer | restrição de API key | revisar restrições no Google Cloud |
| Perfil não aparece | transação falhou | ver console/rede e regras |
| Ranking vazio | nenhum perfil criado ainda | entrar com Google para criar o primeiro |

Não registre tokens, cookies ou credenciais nos logs de suporte.
