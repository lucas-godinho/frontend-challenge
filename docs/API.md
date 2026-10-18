# Contratos REST e eventos

O cliente Axios usa `/api` por padrão (`VITE_API_URL` pode substituir a base). Desenvolvimento e build demo usam os mesmos handlers MSW que os testes. Os contratos de resposta estão em [`src/types/marketplace.ts`](../src/types/marketplace.ts); o snapshot enviado no checkout está em [`CheckoutQuote`](../src/features/cart/cart-api.ts).

## Regras comuns

- JSON nas requisições e respostas. Datas e validade de sessão usam ISO 8601.
- Valores monetários de itens, descontos, taxas e totais são strings decimais em ETH. A aritmética usa inteiros em wei; quantidades são inteiras positivas.
- Erros usam `{ "code": "…", "message": "…", "fields": { "campo": "mensagem" } }`; `fields` é opcional. Cancelamento de consulta não deve aparecer como erro de negócio.
- Queries recebem `AbortSignal`. Mutations não são repetidas automaticamente. O recibo persistido é a fonte autoritativa para pedidos.
- O mock guarda a identidade da sessão e sua validade no armazenamento local. Cada recurso privado verifica a sessão; dados privados ficam separados por usuário. Não é um sistema de autenticação de produção.

## Recursos e transporte

| Método e recurso | Entrada | Resposta de sucesso |
| --- | --- | --- |
| `GET /nfts` | Query `q`, `category`, `sort`, `page`, `minPrice`, `maxPrice`, `network` | `CatalogResponse`: itens, página, tamanho, total e facetas |
| `GET /nfts/:id` | ID estável do NFT/edição | `Nft` |
| `POST /accounts` | `{ name, email, password }` | `SessionResponse`; inicia sessão |
| `POST /session` | `{ email, password }` | `SessionResponse`: usuário, `sessionId`, `expiresAt` |
| `GET /session` | Sessão atual | `SessionResponse` ou `null` (visitante/expirada) |
| `DELETE /session` | Sessão atual | Encerra a sessão |
| `GET /favorites` | Sessão obrigatória | IDs dos favoritos do usuário |
| `POST /favorites` | `{ nftId }` | Favoritos atualizados |
| `DELETE /favorites/:id` | ID do NFT; sessão obrigatória | Favoritos atualizados |
| `GET /cart` | Sessão opcional | `CartResponse`: itens, quantidades, subtotal, cupom, desconto, taxa e total |
| `POST /cart/items` | `{ nftId, quantity }`; soma à quantidade existente | `CartResponse` |
| `PUT /cart/items/:id` | `{ quantity }`; substitui a quantidade | `CartResponse` |
| `DELETE /cart/items/:id` | ID do NFT/edição | `CartResponse` |
| `POST /cart/coupon` | `{ code }` | Cotação completa em `CartResponse` |
| `DELETE /cart/coupon` | Sem body | Cotação sem o cupom |
| `GET /profile` | Sessão obrigatória | `CollectorProfile` |
| `PUT /profile` | `CollectorProfile`: `displayName`, `username`, `email`, `walletAlias`, `ensName`, `avatarUrl?` | Perfil persistido |
| `PUT /profile/password` | `{ currentPassword, password }` | Confirma a alteração; persiste hash |
| `GET /wallets` | Sessão obrigatória | `CollectorWallet[]` |
| `POST /wallets` | Carteira sem `id` para criar; com `id` para editar | Carteira persistida |
| `DELETE /wallets/:id` | ID da carteira | Remove a carteira do usuário |
| `GET /wallet-connection` | Sessão obrigatória | `WalletConnection` ou `null` |
| `POST /wallet-connection` | `{ type, network }` | Conexão simulada com endereço, rede e provedor |
| `DELETE /wallet-connection` | Sessão obrigatória | Desconecta o provedor |
| `POST /orders` | Header `Idempotency-Key`; `{ wallet, buyer, quote }` | `OrderResponse`; criação ou recuperação da mesma tentativa |
| `GET /orders/:id` | ID e sessão proprietária | Snapshot do pedido, com estado e versão atuais |

`sort` aceita `recent`, `price-asc`, `price-desc`; `page` começa em 1. `network` aceita `Ethereum`, `Polygon`, `Solana`, combinadas por vírgula. Categorias são `art`, `photo`, `music`, `3d`, `collectible`, `generative`, `games`, `membership` e `utility`. Os filtros compõem a consulta; o catálogo retorna facetas do inventário para apresentar contagens consistentes.

Carteiras usam `network` com as três redes acima e `type` com `MetaMask`, `WalletConnect` ou `Coinbase Wallet`. `isPrimary` identifica a principal; `displayName`, `alias` e `address` compõem os dados da carteira, com `ensName` opcional.

Editar uma carteira com `id` que não pertence à conta retorna `403 FORBIDDEN` e não cria uma carteira com esse identificador. O carrinho só usa o escopo de um usuário enquanto sua sessão é válida; uma sessão expirada recebe o carrinho do visitante, mesmo se consultado antes de `GET /session`.

## Cotação e idempotência

`GET /cart` e as mutations do carrinho retornam a cotação calculada. `KURIO10` aplica 10% e `LAUNCH` desconta 0,08 ETH. Cupom inválido/expirado recebe erro e não altera o resumo como se tivesse sido aplicado.

`POST /orders` recebe a cotação que o usuário revisou:

```json
{
  "items": [{ "nftId": "orbital-01", "quantity": 1, "priceEth": "0.84", "version": 1 }],
  "subtotalEth": "0.84",
  "discountEth": "0.00",
  "networkFeeEth": "0.016",
  "totalEth": "0.856"
}
```

Esse objeto é o campo `quote`; o body também contém `wallet` (`CollectorWallet`) e `buyer` (`displayName`, `email`, `address`, `network`). O mock compara itens, quantidades, versões, preços, cupom, subtotal, desconto, taxa e total com a cotação atual. `409 QUOTE_CHANGED` ou `409 INVENTORY_CHANGED` exige revisão e nova confirmação.

Uma mesma chave com o mesmo body recupera o mesmo pedido. A mesma chave com outro body retorna `409 IDEMPOTENCY_CONFLICT`. `order-timeout-after-create` persiste o pedido e perde a primeira resposta; o cliente conserva chave e body para recuperar a tentativa, sem uma segunda compra.

`pending` pode passar para `confirmed` ou `rejected`; estados terminais não regridem. A confirmação remove do carrinho atual somente as quantidades do snapshot comprado. Adições posteriores, inclusive em outra aba, permanecem no carrinho. O recibo mantém os preços e totais originais mesmo após alteração do catálogo.

## Eventos Socket.IO

O cliente usa WebSocket no path `/socket.io/`. O mock MSW implementa os pacotes textuais Engine.IO v4 e Socket.IO necessários ao app. Não implementa salas, namespaces adicionais, acknowledgements, payload binário ou upgrade de transporte. Os eventos passam pelo `socket.io-client` real.

| Direção | Evento | Payload |
| --- | --- | --- |
| Cliente → servidor | `catalog.subscribe` | `{ ids: string[] }` |
| Cliente → servidor | `order.subscribe` | `{ id: string }` |
| Servidor → cliente | `nft.updated` | Envelope com `data: { priceEth: string, available: number }` |
| Servidor → cliente | `order.updated` | Envelope com `data: { status: 'pending' \| 'confirmed' \| 'rejected' }` |

Os envelopes incluem `eventId`, `resourceId`, `version` crescente e `occurredAt`. O cliente descarta versões antigas e duplicatas. Após reconexão, reassina recursos e revalida os dados ativos por REST; eventos de pedido invalidam o recibo para consultar seu snapshot autoritativo. A troca de sessão libera listeners e dados privados.

Seleção e reset de cenários, credenciais, falhas e latências estão no [README](../README.md). As políticas de cache e as decisões de interface estão em [ARCHITECTURE.md](../ARCHITECTURE.md).
