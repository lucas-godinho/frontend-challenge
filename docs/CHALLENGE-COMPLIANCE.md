# Aderência ao CHALLENGE.md

Esta matriz aponta evidências reproduzíveis do desafio. “Implementado” descreve o código local; não equivale a deploy publicado ou a meta Lighthouse atingida.

## Stack obrigatória

| Tecnologia | Evidência no projeto | Situação |
| --- | --- | --- |
| React + TypeScript | `src/main.tsx`, `src/app.tsx`, features `.tsx` e `tsconfig*.json` | Implementado |
| TanStack Router | `src/router.tsx`: rotas, parâmetros, busca validada, proteção e acesso direto | Implementado |
| TanStack Query | Hooks de catálogo, sessão, favoritos, carrinho e pedidos em `src/features/` | Implementado |
| Axios + REST | `src/lib/api.ts`, APIs tipadas em `src/features/*/*-api.ts`, contratos em `docs/API.md` | Implementado |
| Socket.IO | `src/lib/realtime.ts`, `use-catalog-realtime.ts` e `use-order-realtime.ts` | Implementado |
| Tailwind CSS v4 | Plugin Vite, `@theme` e utilitários responsivos na Home, catálogo, detalhe, carrinho, checkout, recibo e conta; CSS global contém tokens, reset e animações compartilhadas | Adotado nas telas; CSS estrutural residual restrito ao shell/tema |
| shadcn/ui | `components.json`; Button, Input, Textarea, Label, Badge, Skeleton, Card, Select, Dialog, Checkbox e Radio group versionados/adaptados e usados nas features | Primitivos compartilhados adotados; layouts de domínio continuam semânticos e compostos com Tailwind |
| MSW | `src/mocks/` e `public/mockServiceWorker.js`; cenários REST/WebSocket no build demo | Implementado |
| Playwright | `e2e/`, `playwright.config.ts` e baselines desktop/mobile | Implementado |
| Lighthouse | `scripts/audit-lighthouse.mjs`, `lighthouserc*.cjs` e relatórios em `artifacts/` | Configurado; meta mobile pendente |

Os primitivos citados vieram do registro oficial e foram adaptados para usar o utilitário `cn` local e a identidade Kurio. As fachadas existentes de `Card`, `Select` e `Dialog` mantêm os contratos das telas enquanto compõem os novos primitivos. O Storybook apresenta variantes de componentes, organismos, templates e rotas reais; `Kurio/Guia do projeto` documenta a navegação, os estados e o setup. A arquitetura de estilo está em `docs/DESIGN-SYSTEM.md`.

## Fluxos e evidências

| Requisito | Implementação | Evidência automatizada |
| --- | --- | --- |
| Descoberta, filtros, URL e detalhe | `src/features/home/`, `src/features/catalog/` | `e2e/discovery.spec.ts`, `catalog-controls.spec.ts`, `detail-cart.spec.ts` |
| Carrinho, cupom, persistência | `src/features/cart/`, handlers MSW | `e2e/detail-cart.spec.ts`, `checkout-resilience.spec.ts` |
| Compra, revalidação e recibo | `CheckoutPage.tsx`, `OrderConfirmationPage.tsx`, idempotência MSW | `e2e/checkout-resilience.spec.ts` |
| Login, cadastro, expiração, perfil, carteiras | `src/features/account/` e rotas protegidas | `e2e/account-session.spec.ts`, `account-data.spec.ts`, `mobile-auth-guard.spec.ts` |
| Favoritos isolados por usuário | `src/features/favorites/` | `e2e/favorites.spec.ts` |
| Eventos e reconexão | `src/lib/realtime.ts`, `src/mocks/realtime.ts` | `e2e/realtime.spec.ts` |
| Falhas e latência determinísticas | Cenários em `src/mocks/` | `e2e/network-scenarios.spec.ts`, `mock-startup.spec.ts` |
| Figma, responsividade e acessibilidade | Tokens, imagens locais, 390/768/1440 px | `e2e/responsive-layout.spec.ts`, `visual-regression.spec.ts` |
| Documentação de componentes e telas | `.storybook/`, stories de design system/features/rotas, `src/stories/ChallengeGuide.mdx` | `npm run build-storybook` |

## Pendências de entrega

- **Performance:** o desafio exige mediana Lighthouse ≥90 e a meta interna é ≥95. A última série mobile ficou abaixo de ambas; valores, causas e reprodução estão em `docs/PERFORMANCE.md`. O app agora usa um splash HTML imediato, uma cena Three.js carregada sob demanda e artes da Home durante as consultas. A experiência melhora o feedback visual; uma nova série Lighthouse precisa confirmar o efeito nas métricas.
- **Playwright:** os cenários e baselines estão versionados. Uma execução anterior não iniciou porque o Chromium do Playwright estava ausente no ambiente; instale o browser indicado pelo Playwright e rode a suíte para comprovar que os testes estão verdes.
- **Deploy público:** `vercel.json` e o build demo estão preparados para SPA com MSW, mas ainda é preciso publicar o checkout final e registrar a URL pública correspondente ao commit entregue. Sem URL pública, o requisito 12 do desafio permanece pendente.
- **Evidência versionada:** os relatórios Lighthouse HTML/JSON são gerados em `artifacts/`; antes da submissão, selecione e versione a série final com o mesmo código do deploy.

## Reproduzir

```bash
npm install
npm run build
npm run build-storybook
npm run test:e2e
npm run audit:lighthouse
```

Credenciais, cenários, reset, variáveis e comandos detalhados estão em `README.md`; contratos e limitações da simulação em `docs/API.md` e `ARCHITECTURE.md`.
