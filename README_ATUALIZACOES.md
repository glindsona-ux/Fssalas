# O que mudou nesta versão (multi-servidor)

## Correções
- `/criar` estava marcado como "só Administrador" no Discord por engano — por
  isso não aparecia pros membros em outros servidores. Removido.
- `.cs`/`.cs1`/`.cs2`/`.cs3`/`.go` agora funcionam por servidor (não mais um
  único canal fixo no `.env` pra sempre).
- O ticket de pagamento agora é um **canal de verdade** (fechável), não mais
  um tópico/thread privado.

## Novo: configuração por servidor
Rode nos servidores onde o bot for adicionado (precisa de permissão "Gerenciar
Servidor"):

- `/setup canal-apostas canal:#nome-do-canal` — ativa `.cs` etc. nesse canal.
- `/setup tickets categoria:CategoriaDeTickets cargo-staff:@Staff` — faz esse
  servidor processar ticket de compra localmente (cria canal, QR, aprovação).
- `/setup desativar-tickets` — desativa o processamento local (volta a
  redirecionar as compras pro servidor principal).
- `/setup status` — mostra a config atual do servidor.

**Seu servidor principal (o de sempre) já foi migrado automaticamente** com
os valores que estavam no `.env` (`APOSTA_CHANNEL_ID`, `TICKET_CHANNEL_ID`,
`STAFF_ROLE_ID`) na primeira vez que qualquer comando rodar depois do deploy —
não precisa reconfigurar nada lá, só nos servidores novos.

## Em servidores sem `/setup tickets` configurado
O botão "Comprar Sala" ainda funciona: mostra o QR Code + sua chave Pix (só
quem está comprando vê), com um código de compra, e pede pra pessoa abrir um
ticket no servidor principal (`STORE_INVITE` no `.env`) depois de pagar,
informando esse código.

## Preço, combos, chave Pix, cargo de comprador, canal de log
Continuam **globais** (configurados via `!painel`, restrito ao dono do bot) —
é um negócio só, vendendo em vários servidores com a mesma chave Pix e o
mesmo estoque por usuário.

## Não esqueça
- O bot precisa da permissão **Gerenciar Canais** em qualquer servidor onde
  você configurar `/setup tickets`, pra poder criar/fechar os canais de
  ticket.
- Rode `npm run register` de novo só se adicionar comandos novos (não é
  necessário agora, os nomes dos comandos não mudaram).
