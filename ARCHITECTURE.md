# Arquitetura inicial

## Organização

- `src/features`: módulos de domínio (catálogo, conta, carrinho, checkout e pedidos).
- `src/components/atoms`, `molecules`, `organisms`: peças visuais globais organizadas por Atomic Design; detalhes e a hierarquia das features estão em [docs/ATOMIC-DESIGN.md](docs/ATOMIC-DESIGN.md).
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

A sessão simulada será persistida em storage sem credenciais em claro. Cache privado deve incluir o identificador da sessão na query key; logout/troca de usuário limpa queries privadas e fecha subscriptions antes de definir a nova sessão. Mutations de compra não repetem automaticamente. Catálogo usa `staleTime` de 30 s, GC em 5 min e retry único para leitura. Favoritos da demonstração atualmente mantêm IDs em `localStorage`; quando houver autenticação, migrar para o endpoint privado `/me/favorites` com atualização otimista e rollback.

## Tempo real

`useCatalogRealtime` assina os IDs da página atual com `catalog.subscribe`, valida a versão crescente dos eventos `nft.updated` e atualiza as entradas de catálogo no TanStack Query. A limpeza remove o listener e encerra a conexão ao trocar os recursos observados ou desmontar a Home. O cliente só conecta quando `VITE_SOCKET_URL` está definida e MSW está desativado. O servidor Socket.IO não faz parte do desafio; o ambiente de demonstração mantém o realtime desligado. Eventos de pedidos já têm contrato tipado, mas ainda aguardam a feature de checkout.

## Fidelidade visual e acessibilidade

O Figma está em modo de visualização. A Home mobile Kurio segue o frame de 414 × 896 px, padding superior/lateral de 40/24 px e gap de 16 px. O CSS exportado confirmou Ink `#140D0A`, Surface Card `#241612`, Surface Raised `#2F1D15`, Border `#3F2319`, Secondary `#B39463`, Text Secondary `#CFB28C`, Foreground `#F5F1EB`, Primary `#D28A4C` e Accent `#E89B55`. Roboto Mono é servida localmente via Fontsource. Quatro artworks locais estão em `public/images/` e são referenciados nas fixtures.

A Home desktop compartilha dados, estado e componentes com a composição mobile. Pages conectam infraestrutura, templates recebem props e organizam organisms, moléculas implementam tarefas pequenas e átomos mantêm os controles visuais base. Os átomos shadcn/ui vivem em `src/components/atoms`, usam Tailwind v4 e tokens CSS em `src/styles.css`; detalhes de composição responsiva continuam no CSS do tema. Veja [Atomic Design](docs/ATOMIC-DESIGN.md) para contratos/reuso e [Home responsiva](docs/HOME.md) para breakpoints e stories. O Storybook espelha essa hierarquia para revisão visual isolada.

A Home inclui estados de loading com shimmer, erro com retry e resultado vazio. Redução de movimento, foco visível, skip link, labels e alt text estão no ponto de partida. O Playwright executa fluxos E2E e screenshots baseline das primeiras dobras mobile e desktop; atualizar os arquivos de referência requer revisão visual.

## Limite do bootstrap

Esta entrega não completa compra, autenticação, perfil, carteiras, persistência coordenada entre recursos ou o conjunto completo de cenários de erro. REST e Socket.IO reais dependem dos endpoints de backend definidos no ambiente; MSW fornece os contratos de demonstração. Lighthouse é executado sobre o build demo em desktop/mobile, e o relatório deve ser lido junto aos limites da máquina e do navegador de auditoria.
