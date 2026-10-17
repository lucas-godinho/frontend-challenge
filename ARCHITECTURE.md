# Arquitetura inicial

## Organização

- `src/features`: módulos de domínio (catálogo, conta, carrinho, checkout e pedidos).
- `src/lib`: clientes de infraestrutura compartilhados, incluindo Axios.
- `src/mocks`: fixtures e handlers MSW na fronteira de rede.
- `src/types`: contratos de transporte e domínio.
- `e2e`: fluxos Playwright; `.storybook`: catálogo de componentes.

As telas previstas estão registradas no TanStack Router. Catálogo usa parâmetros de busca validados na URL e TanStack Query inclui todos os parâmetros na chave; alterações substituem o histórico e voltam à página 1. Queries recebem o `AbortSignal` do Query para descartar consultas obsoletas.

## REST inicial

Base URL: `/api` (configurável por `VITE_API_URL`). O MSW atualmente implementa `GET /nfts?q=&category=&sort=&page=` e `GET /nfts/:id`. Os recursos a completar mantêm este contrato planejado:

| Método | Endpoint | Uso |
| --- | --- | --- |
| POST/GET/DELETE | `/session`, `/session`, `/session` | autenticação, recuperação e logout |
| POST | `/accounts` | cadastro |
| GET | `/nfts`, `/nfts/:id` | catálogo e detalhe |
| GET/PUT/DELETE | `/me/favorites` | favoritos isolados por conta |
| GET/POST/PATCH/DELETE | `/cart/items` | carrinho persistente |
| POST | `/quotes` | cotação, cupom, preço, disponibilidade e taxas |
| POST/GET | `/orders`, `/orders/:id` | criar por `Idempotency-Key` e recuperar snapshot |
| GET/PATCH | `/me/profile` | perfil e avatar |
| GET/POST/PATCH | `/me/wallets` | carteiras |

Erros usam `{ code, message, fields? }`, com HTTP 400 (validação), 401 (sessão), 403 (permissão), 404, 409 (conflito), 429 e 5xx. Quantias ETH são strings decimais; nunca devem ser convertidas a ponto flutuante para cálculo monetário. O snapshot de pedido é imutável.

## Sessão e cache

A sessão simulada será persistida em storage sem credenciais em claro. Cache privado deve incluir o identificador da sessão na query key; logout/troca de usuário limpa queries privadas e fecha subscriptions antes de definir a nova sessão. Mutations de compra não repetem automaticamente. Catálogo usa `staleTime` de 30 s, GC em 5 min e retry único para leitura. Favoritos usarão atualização otimista com rollback e invalidação final.

## Tempo real

O cliente deve receber eventos `nft.updated` e `order.updated` via `socket.io-client`. Cada evento inclui `eventId`, `resourceId`, `version`, `occurredAt` e `data`. Versões iguais/antigas são ignoradas; a reconexão reconcilia recurso ativo por REST. Pedido confirmado/recusado é terminal.

O escopo inicial inclui o cliente Socket.IO, mas ainda não implementa o transporte Socket.IO interceptado por MSW. O pacote `@mswjs/socket.io-binding` está listado para completar a simulação na camada de rede; verificar compatibilidade de versão e configurar um servidor de eventos determinístico antes dos cenários em tempo real. No browser, MSW não fornece um servidor Socket.IO nativo por si só.

## Fidelidade visual e acessibilidade

O Figma está em modo de visualização. A Home mobile Kurio segue o frame de 414 × 896 px, padding superior/lateral de 40/24 px e gap de 16 px. O CSS exportado confirmou Ink `#140D0A`, Surface Card `#241612`, Surface Raised `#2F1D15`, Border `#3F2319`, Secondary `#B39463`, Text Secondary `#CFB28C`, Foreground `#F5F1EB`, Primary `#D28A4C` e Accent `#E89B55`. Roboto Mono é servida localmente via Fontsource. As referências de imagens no CSS vieram sem os arquivos vinculados, então a Home ainda usa imagens temporárias das fixtures.

A Home desktop compartilha dados, estado e componentes com a composição mobile. O shell, carrossel, catálogo, newsletter e card estão separados em componentes por responsabilidade; veja [Home responsiva](docs/HOME.md) para o mapa e os breakpoints. O frame desktop atualmente aberto no protótipo exibe galeria e detalhes de um NFT sob o rótulo “Início / Mercado”; não corresponde visualmente à grade da Home de descoberta. A vitrine desktop adapta o conteúdo mobile até que o frame correto de Home desktop seja confirmado.

A home mantém uma composição temporária e imagens de demonstração, sem os assets originais do Figma. Estados incluem loading com shimmer, erro com retry e resultado vazio. Redução de movimento, foco visível, skip link, labels e alt text estão no ponto de partida.

## Limite do bootstrap

Esta entrega inicial não completa compra, autenticação, perfil, carteiras, persistência coordenada entre recursos, eventos Socket.IO/MSW, cobertura E2E dos 12 cenários, baselines visuais, relatório Lighthouse ou deploy. Essas partes dependem da implementação das features além do esqueleto e da revisão visual do Figma.
