# Home responsiva

## Arquitetura e responsabilidades

| Área | Arquivo | Responsabilidade |
| --- | --- | --- |
| Shell | `src/components/layout/AppShell.tsx` | Cabeçalho, Outlet, navegação mobile e rodapé |
| Página/estado | `src/features/home/HomePage.tsx` | Integra Router e Query, mantém os parâmetros da URL e converte o resultado remoto para estado de apresentação |
| Composição | `src/features/home/HomeContent.tsx` | Compõe a Home sem acoplar a apresentação ao Router ou à query |
| Conteúdo inicial | `src/features/home/home-content.tsx` | Dados dos slides, promoções e artigos usados pela Home e pelas stories |
| Destaques | `src/features/home/HeroCarousel.tsx` | Slides, artwork, controles e pausa da rotação automática |
| Busca | `src/features/home/CatalogSearch.tsx` | Campo de busca, ordenação e linha compacta de busca mobile |
| Abas | `src/features/home/CatalogTabs.tsx` | Navegação entre categorias do catálogo |
| Filtros | `src/features/home/CatalogFilters.tsx` | Filtros de catálogo usados nos breakpoints suportados |
| Resultados | `src/features/home/CatalogResults.tsx` | Grade e estados explícitos de carregamento, erro, vazio e sucesso |
| Seção de catálogo | `src/features/home/CatalogSection.tsx` | Compõe busca, abas, filtros e resultados |
| Promoções | `src/features/home/PromoHighlights.tsx` | Cards promocionais reutilizáveis, alimentados por itens ou dados próprios |
| Diário | `src/features/home/BlogSection.tsx` | Lista de artigos editoriais da Home |
| Benefícios | `src/features/home/BenefitsNewsletter.tsx` | Benefícios e formulário de newsletter do rodapé desktop |
| Conteúdo editorial | `src/features/home/HomeEditorial.tsx` | Compõe promoções, diário e benefícios/newsletter |
| Chamada mobile | `src/features/home/Newsletter.tsx` | Bloco compacto de descoberta de artistas para mobile |
| Card reutilizável | `src/features/catalog/NftCard.tsx` | Apresentação de um NFT e navegação ao detalhe |

O TanStack Router mantém busca, ordenação, categoria e página na URL. `useCatalog` isola cache e chamadas remotas com TanStack Query. `HomePage` traduz o resultado da query para `CatalogViewState`, uma união discriminada; os componentes visuais recebem props e podem ser renderizados isoladamente no Storybook.

## Storybook

As stories ficam junto dos componentes (`*.stories.tsx`) e usam autodocs. Isso mantém documentação, exemplos e variações perto da implementação e permite exercitar as seções sem subir a aplicação nem criar estado global de Router/Query.

| Grupo | Componentes/variações documentados |
| --- | --- |
| `Home/Destaques` | HeroCarousel e seus slides |
| `Home/Busca` | Linha compacta de busca e ordenação mobile |
| `Home/Catálogo` | Abas, filtros e seção completa em estados carregado, carregando, vazio e erro |
| `Home/Conteúdo editorial` | HomeEditorial, PromoHighlights e BlogSection |
| `Home/Rodapé` | Benefícios e newsletter |
| `Home/Chamada mobile` | Newsletter compacta |
| `Home/Visão geral` | Home completa com fixtures, independente do Router e da API |

Para desenvolver e revisar a documentação localmente:

```bash
npm run storybook
npm run build-storybook
```

O primeiro comando abre o catálogo interativo em `http://localhost:6006`; o segundo gera o pacote estático ignorado pelo Git em `storybook-static/`.

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
