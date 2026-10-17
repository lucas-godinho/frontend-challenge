# Home responsiva

## Responsabilidades

| Área | Arquivo | Responsabilidade |
| --- | --- | --- |
| Shell | `src/components/layout/AppShell.tsx` | Cabeçalho, Outlet, navegação mobile e rodapé |
| Página | `src/features/home/HomePage.tsx` | Estado da Home, consultas do catálogo e composição da página |
| Destaques | `src/features/home/HeroCarousel.tsx` | Slides, artwork, controles e pausa da rotação automática |
| Catálogo | `src/features/home/CatalogSection.tsx` | Busca, ordenação, filtros, estados de carregamento e grade |
| Chamada editorial | `src/features/home/Newsletter.tsx` | Bloco de descoberta de artistas |
| Card reutilizável | `src/features/catalog/NftCard.tsx` | Apresentação de um NFT e navegação ao detalhe |

O TanStack Router mantém busca, ordenação e página na URL. `useCatalog` continua isolando cache e chamadas remotas com TanStack Query; o componente de catálogo só apresenta os estados retornados pela query.

## Composição responsiva

- **Mobile, até 760 px:** preserva a tela Kurio existente, com campo compacto de busca, hero com fundo SVG, abas roláveis, grade de duas colunas com alternância vertical e navegação inferior.
- **Tablet, 761–1050 px:** exibe cabeçalho e rodapé, hero em duas colunas, grade de três colunas e margens menores para manter o conteúdo confortável.
- **Desktop, a partir de 1051 px:** hero amplo com copy e artwork lado a lado, navegação superior, filtros no catálogo e vitrine em três colunas; a partir de 1200 px a grade abre para quatro colunas.

O conteúdo e as consultas são compartilhados nos breakpoints. Apenas a disposição visual muda. Respeitamos `prefers-reduced-motion` na rotação do carrossel e as imagens usam texto alternativo e fallback local.

## Referência Figma

O protótipo mobile disponível mostra a Home de descoberta. O frame desktop aberto no protótipo está rotulado “Início / Mercado”, porém sua composição visível contém uma galeria de artwork, detalhes do NFT e avaliações. Até haver um frame desktop separado e inequívoco da vitrine inicial, a versão desktop da Home mantém o conteúdo da vitrine mobile e adapta o seu layout; o frame de detalhes não é tratado como referência da grade de catálogo.

Os arquivos originais das obras não estão disponíveis no repositório. A Home usa as imagens de demonstração das fixtures e `/images/artwork-fallback.svg` como fallback. O fundo do hero mobile permanece em `public/images/hero-background.svg`.

## Pontos de evolução

- Adicionar paginação visível do catálogo quando a API e o desenho desktop definirem seu comportamento.
- Ligar a ação de salvar card ao fluxo de favoritos.
- Trocar artwork temporário pelos assets exportados do Figma.
- Cobrir larguras desktop com cenários Playwright e baselines visuais após confirmar o frame de vitrine desktop.
