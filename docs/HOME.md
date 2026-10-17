# Home responsiva

## Composição e responsabilidades

| Nível | Caminho | Responsabilidade |
| --- | --- | --- |
| Page | `src/features/home/pages/HomePage.tsx` | Conecta TanStack Router, Query, URL, rotação do hero e handlers da Home. |
| Template | `src/features/home/templates/HomeTemplate.tsx` | Compõe a página visual com dados/estados/callbacks recebidos por props; não consulta API nem lê Router. |
| Organism | `src/features/home/organisms/CatalogSection.tsx` | Compõe filtros, controles e resultados da vitrine. |
| Organism | `src/features/home/organisms/CatalogFilters.tsx` | Categorias, redes, faixa de preço e destaque editorial. |
| Organism | `src/features/home/organisms/CatalogResults.tsx` | Grade e estados explícitos de carregamento, erro, vazio e sucesso. |
| Organism | `src/features/home/organisms/HeroCarousel.tsx` | Slides, artwork, controles e pausa da rotação automática. |
| Organisms | `src/features/home/organisms/{HomeEditorial,PromoHighlights,BlogSection,BenefitsNewsletter,Newsletter}.tsx` | Blocos editoriais e chamadas responsivas da Home. |
| Molecules | `src/features/catalog/molecules/` | Busca/ordenação, abas, faixa de preço e card NFT reutilizados entre catálogo e Favoritos. |
| Molecules | `src/components/molecules/` | Select, paginação e superfície de card compartilhados entre features. |
| Atoms | `src/components/atoms/` | Button e Input base, sem dependência de um domínio. |
| Organism global | `src/components/organisms/AppShell.tsx` | Cabeçalho, outlet, navegação mobile e rodapé compartilhados pelas páginas. |

`src/features/home/home-content.tsx` e `home-types.ts` guardam os dados de demonstração e os contratos dos blocos editoriais. Catálogo e Favoritos preservam seus próprios módulos de domínio; somente componentes realmente usados por mais de uma tela sobem para `src/components`.

## Fluxo de estado

`HomePage` valida e atualiza os filtros pela URL e usa `useCatalog` para o estado remoto. `HomeTemplate` recebe os dados já resolvidos. Os organismos e moléculas permanecem controlados por props, facilitando composição, teste visual e reuso em páginas futuras.

Os favoritos usam `src/features/favorites/use-favorites.ts`, um pequeno store baseado em `useSyncExternalStore` sincronizado com `localStorage`. `FavoritesPage` resolve os IDs salvos com catálogo REST e entrega estado/itens a `FavoritesTemplate`; a mesma molécula `NftCard` é usada na Home e na lista de salvos.

## Storybook

O sidebar do Storybook acompanha a hierarquia atômica:

| Grupo | Exemplos |
| --- | --- |
| `Design System/Atoms` | Button, Input e tokens do tema |
| `Design System/Molecules` | Card, Select e Pagination |
| `Marketplace/Molecules` | NFT card, busca/ordenação, abas e faixa de preço |
| `Home/Organisms` | Hero, filtros, catálogo e blocos editoriais |
| `Home/Templates` | Home completa com fixtures, sem Router ou API |
| `Favorites/Templates` | Lista salva em estados populated, vazio, carregando e erro |

Stories são colocadas junto da camada/componente e documentam intenção, props, estados e acessibilidade. Para conferir localmente:

```bash
npm run storybook
npm run build-storybook
```

## Composição responsiva

- **Mobile, até 760 px:** busca compacta, hero com SVG, abas roláveis, grade de duas colunas e navegação inferior.
- **Tablet, 761–1050 px:** cabeçalho/rodapé, hero em duas colunas, grade de três colunas e margens menores.
- **Desktop, a partir de 1051 px:** navegação superior, hero em duas colunas, filtros laterais, catálogo, promos, artigos e rodapé.

O conteúdo e as consultas são compartilhados nos breakpoints; apenas a disposição visual muda. Respeitamos `prefers-reduced-motion`, imagens têm fallback local, os filtros permanecem na URL e o histórico do navegador recupera os valores e a rolagem.

## Catálogo de demonstração

Os mocks entregam 54 NFTs distribuídos pelas nove categorias e três redes. A resposta inclui contagens do inventário completo e limites de preço. Cada página tem nove itens; busca, preço, rede, categoria e ordenação são aplicados antes da paginação.

## Referência Figma

A frame desktop “Desktop / Início” mede 1440 × 3668 px e organiza Top, Products, Promos, Blog e Footer. Quatro artworks locais são carregados pelas fixtures em `public/images/nft-1.png` até `nft-4.png`; o fallback é `/images/artwork-fallback.svg`. O hero mobile preserva o SVG `public/images/hero-background.svg`.
