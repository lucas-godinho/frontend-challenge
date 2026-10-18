# Kurio — NFT Marketplace

Marketplace responsivo do desafio definido em [CHALLENGE.md](CHALLENGE.md). O projeto usa React 19, TypeScript estrito, TanStack Router/Query, Axios, Tailwind CSS, MSW, Storybook, Playwright, Socket.IO Client e Lighthouse.

## Requisitos

- Node.js 20.19+ ou 22.12+ e npm.
- Para abrir o Storybook ou executar E2E, instale as dependências com `npm install`.

## Começar

```bash
Copy-Item .env.example .env.local
npm install
npm run dev
```

Abra http://localhost:5173. MSW é ativado automaticamente em desenvolvimento e no build de demonstração (`npm run build`). O build de produção (`npm run build:production`) desativa os mocks e usa `VITE_API_URL`/`VITE_SOCKET_URL` para conectar aos serviços reais. O service worker gerado já está versionado em `public/mockServiceWorker.js`.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Base do Axios |
| `VITE_MOCKS` | dev/demo: `true`; produção: `false` | Ativa os handlers REST do MSW |
| `VITE_MOCK_SCENARIO` | `default` | Cenário REST inicial opcional; eventos realtime usam a chave de localStorage abaixo |
| `VITE_SOCKET_URL` | vazio | Origem do serviço Socket.IO; produção conecta apenas com a URL configurada e MSW desativado |

O mock entrega catálogo, detalhe, carrinho, sessão, perfil, carteiras e pedidos por REST. Em dev e no build demo, o MSW também intercepta o WebSocket usado pelo Socket.IO Client e fornece eventos tipados de catálogo e pedido. Para selecionar cenário realtime antes de carregar o app, defina `localStorage['kurio:mock-scenario']` no DevTools ou em um teste Playwright:

| Cenário | Resultado |
| --- | --- |
| `default` | compra confirmada pela API; sem evento de mudança de NFT |
| `nft-price-change` | publica `nft.updated` com o preço de Orbital Bloom alterado para `0.85 ETH` |
| `nft-sold-out` | publica `nft.updated` com disponibilidade zero |
| `nft-duplicate-stale` | publica atualização de catálogo duplicada e uma versão antiga |
| `slow-catalog` | atrasa as respostas de catálogo, detalhe e carrinho para exercitar skeletons |
| `variable-catalog-latency` | atrasa mais uma busca por `Blue` que a busca mais recente para exercitar respostas fora de ordem |
| `catalog-503` | mantém o catálogo em 503 até o teste liberar a nova tentativa |
| `catalog-network-error` | simula indisponibilidade de rede no catálogo |
| `order-pending-confirmed` | compra começa pendente e `order.updated` confirma depois |
| `order-pending-rejected` | compra começa pendente e `order.updated` a recusa depois |
| `order-duplicate-stale` | confirma uma compra e publica evento duplicado e versão antiga |
| `order-timeout-after-create` | perde a primeira resposta após gravar o pedido; nova tentativa recupera o mesmo pedido pela chave de idempotência |
| `checkout-price-change-once` | altera o preço antes da validação REST do pedido e exige nova confirmação |
| `checkout-sold-out-once` | esgota a edição antes da validação REST do pedido |
| `checkout-coupon-expired-once` | invalida o cupom antes da validação REST do pedido |
| `wallet-connect-rejected` | simula a recusa de conexão da carteira; o usuário pode tentar novamente |

O mock Socket.IO implementa somente o enquadramento textual mínimo Engine.IO v4/Socket.IO necessário à aplicação; veja [Arquitetura](ARCHITECTURE.md#tempo-real) para limitações. O carrinho de visitante é migrado para a conta ao entrar; carrinho e favoritos ficam separados por usuário depois da autenticação. O checkout salva um recibo imutável e envia uma chave `Idempotency-Key` por tentativa.

Credenciais fictícias para demonstração:

| E-mail | Senha |
| --- | --- |
| `ana@kurio.test` | `Kurio123!` |
| `rafael@kurio.test` | `Kurio123!` |

O cadastro cria uma sessão e persiste apenas o hash da senha nos dados simulados. Para restaurar integralmente o cenário conhecido, execute no console da aplicação. O reset apaga contas e dados de demonstração criados neste navegador, inclusive marcadores de falha, conexões, favoritos e o cenário selecionado; o reload restaura as fixtures e os dois usuários seed.

```js
for (const key of Object.keys(localStorage)) {
  if (key.startsWith('kurio:')) localStorage.removeItem(key)
}
location.assign('/')
```

O tempo de confirmação dos cenários pendentes pode ser controlado por `localStorage['kurio:mock-order-delay-ms']` (milissegundos; padrão 700). A regressão com duas abas usa relógio controlado e 60.000 ms para verificar que a confirmação preserva itens e quantidades adicionados depois da criação do pedido.

## Comandos

```bash
npm run dev               # Vite + mocks
npm run build             # TypeScript e build da demonstração com mocks
npm run build:production  # Build otimizado para APIs reais, sem MSW
npm run preview           # Preview do build
npm run typecheck         # Verificação TypeScript
npm run lint              # ESLint
npm run storybook         # Componentes em isolamento
npm run build-storybook   # Build do Storybook
npm run test:e2e          # Playwright desktop e mobile
npm run test:e2e:ui       # Playwright UI
npm run test:visual       # Regressão visual mobile e desktop
npm run test:visual:update # Atualizar baselines após revisão visual
npm run audit:lighthouse  # Lighthouse desktop/mobile, três execuções por página
```

O Playwright cobre fluxos E2E e compara screenshots baseline da Home, detalhe, carrinho e pagamento em Chromium desktop/mobile. Ele inicia seu próprio servidor em `127.0.0.1:5174`, com porta estrita, e não reutiliza o servidor de desenvolvimento. No checkout limpo, instale o navegador com `npm run test:e2e:install` antes de `npm run test:e2e`. Para revisar uma mudança intencional no layout: `npm run test:e2e -- --update-snapshots`. Se já houver Chrome ou Edge no sistema, a configuração os detecta automaticamente; também é possível apontar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` para outro executável. Relatórios ficam em `playwright-report/`, snapshots em `e2e/visual-regression.spec.ts-snapshots/` e traces de falhas em `test-results/`.

O runner Lighthouse inicia um preview do build em porta livre e um perfil Chrome novo por medição. `CHROME_PATH` pode apontar para o Chrome instalado; na ausência dessa variável, usa o Chromium instalado pelo Playwright. Grava cada HTML/JSON e um `summary.json` com medianas, ambiente e versões em `artifacts/lighthouse/validated/<data>/`. Uma amostra exploratória pode ser executada com `node scripts/audit-lighthouse.mjs --profile=mobile --page=home --runs=1`; ela não atende ao requisito de três medições. O comando completo falha se alguma mediana não atingir Performance 95, Accessibility 95, Best Practices 95 ou SEO 90.

## Cenários atuais e planejados

O catálogo REST suporta sucesso, resultado vazio por busca, recurso inexistente, respostas lentas/fora de ordem e falhas de rede/5xx com nova tentativa. O cliente Socket.IO assina NFTs visíveis no catálogo e no checkout, valida versões/eventos duplicados e sincroniza o cache TanStack Query; no demo, MSW simula alterações de preço/estoque e transições de pedido pendente/recusado. `e2e/realtime.spec.ts`, `e2e/network-scenarios.spec.ts`, `e2e/checkout-resilience.spec.ts` e `e2e/responsive-layout.spec.ts` verificam esses casos, recuperação de conexão de carteira e ausência de overflow a 390, 768 e 1440 px. Os handlers REST cobrem sessão expirada, conflito de cadastro, cupons válidos/inválidos, revalidação de preço/estoque/cupom, falha de conexão após criação e recuperação idempotente do mesmo pedido. O backend real Socket.IO precisa ser fornecido pelo serviço de produção.

A rota `/` lê busca, ordenação, categoria e página da URL. `/nft/:id` consulta o detalhe diretamente; `/cart` permite editar itens e aplicar os cupons `KURIO10` (10%) e `LAUNCH` (desconto de 0,08 ETH). `/checkout` finaliza com carteira e dados do colecionador, e `/orders/:id` recupera o recibo salvo. Login/cadastro aparecem em modal no desktop e página dedicada no mobile. `/profile` permite editar dados, avatar e senha; `/wallets` permite cadastrar, editar e remover carteiras. Esses fluxos privados exigem sessão. O tema Kurio usa tokens Tailwind/shadcn, tipografia local e os quatro artworks de `public/images/`.

## Deploy

A configuração `vercel.json` faz fallback das rotas SPA para `index.html`. Publique o build de demonstração com `npm run build` para usar MSW, ou o build de produção com `npm run build:production` e as URLs das APIs reais.

## Documentação

- [Escopo original do desafio](CHALLENGE.md)
- [Decisões, contratos REST, cache e limites atuais](ARCHITECTURE.md)
- [Contratos REST, cotação, idempotência e eventos](docs/API.md)
- [Sistema de componentes shadcn/ui e Storybook](docs/DESIGN-SYSTEM.md)
- [Matriz de aderência ao desafio e pendências de entrega](docs/CHALLENGE-COMPLIANCE.md)
- [Home responsiva, componentes e breakpoints](docs/HOME.md)
- [Resultados e procedimento Lighthouse](docs/PERFORMANCE.md)
- Stories e documentação interativa da Home: `npm run storybook`
