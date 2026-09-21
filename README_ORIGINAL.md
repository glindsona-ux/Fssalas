# 🔥 FFZ Salas — Bot Discord Free Fire

Bot de Discord com **componentes V2** para criação e venda semi-automática de salas
customizadas de Free Fire, integrado à API **Nix Salas FF**.

---

## 📁 Estrutura de arquivos

```
ffz-salas-bot/
├── data/
│   └── db.json                    # criado automaticamente (estoque, tickets, ranking)
├── src/
│   ├── index.js                   # entry point do bot
│   ├── register.js                # registra os slash commands globalmente
│   ├── constants.js                # configs de sala, preços, cores, IDs
│   ├── commands/
│   │   ├── setup.js                # /setup painel  |  /setup ranking
│   │   ├── criar.js                 # /criar
│   │   ├── perfil.js                # /perfil
│   │   └── status.js                # /status
│   ├── handlers/
│   │   └── interactionHandler.js    # roteador central de tudo
│   ├── panels/
│   │   ├── painelPanel.js           # painéis do /criar (criação de sala)
│   │   ├── profilePanel.js          # painel do /perfil
│   │   ├── shopPanel.js             # painel de compra "FFZ Salas"
│   │   ├── ticketPanel.js           # painéis do ticket de pagamento Pix
│   │   ├── rankingPanel.js          # painéis do ranking
│   │   └── statusPanel.js           # painel do /status
│   ├── api/
│   │   ├── roomApi.js               # comunicação com a API Nix Salas FF
│   │   └── store.js                 # persistência local (estoque, tickets, ranking)
│   └── utils/
│       └── pix.js                   # chave Pix aleatória + payload EMV + QR neon
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ .env

```env
# Discord
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui

# Nix Salas FF
ROOM_API_KEY=seu_token_nix_aqui

# Canal onde os tickets de compra são abertos (thread privada)
TICKET_CHANNEL_ID=id_do_canal_aqui

# Cargo mencionado para aprovar/recusar pagamento
STAFF_ROLE_ID=id_do_cargo_aqui

# Link do servidor de vendas (botão "Comprar Salas" no aviso de sem salas)
STORE_INVITE=https://discord.gg/seu-link
```

| Variável             | Obrigatório | Descrição                                             |
|----------------------|:-----------:|---------------------------------------------------------|
| `DISCORD_TOKEN`      | ✅          | Token do bot no Discord Developer Portal                |
| `CLIENT_ID`          | ✅          | Application ID do bot                                    |
| `ROOM_API_KEY`       | ✅          | Token de autenticação da API Nix Salas FF                |
| `TICKET_CHANNEL_ID`  | ✅          | Canal onde as threads privadas de compra são criadas      |
| `STAFF_ROLE_ID`      | ✅          | Cargo mencionado quando o comprador clica "Já Paguei"     |
| `STORE_INVITE`       | ✅          | Link do servidor de vendas (botão "Comprar Salas")        |
| `OWNER_ID`           | ⬜          | ID(s) Discord do(s) dev(s), separados por vírgula — libera `/dev-painel` |
| `APOSTA_CHANNEL_ID`  | ⬜          | Canal onde o nome da configuração na mensagem cria a sala automaticamente |

> Comandos são registrados **globalmente** (todos os servidores onde o bot estiver), sem precisar de `GUILD_ID`.

---

## 🚀 Instalação

```bash
npm install
cp .env.example .env      # preencha com seus dados
node src/register.js      # registra os slash commands globalmente
npm start
```

> ⚠️ O registro global pode levar até 1 hora para propagar em todos os servidores.

---

## 🎮 Comandos

### `/setup painel`
Envia o painel de compra público **"FFZ Salas"** no canal.
`Permissão: restrito ao(s) ID(s) em OWNER_ID no .env` — mesmo quem tem Gerenciar
Servidor recebe erro se não estiver na lista.

### `/criar`
Abre o painel de criação de salas (select de configuração).
`Permissão: Administrador`

### `/perfil`
Mostra o perfil do usuário: total de salas criadas, senha padrão configurada,
minutos até o início automático, link de instalação e botões **Comprar**,
**Ajustes** (define senha padrão / início automático), **Transferir** (manda
salas do saldo pra outra pessoa) e atualizar.
`Permissão: Todos`

### `/status`
Mostra container efêmero com foto, nome, ID, salas disponíveis e total de salas criadas.
`Permissão: Todos`

### `/dev-painel`
Envia o painel de convite do bot (botões "Adicionar no servidor" e "Adicionar aplicativo").
`Permissão: restrito ao(s) ID(s) em OWNER_ID no .env` — qualquer outra pessoa que tentar
usar recebe uma mensagem de erro ephemeral.

### `/lucro`
Mostra lucro de hoje, lucro total e histórico dos últimos 7 dias com vendas confirmadas.
`Permissão: restrito ao(s) ID(s) em OWNER_ID no .env`

### `/setup sobre`
Envia o painel "O que ele faz" com os recursos do bot e os bancos suportados.
`Permissão: Gerenciar Servidor`

---

## 🔄 Fluxos completos

### 1. Criação de sala (`/criar`)

```
Admin usa /criar
   ↓
Container com select de configurações (Gelo Normal, Gelo Infinito, Tático…)
   ↓
Usuário seleciona um tipo
   ├─ Sem saldo → Container vermelho de aviso + botão [Comprar Salas] (link) + [Voltar]
   └─ Com saldo → POST /rooms na Nix → container atualizado in-place:
                     ✅ Sala Criada com Sucesso!
                     🆔 ID da Sala · 🔑 Senha (spoiler) · 📊 Status
                     [▶️ Iniciar Sala] [🔄 Atualizar] [🔗 Link de Convite]
```

### 2. Compra de salas (`/setup painel`)

```
Usuário clica [🛒 COMPRAR]
   ↓
Modal: "Quantas salas você quer?" (mínimo 50)
   ↓
Bot calcula: quantidade × R$ 0,05
   ↓
Bot cria THREAD PRIVADA no canal TICKET_CHANNEL_ID
   ↓
Envia container neon com:
   💳 Quantidade · Valor · QR Code Pix (neon, anexado) · Chave Pix aleatória
   [✅ Já Paguei]
   ↓
Usuário clica [✅ Já Paguei]
   ↓
Bot menciona @STAFF_ROLE_ID + container de aprovação:
   [✅ Confirmar]  [❌ Recusar]
   ↓
   ├─ Confirmar → adiciona saldo ao usuário → arquiva e trava o tópico
   └─ Recusar   → não adiciona nada → arquiva e trava o tópico
```

### 3. Ranking (`/setup ranking`)

```
Painel fixo no canal: "🏆 Ranking FFZ Salas" + botão [Ver]
   ↓
Qualquer um clica [Ver]
   ↓
Container efêmero:
   🥇 Fulano — 120 salas
   🥈 Ciclano — 98 salas
   🥉 Beltrano — 75 salas
   4. Outro — 40 salas
```

---

## 🔌 Endpoints usados da API Nix Salas FF

| Método | Rota                          | Uso no bot                          |
|--------|-------------------------------|---------------------------------------|
| POST   | `/rooms`                       | Criação da sala ao selecionar no `/criar` |
| GET    | `/rooms/{session_id}`          | Botão **Atualizar**                    |
| POST   | `/rooms/{session_id}/start`    | Botão **Iniciar Sala**                 |
| POST   | `/rooms/{session_id}/release`  | (disponível em `roomApi.js`, não usado em botão por padrão) |

Base URL fixa: `https://salas.nixbot.vip`
Autenticação: `Authorization: Bearer ROOM_API_KEY`

---

## 💳 Sobre o Pix gerado

O módulo `src/utils/pix.js`:

- Gera uma **chave aleatória** no formato EVP (UUID v4) — mesmo formato usado pelo Banco Central para chaves aleatórias reais.
- Monta o **payload EMV** (BR Code) completo, incluindo CRC16 válido, compatível com qualquer app de banco para leitura de QR Code estático.
- Renderiza um **QR Code neon** (ciano/magenta, com glow e cantoneiras estilo scanner) em PNG, anexado automaticamente na thread.

> ⚠️ **Importante:** esta chave Pix é gerada aleatoriamente e **não está vinculada a uma conta bancária real**. Ela serve para exibir o layout e o fluxo completo. Para receber pagamentos de verdade, troque `gerarChavePix()` pela chave Pix real da sua conta (ou pela função de geração de cobrança do seu PSP/banco), mantendo o mesmo formato de retorno.

---

## ✨ Emojis personalizados

O bot usa **application emojis** — emojis vinculados ao próprio bot, que funcionam
em qualquer servidor onde ele estiver, sem depender de emojis de um servidor
específico.

```
assets/emojis/              # imagens (.png/.gif) — o nome do arquivo vira o nome do emoji
src/utils/autoUploadEmojis.js  # sobe os emojis sozinho quando o bot liga
src/emojis.js                  # mapa central: e('nome') → emoji custom (ou unicode de fallback)
scripts/uploadEmojis.js        # alternativa manual (opcional, veja abaixo)
```

**Não precisa fazer nada** — assim que o bot fica online (evento `ready`), ele
sobe sozinho os emojis de `assets/emojis/` que ainda não foram enviados e já
passa a usá-los na hora, sem precisar reiniciar. Isso funciona em qualquer
hospedagem (Discloud, ShardCloud, VPS, local), já que roda dentro do próprio
processo do bot — não depende de terminal nem de rodar comando nenhum.

Nas próximas vezes que o bot ligar, ele confere o que já foi enviado (guardado
em `data/emojis.json`) e pula — só sobe o que for novo.

Até o primeiro upload terminar (leva só alguns segundos), ou se algum envio
falhar, o bot usa automaticamente o emoji unicode equivalente definido em
`src/emojis.js`, então nada quebra.

**Alternativa manual** (opcional, útil se quiser rodar localmente sem subir o
bot inteiro): `npm run upload-emojis`.

**Para usar um emoji em qualquer painel:**

```js
const { e } = require('../emojis');
// ...
new TextDisplayBuilder().setContent(`# ${e('fire')}  Título`)
// ou em botões/selects:
.setEmoji(e('correct'))
```

Para adicionar um emoji novo: solte o arquivo em `assets/emojis/`, adicione o
fallback unicode em `FALLBACK` (`src/emojis.js`) e reinicie o bot (ou rode
`npm run upload-emojis`).

> Nomes de emoji do Discord (2–32 caracteres, só letras/números/`_`) são gerados
> automaticamente a partir do nome do arquivo.

## 🎯 Criação automática pelo canal de apostas

Configure `APOSTA_CHANNEL_ID` com o ID de um canal (ex: `#apostas`). A partir
daí, sempre que alguém escrever nesse canal o nome de uma configuração —
"gelo infinito", "capa 3", "full capa", "uxd", "tático", "ap padrão" — o bot:

1. Identifica qual configuração foi mencionada
2. Confere se a pessoa tem saldo (`getSalasDisponiveis`)
3. Se tiver, cria a sala na Nix na hora, desconta 1 sala do saldo dela e
   responde na própria mensagem com a sala pronta (ID, senha, link de convite)
4. Se não tiver saldo, avisa publicamente e mostra o botão de comprar

Não precisa rodar `/criar` nem clicar em nada — só escrever o nome da
configuração nesse canal.

**Sintaxe rápida (`.cs`)** — funciona também com o comando exato, além do nome
por extenso:

| Configuração   | Comando | Palavras-chave                              |
|----------------|:-------:|----------------------------------------------|
| Gelo Normal    | `.cs`   | `gelo normal`, `gelo padrao`, `gelo padrão`   |
| Gelo Infinito  | `.cs1`  | `gelo infinito`, `gelo inf`, `infinito`       |
| Tático         | `.cs2`  | `tatico`, `tático`, `mapa tatico`             |
| AP Full Capa   | `.cs3`  | `full capa`, `ap full capa`, `fullcapa`       |

> O comando (`.cs`, `.cs1`...) precisa ser a mensagem inteira. As palavras-chave
> funcionam mesmo com outras palavras junto — o bot procura o termo dentro do
> texto. Se nada bater, a mensagem é ignorada normalmente.

## 🧾 Leitura automática de comprovantes (OCR)

Quando o comprador manda uma **imagem** dentro do tópico de pagamento dele
(o ticket criado ao clicar em COMPRAR), o bot:

1. Baixa a imagem e lê o texto com OCR (`tesseract.js`, roda local, sem API paga)
2. Procura o valor pago no texto e compara com o valor esperado da compra
3. Se bater, **credita o saldo automaticamente** e arquiva o tópico — sem
   precisar de aprovação da staff
4. Se não conseguir confirmar (foto ruim, valor não encontrado, etc.), avisa
   o comprador que a staff vai revisar manualmente — o fluxo antigo com os
   botões **Confirmar/Recusar** continua funcionando normalmente como fallback

**Bancos suportados:** qualquer banco que gere um comprovante Pix com o valor
em texto (Nubank, XP, Inter Kids, Itaú, Bradesco, PicPay, Mercado Pago, etc.)
funciona — o OCR lê o valor, não depende do layout específico do banco.

> ⚠️ Isso exige a intent privilegiada **MESSAGE CONTENT INTENT** ativada no
> [Discord Developer Portal](https://discord.com/developers/applications) →
> sua aplicação → **Bot** → em "Privileged Gateway Intents", ligue
> **Message Content Intent**. Sem isso o bot não recebe os anexos e o OCR não roda.

## 🎨 Configurações de sala disponíveis

Editável em `src/constants.js`:

| Config         | Emoji |
|----------------|:-----:|
| Gelo Normal    | ⚔️    |
| Gelo Infinito  | ❄️    |
| Tático         | 🗺️    |
| AP Full Capa   | 🛡️    |

## 💰 Preço

- **Mínimo por compra:** 50 salas
- **Preço por sala:** R$ 0,05

Ambos editáveis em `src/constants.js` (`MINIMO_SALAS`, `PRECO_POR_SALA`).
