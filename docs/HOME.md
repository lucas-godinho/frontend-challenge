# Home responsiva

## Responsabilidades

| Área | Arquivo | Responsabilidade |
| --- | --- | --- |
| Shell | `src/components/layout/AppShell.tsx` | Cabeçalho, Outlet, navegação mobile e rodapé |
| Página | `src/features/home/HomePage.tsx` | Estado da Home, consultas do catálogo e composição da página |
| Destaques | `src/features/home/HeroCarousel.tsx` | Slides, artwork, controles e pausa da rotação automática |
| Catálogo | `src/features/home/CatalogSection.tsx` | Busca, ordenação, filtros, estados de carregamento e grade |
| Chamada editorial | `src/features/home/Newsletter.tsx` | Bloco de descoberta de artistas |
| Conteúdo desktop | `src/features/home/HomeEditorial.tsx` | Promoções, diário da cunhagem e benefícios/newsletter desktop |
| Card reutilizável | `src/features/catalog/NftCard.tsx` | Apresentação de um NFT e navegação ao detalhe |

O TanStack Router mantém busca, ordenação e página na URL. `useCatalog` continua isolando cache e chamadas remotas com TanStack Query; o componente de catálogo só apresenta os estados retornados pela query.

## Composição responsiva

- **Mobile, até 760 px:** preserva a tela Kurio existente, com campo compacto de busca, hero com fundo SVG, abas roláveis, grade de duas colunas com alternância vertical e navegação inferior.
- **Tablet, 761–1050 px:** exibe cabeçalho e rodapé, hero em duas colunas, grade de três colunas e margens menores para manter o conteúdo confortável.
- **Desktop, a partir de 1051 px:** usa a estrutura da frame “Desktop / Início” do Figma: cabeçalho Kurio, hero em duas colunas, catálogo com filtros laterais e grade de três colunas, duas promoções editoriais, quatro artigos e rodapé com benefícios, inscrição e links.

O conteúdo e as consultas são compartilhados nos breakpoints. Apenas a disposição visual muda. Respeitamos `prefers-reduced-motion` na rotação do carrossel e as imagens usam texto alternativo e fallback local.

## Referência Figma

A frame desktop “Desktop / Início” mede 1440 × 3668 px, tem margens laterais de 120 px, espaçamento vertical de 96 px entre seções e agrupa Top, Products, Promos, Blog e Footer. O protótipo inicia a sequência na Home: navegação superior, hero com título à esquerda e artwork à direita, filtros de coleções/preço/rede ao lado de uma grade com três colunas, dois cards promocionais, quatro cards editoriais e um rodapé com benefícios, newsletter e navegação.

A estrutura desktop agora segue essa composição. Os assets originais das obras do Figma ainda não estão no repositório, então as imagens dos cards/promos/blog usam as fixtures atuais e `/images/artwork-fallback.svg` como fallback. O hero mobile mantém o SVG de fundo `public/images/hero-background.svg`; no desktop a imagem principal ocupa o painel de artwork sem o fundo decorativo mobile.

## Pontos de evolução

- Exportar e substituir pelas imagens originais do Figma quando os assets estiverem disponíveis no projeto.
- Ligar os filtros desktop de faixa de preço e rede aos parâmetros da API.
- Ligar a ação de salvar card ao fluxo de favoritos.
- Trocar artwork temporário pelos assets exportados do Figma.
- Cobrir larguras desktop com cenários Playwright e baselines visuais após confirmar o frame de vitrine desktop.
