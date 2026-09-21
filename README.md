# FFZ Salas Bot — Premium (pronto pra Discloud)

Esse projeto já veio configurado pra Discloud (o `discloud.config` na raiz é
original — não precisei mudar nada nele). Aqui está o passo a passo completo
pra colocar no ar.

## O que já está pronto no `discloud.config`

```
NAME=FFZ Salas Bot
TYPE=bot
MAIN=src/index.js
RAM=512
VERSION=latest
AUTORESTART=true
APT=canvas
```

- `APT=canvas` já resolve o problema das bibliotecas nativas que o pacote
  `canvas` precisa (isso é automático na Discloud — diferente do Render).
- `RAM=512` é o valor original do projeto. **Se seu plano Free não tiver
  512MB disponíveis**, você vai receber erro no upload — nesse caso, edite
  esse número pra baixo (tente 300 ou 200) até caber no seu plano. Dá pra
  ver quanto você tem disponível no painel da Discloud antes de subir.

## Passo 1 — Registrar os slash commands (só uma vez)

Os comandos (`/criar`, `/setup`, `/perfil`, etc.) são registrados
**globalmente** — ou seja, uma vez registrados, continuam ativos mesmo se
você reiniciar o bot. Por isso, registre ANTES de subir pra Discloud,
rodando isso no seu PC:

```bash
npm install
# cria um .env local só com DISCORD_TOKEN e CLIENT_ID (não precisa dos outros ainda)
npm run register
```

Se aparecer `✅ X comando(s) registrado(s) globalmente!`, prontinho — pode
levar até 1h pra aparecer em todos os servidores, mas só precisa fazer isso
de novo se você criar/mudar um comando no futuro.

## Passo 2 — Preparar o .zip

Compacte a pasta inteira do projeto (menos `node_modules` e `.env`, se você
tiver criado um local) num `.zip`. A Discloud instala as dependências
automaticamente no servidor dela.

## Passo 3 — Upload na Discloud

Duas formas:

**A) Pelo site (dashboard):**
1. Entra em discloud.com → faz login → **Adicionar Aplicação**
2. Envia o `.zip`
3. Aguarda o build

**B) Pelo bot da Discloud no Discord:**
1. Entra no servidor Discord da Discloud
2. Vai no canal de comandos e usa o comando de upload
3. Segue as perguntas (ID da aplicação, nome do arquivo principal, RAM) —
   como o `discloud.config` já existe, ele deve preencher isso sozinho

## Passo 4 — Colar as variáveis de ambiente

No painel da Discloud, dentro da sua aplicação, procura a aba de
**Variáveis** (ou "Environment Variables") e cola:

| Variável | Valor |
|---|---|
| `DISCORD_TOKEN` | token do bot |
| `CLIENT_ID` | ID da aplicação |
| `OWNER_ID` | seu ID de usuário no Discord |
| `ROOM_API_KEY` | sua chave da Nix (`nix_sk_...`) |
| `STORE_INVITE` | link do servidor de vendas (opcional — dá pra setar depois com `/setup`) |
| `STAFF_ROLE_ID` | opcional — dá pra configurar depois com `/setup` |
| `TICKET_CHANNEL_ID` | opcional — dá pra configurar depois com `/setup` |

Depois de colar, reinicia a aplicação pelo painel.

## Passo 5 — Conferir se subiu

Nos logs da aplicação (aba de logs no painel), procura por:
```
🔥 FFZ Salas online como SeuBot#1234
📡 Conectado em X servidor(es)
```

Se aparecer isso, o bot está no ar. Testa `/criar` no seu servidor.

## Modos de sala (Nix API)

| ID (`config_type`) | Nome | Comando rápido |
|---|---|---|
| `ap_padrao` | Gelo Normal | `.cs` |
| `gelo_inf` | Gelo Infinito | `.cs1` |
| `tatico` | Tático | `.cs2` |
| `ap_fullcapa` | AP Full Capa | `.cs3` |

## ⚠️ Limitações do plano Free da Discloud

- **RAM**: mínimo 100MB por bot, mas o total disponível na sua conta free
  pode ser bem menor que os `512` configurados — ajuste se necessário.
- **Anti-ghost app**: no plano Free, aplicações muito tempo sem interação
  podem cair offline depois de alguns dias. Se isso acontecer com
  frequência, considere o plano pago pra manter online 24/7 de verdade.

## Sobre os READMEs antigos

`README_ORIGINAL.md` e `README_ATUALIZACOES.md` são do projeto original,
mantidos aqui pra referência.
