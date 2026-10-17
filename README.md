# Kurio — NFT Marketplace

Implementação inicial do desafio definido em [CHALLENGE.md](CHALLENGE.md). O projeto usa React 19, TypeScript estrito, TanStack Router/Query, Axios, Tailwind CSS, MSW, Storybook, Playwright, Socket.IO Client e Lighthouse.

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
| `VITE_MOCK_SCENARIO` | `default` | Cenário de mock a selecionar (em expansão) |
| `VITE_SOCKET_URL` | vazio | Origem do serviço Socket.IO; o cliente só conecta quando o endpoint está configurado e MSW está desativado |

O mock atual entrega catálogo e detalhe por fixtures. Resetar o navegador (ou abrir sessão privada) restaura as fixtures; autenticação e cenários de checkout ainda serão implementados. Não existem credenciais de demonstração neste bootstrap.

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
npm run audit:lighthouse  # LHCI desktop/mobile, três execuções por página
```

O Playwright cobre fluxos E2E e compara screenshots baseline da Home em Chromium desktop/mobile. Para revisar uma mudança intencional no layout: `npm run test:e2e -- --update-snapshots`. O primeiro uso pode exigir `npx playwright install chromium`. Relatórios ficam em `playwright-report/`, snapshots em `e2e/visual-regression.spec.ts-snapshots/` e traces de falhas em `test-results/`. Lighthouse grava HTML/JSON em `artifacts/lighthouse/`.

## Cenários atuais e planejados

O catálogo REST suporta sucesso, resultado vazio por busca e recurso inexistente. Com `VITE_SOCKET_URL` configurada e MSW desativado, o cliente Socket.IO assina os NFTs visíveis e aplica eventos `nft.updated` ao cache do TanStack Query, validando versões crescentes. A demonstração não inclui um servidor Socket.IO; o desafio não fornece backend em tempo real. Latência e injeção determinística de falhas, sessão expirada, conflito, cupons, timeout idempotente e pagamento confirmado/recusado ainda precisam entrar nos handlers MSW. A configuração `VITE_MOCK_SCENARIO` está reservada, mas ainda não altera os mocks.

A rota `/` lê busca, ordenação, categoria e página da URL; detalhe tem acesso direto e as rotas restantes estão registradas como placeholders. O arquivo Figma está acessível em modo de visualização. O tema Kurio aplica tokens Tailwind/shadcn, tipografia local e a estrutura mobile exportados pelo Figma, com os quatro artworks locais em `public/images/`.

## Deploy

A configuração `vercel.json` faz fallback das rotas SPA para `index.html`. Publique o build de demonstração com `npm run build` para usar MSW, ou o build de produção com `npm run build:production` e as URLs das APIs reais.

## Documentação

- [Escopo original do desafio](CHALLENGE.md)
- [Decisões, contratos REST, cache e limites atuais](ARCHITECTURE.md)
- [Home responsiva, componentes e breakpoints](docs/HOME.md)
- Stories e documentação interativa da Home: `npm run storybook`
