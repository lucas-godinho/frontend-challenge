# Sistema de componentes Kurio

`Button`, `Input`, `Textarea`, `Label`, `Badge`, `Skeleton`, `Card`, `Select` e `Dialog` foram instalados pelo registro oficial de shadcn/ui e adaptados aos tokens e às proporções da Kurio. O código fica versionado em `src/components/atoms`; as fachadas em `src/components/molecules` preservam a API usada pelas telas. `Button` e `Card` usam Radix Slot; `Dialog` e `Select` usam primitivos Radix para foco e teclado. A configuração da CLI fica em `components.json`.

## Primitivos

| Componente | Nível | Uso |
| --- | --- | --- |
| `Button` | Átomo | Ações primárias, secundárias, ghost, outline e destructive; aceita `asChild` para links TanStack Router. |
| `Input` | Átomo | Campo de texto com foco, borda, placeholder e estado desabilitado. |
| `Label` | Átomo | Rótulo instalado pelo registro oficial do shadcn/ui e associado ao campo por `htmlFor`. |
| `PasswordInput` | Átomo | Campo de senha com alternância acessível de visibilidade. |
| `Textarea` | Átomo | Observações e campos multilinha com os mesmos tokens de foco e superfície. |
| `Badge` | Átomo | Raridade e estados com variantes tipadas; o texto transmite o significado sem depender de cor. |
| `Skeleton` | Átomo | Reserva espaço durante consulta e usa shimmer com redução de movimento. |
| `Checkbox` | Átomo | Controle Radix compartilhado por filtros e formulários de conta/checkout. |
| `RadioGroup` | Átomo | Seleção exclusiva e acessível de carteira no checkout. |
| `Card` | Molécula | Superfície composta por header, título, descrição e conteúdo. |
| `Select` | Molécula | Radix Select com navegação por teclado, seleção controlada e variantes padrão/compacta. |
| `Dialog` | Molécula | Radix Dialog no desktop, com foco inicial, contenção do Tab, Escape e restauração do foco. A apresentação mobile usa uma seção de página. |
| `Pagination` | Molécula | Navegação de páginas com estados anterior, próxima e selecionada. |
| `PageContainer` | Organismo | Largura e recuos responsivos compartilhados por todas as rotas de produto. |

Use `Button`, `Input`, `Label` e `PasswordInput` em formulários de todas as features. Para campos não textuais, use `Select` quando a lista precisa seguir o tema; mantenha opções e estado no componente de domínio. Use `Dialog` para sobreposições com foco controlado. `Card asChild` aplica a superfície preservando `aside`, `section` e `article` em carrinho, pagamento, recibo e carteiras. `Skeleton` ocupa a área do conteúdo durante consultas e `Badge` comunica raridade. Labels, ajuda e erros pertencem ao formulário e devem continuar associados ao controle por `htmlFor`, `aria-describedby` e `aria-invalid`.

## Escala tipográfica

As telas usam os tokens tipográficos definidos em `src/styles.css`. Evite valores avulsos menores que 12px para texto funcional; essa escala também vale para labels, controles e metadados que precisem continuar legíveis no mobile.

| Token | Tamanho | Uso |
| --- | --- | --- |
| `--type-caption` | 12px | Ajuda, metadados e texto secundário. |
| `--type-label` | 14px | Labels, controles, navegação e ações. |
| `--type-body` | 16px | Texto de leitura e conteúdo principal. |
| `--type-subtitle` | 18px | Títulos de seção e subtítulos. |

Campos devem ter pelo menos 44px de altura e labels compostos precisam agrupar o texto e o indicador de obrigatoriedade no mesmo elemento para manter uma única linha visual.

## Telas documentadas

- Login e cadastro usam o `Dialog` em desktop e ocupam a página em mobile.
- Perfil do colecionador reutiliza `Input`, `Button` e `Textarea` e tem estados de salvamento e erro.
- Carteiras reutiliza `Select`, `Input` e `Button` para cadastrar e editar carteiras.
- Checkout reutiliza `Select`, `Input`, `Textarea` e `Button` para revisão e confirmação.
- Carrinho reutiliza `Input` no cupom, `Button` nas ações e o padrão `Card` para o resumo.

## Storybook

Execute `npm run storybook`. O guia `Kurio/Guia do projeto` mapeia componentes, fluxos e decisões visuais. Stories com autodocs ficam organizadas por nível em `Design System/Atoms`, `Design System/Molecules`, `Marketplace/Molecules` e `Home/Organisms`; as telas reais ficam em `Kurio/Telas e fluxos` e as páginas de autenticação mobile em `Conta/Telas mobile de autenticação`.

As stories de telas montam o Router real com histórico em memória, QueryClient novo e MSW. Os dados são preparados no armazenamento da origem do Storybook antes da rota iniciar; as requisições continuam usando handlers, sem fixture embutida nos componentes de tela. Stories de componentes menores usam props e fixtures locais para manter a composição isolada. O addon Accessibility ajuda na revisão semântica e visual; Playwright segue responsável pelos fluxos E2E e screenshots de regressão.

As classes passam pelo utilitário `cn` (`clsx` + `tailwind-merge`). Tailwind v4 fornece os utilitários das telas, do shell e dos componentes. `src/styles.css` fica reservado aos tokens de tema, fontes, reset, foco global e animações reutilizadas; não deve concentrar layout específico de página. Antes de alterar um token, revise sua story e pelo menos uma tela que o utiliza.

## Experiência de carregamento

`src/features/loading/ThreeNftLoadingScene.tsx` monta a cena de abertura em Three.js com três obras do catálogo, cartões em profundidade, órbitas e partículas. `ApplicationRouterView` espera 240 ms e só carrega essa feature com `import()` se as consultas iniciais ainda estiverem ativas. Em carregamentos rápidos, remove o splash estático sem baixar Three.js. A cena 3D sai ao concluir as consultas iniciais ou ao atingir o limite máximo. O código limita a renderização a 30 quadros por segundo e o pixel ratio a 1,5.

O HTML inclui um splash antes do React para evitar a tela vazia durante a primeira transferência. Se o navegador não criar um contexto WebGL, a tela usa a composição CSS; se a importação Three.js falhar, o app segue com os skeletons da Home. Com `prefers-reduced-motion`, a cena permanece estática e a saída não anima. Revise a composição em `Kurio/Experiência de carregamento` no Storybook. A experiência reduz a espera percebida; o ganho no carregamento real só pode ser confirmado com uma nova série Lighthouse.
