import type { HeroSlide } from './HeroCarousel'
import type { PromoItem } from './home-types'

export const homeHeroSlides: HeroSlide[] = [
  {
    eyebrow: 'Bem-vindo à Kurio',
    title: <>Seja dono da<br/><em>cultura digital</em></>,
    desktopTitle: <>Seja dono do futuro<br/>da arte digital</>,
    description: 'Descubra NFTs selecionados de criadores do mundo todo.',
    desktopDescription: 'Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.',
    action: 'Explorar',
  },
  {
    eyebrow: 'Curadoria da semana',
    title: <>Encontre sua<br/><em>próxima obra</em></>,
    description: 'Edições especiais de artistas independentes para sua coleção.',
    action: 'Ver coleção',
  },
  {
    eyebrow: 'Arte que conecta',
    title: <>Colecione o<br/><em>extraordinário</em></>,
    description: 'Explore obras digitais únicas e descubra novos criadores.',
    action: 'Descobrir',
  },
]

export const homeArticles = [
  { title: 'Como funciona a propriedade de NFTs', summary: 'Aprenda a colecionar, negociar e acompanhar ativos digitais com segurança.', date: '12 de setembro', readingTime: '6 min' },
  { title: '10 artistas digitais para acompanhar', summary: 'Conheça criadores que moldam a próxima geração da arte digital.', date: '13 de setembro', readingTime: '2 min' },
  { title: 'Raridade, atributos e procedência', summary: 'Entenda raridade, procedência e o valor de cada edição.', date: '15 de setembro', readingTime: '3 min' },
  { title: 'Como proteger sua carteira', summary: 'Proteja seus ativos digitais e reconheça boas práticas de segurança.', date: '15 de setembro', readingTime: '2 min' },
]

export const homePromos: PromoItem[] = [
  { title: 'Lançamentos gênesis de edição limitada', description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.' },
  { title: 'Arte digital selecionada e muito mais', description: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.' },
]
