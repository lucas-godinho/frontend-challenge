# Arquitetura

## Organização

- `src/features`: módulos de domínio (catálogo, conta, carrinho, checkout e pedidos).
- `src/components/atoms`, `molecules`, `organisms`: peças visuais globais organizadas por Atomic Design; detalhes e a hierarquia das features estão em [docs/ATOMIC-DESIGN.md](docs/ATOMIC-DESIGN.md).
- `src/lib`: clientes de infraestrutura compartilhados, incluindo Axios.
- `src/mocks`: fixtures e handlers MSW na fronteira de rede.
- `src/types`: contratos de transporte e domínio.
- `e2e`: fluxos Playwright; `.storybook`: catálogo de componentes.

As telas previstas estão registradas no TanStack Router. Catálogo usa parâmetros de busca validados na URL e TanStack Query inclui todos os parâmetros na chave; alterações criam entradas no histórico e voltam à página 1. Queries recebem o `AbortSignal` do Query para descartar consultas obsoletas. O catálogo usa `staleTime` de 30 s, GC em 5 min e uma nova tentativa automática para leituras antes de oferecer retry manual.

O entry de inicialização carrega a interface e os mocks em paralelo. O shell pode renderizar durante a preparação do MSW; chamadas Axios aguardam `waitForMocks`. Os handlers WebSocket são registrados sob demanda antes de importar `socket.io-client`, preservando a interceptação da API WebSocket. O build demo silencia os logs de diagnóstico do MSW; desenvolvimento mantém os logs.

## REST da demonstração

Base URL: `/api` (configurável por `VITE_API_URL`). Os handlers MSW implementam catálogo, detalhe, conta, perfil, carteiras, carrinho, cupons e pedidos:

| Método | Endpoint | Uso |
| --- | --- | --- |
| GET | `/cart` | consultar itens e subtotal |
| POST | `/cart/items` | adicionar quantidade; retorna 409 se exceder o estoque |
| PUT | `/cart/items/:id` | substituir quantidade; valida estoque |
| DELETE | `/cart/items/:id` | remover item |
| POST/DELETE | `/cart/coupon` | aplicar ou remover cupom `KURIO10`/`LAUNCH` |
| GET/POST/DELETE | `/session` | consultar, iniciar e encerrar sessão |
| POST | `/accounts` | cadastrar colecionador |
| GET/PUT | `/profile` | consultar e editar perfil/avatar |
| PUT | `/profile/password` | validar senha atual e persistir nova senha como hash |
| GET/POST/DELETE | `/wallets` | listar, criar/editar e remover carteira |
| GET/POST/DELETE | `/wallet-connection` | consultar, simular conexão e desconectar provedor de carteira |
| POST/GET | `/orders`, `/orders/:id` | revalidar cotação, criar pedido com idempotência e recuperar recibo |

O detalhe busca o NFT pela API e trata carregamento, falha e 404. Carrinhos e cupons ficam isolados por sessão no `localStorage`; o carrinho visitante é mesclado ao autenticar. Quantidades, descontos, taxas e totais são strings decimais calculadas em wei. A alteração otimista de quantidade e remoção reverte se a mutation falhar; após a resposta, o cache é sincronizado com a resposta REST. O checkout envia a cotação visível, incluindo preço e versão dos NFTs, cupom, desconto, taxa e total. O servidor compara esse snapshot com preço, estoque e cupom atuais e responde `409 QUOTE_CHANGED` ou `409 INVENTORY_CHANGED` quando necessário. A tela atualiza o resumo e exige um novo clique para confirmar os valores revistos. A criação de pedido recebe `Idempotency-Key`, persiste o snapshot de NFT/carteira/preço e remove do carrinho somente após confirmação simulada.

Os recursos de conta e pedido usam estes contratos ativos:

| Método | Endpoint | Uso |
| --- | --- | --- |
| POST/GET/DELETE | `/session` | autenticação, recuperação e logout |
| POST | `/accounts` | cadastro |
| GET/PUT | `/profile` | perfil e avatar |
| PUT | `/profile/password` | alteração de senha |
| GET/POST/DELETE | `/wallets` | carteiras principais e secundárias |
| GET/POST/DELETE | `/wallet-connection` | conexão simulada persistida por usuário, incluindo recusa configurável |
| POST/GET | `/orders`, `/orders/:id` | criar por `Idempotency-Key` e recuperar snapshot |

Erros usam `{ code, message, fields? }`, com HTTP 400 (validação), 401 (sessão), 403 (permissão), 404, 409 (conflito), 429 e 5xx. Quantias ETH são strings decimais; nunca devem ser convertidas a ponto flutuante para cálculo monetário. O snapshot de pedido é imutável.

Ao confirmar um pedido, os handlers REST e Socket.IO compartilham `removePurchasedItems`: subtraem apenas as quantidades do snapshot do carrinho atual, preservando inclusões feitas em outras abas durante um pagamento pendente. A transição é executada uma única vez e estados terminais não são reaplicados. O teste de regressão usa duas abas, MSW REST, Socket.IO e relógio controlado.

## Sessão e cache

A sessão MSW usa `GET/POST/DELETE /session`; cadastro usa `POST /accounts` e cria uma sessão. Os usuários seed são `ana@kurio.test` e `rafael@kurio.test`, ambos com senha fictícia `Kurio123!`. O estado local guarda somente o ID da sessão, validade e hash de senha dos cadastros criados. Sessões expiram após sete dias e são revalidadas ao acessar rotas privadas ou após refresh.

Favoritos são salvos em chaves locais separadas por usuário autenticado; o visitante usa uma chave própria, que não é mostrada ao acessar favoritos até entrar. O carrinho do visitante é migrado e mesclado ao carrinho da conta durante login/cadastro, com quantidades limitadas ao estoque; carrinhos das contas ficam isolados. Login/logout invalida o resumo do carrinho e remove caches privados de favoritos, perfil, carteiras e pedidos ao trocar de identidade. Mutations de compra não repetem automaticamente. Catálogo usa `staleTime` de 30 s, GC em 5 min e retry único para leitura.

## Tempo real

`src/lib/realtime.ts` instancia `socket.io-client` sob demanda, depois da inicialização do MSW, para que o mock intercepte o WebSocket antes de o cliente capturar a API global. Em produção, a conexão só abre quando `VITE_SOCKET_URL` está definida e MSW está desativado.

`useCatalogRealtime` assina os IDs visíveis com `catalog.subscribe`; eventos `nft.updated` com versão crescente atualizam catálogo, detalhe e carrinho no TanStack Query. `useOrderRealtime` assina o pedido em `order.subscribe`, deduplica eventos por `eventId`, aplica somente versões mais novas e invalida o recibo para buscar a fonte REST autoritativa. Reconexões reassinam e revalidam os recursos.

Na demonstração, `src/mocks/realtime.ts` usa o handler WebSocket do MSW e implementa apenas o enquadramento textual mínimo Engine.IO v4/Socket.IO usado pelo cliente neste app: abertura, namespace padrão, ping/pong e eventos JSON. Isso permite testar o cliente Socket.IO real sem servidor externo. O mock não implementa namespaces adicionais, salas, acknowledgements, payloads binários ou upgrades de transporte; não deve ser usado como servidor de produção. O serviço real precisa expor os eventos tipados documentados em `src/lib/realtime.ts`.

Os cenários determinísticos ficam em `localStorage['kurio:mock-scenario']`: `nft-price-change` envia atualização de preço, `nft-sold-out` zera disponibilidade, `nft-duplicate-stale` envia duplicata e versão antiga, `order-pending-confirmed` e `order-pending-rejected` iniciam pedidos pendentes e depois enviam `order.updated`; `order-duplicate-stale` verifica deduplicação e ordenação de pedidos; `wallet-connect-rejected` simula recusa do provedor. A tela de checkout também assina os NFTs do carrinho. As suítes `e2e/realtime.spec.ts` e `e2e/checkout-resilience.spec.ts` verificam atualizações, reconexão/recuperação do pedido e conexão, recusa e desconexão de carteira. Sem chave, o cenário é `default` (compra confirmada pela API). Esses cenários exercitam mensagens Socket.IO reais interceptadas por MSW; os dados continuam simulados.

## Fidelidade visual e acessibilidade

O Figma está em modo de visualização. A Home mobile Kurio segue o frame de 414 × 896 px, padding superior/lateral de 40/24 px e gap de 16 px. O CSS exportado confirmou Ink `#140D0A`, Surface Card `#241612`, Surface Raised `#2F1D15`, Border `#3F2319`, Secondary `#B39463`, Text Secondary `#CFB28C`, Foreground `#F5F1EB`, Primary `#D28A4C` e Accent `#E89B55`. Roboto Mono é servida localmente via Fontsource. Quatro artworks locais estão em `public/images/` e são referenciados nas fixtures.

A Home desktop compartilha dados, estado e componentes com a composição mobile. Pages conectam infraestrutura, templates recebem props e organizam organisms, moléculas implementam tarefas pequenas e átomos mantêm os controles visuais base. Os átomos shadcn/ui vivem em `src/components/atoms`, usam Tailwind v4 e tokens CSS em `src/styles.css`; detalhes de composição responsiva continuam no CSS do tema. Veja [Atomic Design](docs/ATOMIC-DESIGN.md) para contratos/reuso e [Home responsiva](docs/HOME.md) para breakpoints e stories. O Storybook espelha essa hierarquia para revisão visual isolada.

A Home, detalhe e resumo do carrinho incluem estados de loading com shimmer, erro e vazio. Redução de movimento, foco visível, skip link, labels e alt text estão no ponto de partida. O Playwright executa fluxos de conta, catálogo, acesso direto ao detalhe, carrinho, pedidos e eventos realtime, além de baselines visuais da Home, detalhe, carrinho e pagamento em desktop e mobile; atualizar os arquivos de referência requer revisão visual. Lighthouse CI tem configurações desktop e mobile em `lighthouserc.cjs` e `lighthouserc.mobile.cjs`; `npm run audit:lighthouse` gera os relatórios em `artifacts/lighthouse/` usando perfis Chrome temporários e sem extensões. O estado e a última amostra estão em [docs/PERFORMANCE.md](docs/PERFORMANCE.md).

## Telas e estado visual

Login e cadastro usam o mesmo formulário de domínio em uma página mobile e em um modal desktop. O modal mantém o foco dentro da janela e fecha com Escape. Perfil e carteiras são formulários persistidos pelos handlers MSW. Checkout envia os dados da carteira e do colecionador, recupera o recibo por rota e exibe um snapshot imutável. Os componentes base `Button`, `Input`, `Card` e `Select` seguem os tokens e variantes shadcn configurados em `components.json`; a documentação interativa fica no Storybook.

O mock inclui pedidos confirmados, pendentes, recusados e perda da primeira resposta após persistir o pedido, com recuperação pela chave de idempotência. O checkout revalida a cotação REST e acompanha preço/estoque via Socket.IO; um teste simula interrupção de rede com pedido pendente e verifica a retomada sem duplicação. O catálogo cobre latência variável, respostas fora de ordem e falhas de rede/5xx com retry do usuário. Os eventos reais dependem de um backend Socket.IO. Lighthouse continua configurado para o build demo e seus relatórios devem ser lidos junto aos limites da máquina e do navegador de auditoria.
