# Kurio — NFT Marketplace

Implementação inicial do desafio definido em [CHALLENGE.md](CHALLENGE.md). O projeto usa React 19, TypeScript estrito, TanStack Router/Query, Axios, Tailwind CSS, MSW, Storybook, Playwright, Socket.IO Client e Lighthouse.

## Requisitos

- Node.js 20.19+ ou 22.12+ e npm.
- Para abrir o Storybook ou executar E2E, instale as dependências com `npm install`.

## Começar

```bash
Copy-Item .env.example .env.local
npm install
npx msw init public --save
npm run dev
```

Abra http://localhost:5173. Os mocks de REST são ativados por padrão em desenvolvimento e no build de demonstração. Defina `VITE_MOCKS=false` para desativá-los.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Base do Axios |
| `VITE_MOCKS` | `true` | Ativa MSW no desenvolvimento |
| `VITE_MOCK_SCENARIO` | `default` | Cenário de mock a selecionar (em expansão) |
| `VITE_SOCKET_URL` | `http://localhost:5173` | Endpoint do serviço Socket.IO |

O mock atual entrega catálogo e detalhe por fixtures. Resetar o navegador (ou abrir sessão privada) restaura as fixtures; autenticação e cenários de checkout ainda serão implementados. Não existem credenciais de demonstração neste bootstrap.

## Comandos

```bash
npm run dev               # Vite + mocks
npm run build             # TypeScript e build otimizado
npm run preview           # Preview do build
npm run typecheck         # Verificação TypeScript
npm run lint              # ESLint
npm run storybook         # Componentes em isolamento
npm run build-storybook   # Build do Storybook
npm run test:e2e          # Playwright desktop e mobile
npm run test:e2e:ui       # Playwright UI
npm run audit:lighthouse  # LHCI, três execuções por página
```

O primeiro uso do Playwright pode exigir `npx playwright install chromium`. Relatórios Playwright ficam em `playwright-report/`; traces de falhas em `test-results/`. Lighthouse grava HTML/JSON em `artifacts/lighthouse/`.

## Cenários atuais e planejados

O catálogo suporta sucesso, resultado vazio por busca e recurso inexistente. Latência e injeção determinística de falhas, sessão expirada, conflito, cupons, mudanças de preço, timeout idempotente e pagamento confirmado/recusado ainda precisam entrar nos handlers MSW. A configuração `VITE_MOCK_SCENARIO` está reservada, mas ainda não altera os mocks.

A rota `/` lê busca, ordenação, categoria e página da URL; detalhe tem acesso direto e as rotas restantes estão registradas como placeholders. O arquivo Figma está acessível em modo de visualização. O tema Kurio aplica os tokens, a tipografia local e a estrutura mobile exportados pelo Figma; como o CSS não inclui as imagens vinculadas, a tela usa as imagens temporárias das fixtures até receber os assets originais.

## Deploy

A configuração `vercel.json` faz fallback das rotas SPA para `index.html`. Depois de concluir recursos e mocks, publique o build em Vercel, Netlify ou Cloudflare Pages com `VITE_MOCKS=true` para a demonstração pública; confira acesso direto e refresh das rotas.

## Documentação

- [Escopo original do desafio](CHALLENGE.md)
- [Decisões, contratos REST, cache e limites atuais](ARCHITECTURE.md)
- [Home responsiva, componentes e breakpoints](docs/HOME.md)
- Stories e documentação interativa da Home: `npm run storybook`
