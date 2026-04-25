export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  inStock: boolean
}

export type Category = {
  id: string
  name: string
  description: string
  icon: string
}

export const categories: Category[] = [
  { id: 'sedas', name: 'Sedas', description: 'Papéis para enrolar de alta qualidade', icon: '📜' },
  { id: 'piteiras', name: 'Piteiras de Vidro', description: 'Piteiras artesanais em vidro', icon: '🔮' },
  { id: 'cuias', name: 'Cuias', description: 'Cuias para chimarrão e tererê', icon: '🧉' },
  { id: 'tabaco', name: 'Tabaco', description: 'Tabacos selecionados importados', icon: '🍂' },
  { id: 'narguiles', name: 'Narguiles', description: 'Narguiles e acessórios', icon: '💨' },
  { id: 'slicks', name: 'Slicks', description: 'Potes de silicone para concentrados', icon: '🫙' },
  { id: 'isqueiros', name: 'Isqueiros', description: 'Isqueiros de qualidade', icon: '🔥' },
  { id: 'cinzeiros', name: 'Cinzeiros', description: 'Cinzeiros decorativos', icon: '⚫' },
]

export const products: Product[] = [
  // Sedas
  {
    id: 'seda-raw-classic',
    name: 'RAW Classic King Size',
    description: 'Seda natural não branqueada, tamanho king size. 32 folhas por livreto.',
    price: 8.90,
    category: 'sedas',
    image: '/products/seda-raw.jpg',
    inStock: true
  },
  {
    id: 'seda-smoking-brown',
    name: 'Smoking Brown King Size',
    description: 'Seda marrom natural sem cloro. 33 folhas por livreto.',
    price: 7.50,
    category: 'sedas',
    image: '/products/seda-smoking.jpg',
    inStock: true
  },
  {
    id: 'seda-ocb-premium',
    name: 'OCB Premium Slim',
    description: 'Seda ultrafina premium. Queima lenta e uniforme.',
    price: 9.90,
    category: 'sedas',
    image: '/products/seda-ocb.jpg',
    inStock: true
  },
  {
    id: 'seda-elements',
    name: 'Elements Rice Paper',
    description: 'Seda de arroz ultrafina. Praticamente sem cinza.',
    price: 10.90,
    category: 'sedas',
    image: '/products/seda-elements.jpg',
    inStock: true
  },

  // Piteiras de Vidro
  {
    id: 'piteira-vidro-classica',
    name: 'Piteira Vidro Clássica',
    description: 'Piteira de vidro borossilicato transparente. Fácil limpeza.',
    price: 15.00,
    category: 'piteiras',
    image: '/products/piteira-classica.jpg',
    inStock: true
  },
  {
    id: 'piteira-vidro-colorida',
    name: 'Piteira Vidro Colorida',
    description: 'Piteira artesanal colorida. Diversas cores disponíveis.',
    price: 25.00,
    category: 'piteiras',
    image: '/products/piteira-colorida.jpg',
    inStock: true
  },
  {
    id: 'piteira-vidro-espiral',
    name: 'Piteira Vidro Espiral',
    description: 'Piteira com design espiral interno. Resfria a fumaça.',
    price: 35.00,
    category: 'piteiras',
    image: '/products/piteira-espiral.jpg',
    inStock: true
  },
  {
    id: 'piteira-murano',
    name: 'Piteira Murano Premium',
    description: 'Piteira estilo Murano com detalhes coloridos exclusivos.',
    price: 45.00,
    category: 'piteiras',
    image: '/products/piteira-murano.jpg',
    inStock: true
  },

  // Cuias
  {
    id: 'cuia-porongo-natural',
    name: 'Cuia Porongo Natural',
    description: 'Cuia tradicional de porongo natural. Capacidade 250ml.',
    price: 35.00,
    category: 'cuias',
    image: '/products/cuia-porongo.jpg',
    inStock: true
  },
  {
    id: 'cuia-ceramica',
    name: 'Cuia Cerâmica Artesanal',
    description: 'Cuia de cerâmica pintada à mão. Design exclusivo.',
    price: 55.00,
    category: 'cuias',
    image: '/products/cuia-ceramica.jpg',
    inStock: true
  },
  {
    id: 'cuia-inox',
    name: 'Cuia Térmica Inox',
    description: 'Cuia térmica de inox. Mantém temperatura por mais tempo.',
    price: 89.00,
    category: 'cuias',
    image: '/products/cuia-inox.jpg',
    inStock: true
  },
  {
    id: 'bomba-chimarrao',
    name: 'Bomba Chimarrão Inox',
    description: 'Bomba de inox com mola. Não entope.',
    price: 25.00,
    category: 'cuias',
    image: '/products/bomba-inox.jpg',
    inStock: true
  },

  // Tabaco
  {
    id: 'tabaco-virginia',
    name: 'Tabaco Virginia Gold',
    description: 'Tabaco Virginia suave e aromático. Pacote 25g.',
    price: 22.00,
    category: 'tabaco',
    image: '/products/tabaco-virginia.jpg',
    inStock: true
  },
  {
    id: 'tabaco-burley',
    name: 'Tabaco Burley Natural',
    description: 'Tabaco Burley com sabor encorpado. Pacote 30g.',
    price: 28.00,
    category: 'tabaco',
    image: '/products/tabaco-burley.jpg',
    inStock: true
  },
  {
    id: 'tabaco-menta',
    name: 'Tabaco Mentolado Premium',
    description: 'Tabaco com essência de menta refrescante. Pacote 25g.',
    price: 25.00,
    category: 'tabaco',
    image: '/products/tabaco-menta.jpg',
    inStock: true
  },
  {
    id: 'tabaco-cherry',
    name: 'Tabaco Cereja Aromático',
    description: 'Tabaco com aroma de cereja. Pacote 25g.',
    price: 26.00,
    category: 'tabaco',
    image: '/products/tabaco-cherry.jpg',
    inStock: true
  },

  // Narguiles
  {
    id: 'narguile-pequeno',
    name: 'Narguile Completo Pequeno',
    description: 'Narguile compacto ideal para iniciantes. Altura 35cm.',
    price: 89.00,
    category: 'narguiles',
    image: '/products/narguile-pequeno.jpg',
    inStock: true
  },
  {
    id: 'narguile-medio',
    name: 'Narguile Tradicional Médio',
    description: 'Narguile tradicional egípcio. Altura 55cm.',
    price: 159.00,
    category: 'narguiles',
    image: '/products/narguile-medio.jpg',
    inStock: true
  },
  {
    id: 'narguile-premium',
    name: 'Narguile Premium Grande',
    description: 'Narguile premium com vaso decorado. Altura 75cm.',
    price: 289.00,
    category: 'narguiles',
    image: '/products/narguile-premium.jpg',
    inStock: true
  },
  {
    id: 'essencia-narguile',
    name: 'Essência Narguile 50g',
    description: 'Essência premium diversos sabores. Escolha na compra.',
    price: 18.00,
    category: 'narguiles',
    image: '/products/essencia-narguile.jpg',
    inStock: true
  },

  // Slicks
  {
    id: 'slick-pequeno',
    name: 'Slick Silicone 3ml',
    description: 'Pote de silicone food grade. Ideal para concentrados.',
    price: 12.00,
    category: 'slicks',
    image: '/products/slick-pequeno.jpg',
    inStock: true
  },
  {
    id: 'slick-medio',
    name: 'Slick Silicone 6ml',
    description: 'Pote de silicone médio. Diversas cores.',
    price: 18.00,
    category: 'slicks',
    image: '/products/slick-medio.jpg',
    inStock: true
  },
  {
    id: 'slick-grande',
    name: 'Slick Silicone 10ml',
    description: 'Pote de silicone grande. Anti-aderente.',
    price: 25.00,
    category: 'slicks',
    image: '/products/slick-grande.jpg',
    inStock: true
  },
  {
    id: 'slick-kit',
    name: 'Kit 5 Slicks Sortidos',
    description: 'Kit com 5 slicks de tamanhos variados.',
    price: 45.00,
    category: 'slicks',
    image: '/products/slick-kit.jpg',
    inStock: true
  },

  // Isqueiros
  {
    id: 'isqueiro-clipper',
    name: 'Isqueiro Clipper Original',
    description: 'Isqueiro Clipper recarregável. Design clássico.',
    price: 15.00,
    category: 'isqueiros',
    image: '/products/isqueiro-clipper.jpg',
    inStock: true
  },
  {
    id: 'isqueiro-bic',
    name: 'Isqueiro BIC Maxi',
    description: 'Isqueiro BIC grande. Longa duração.',
    price: 8.00,
    category: 'isqueiros',
    image: '/products/isqueiro-bic.jpg',
    inStock: true
  },
  {
    id: 'isqueiro-tocha',
    name: 'Isqueiro Tocha Recarregável',
    description: 'Isqueiro tipo tocha resistente ao vento.',
    price: 35.00,
    category: 'isqueiros',
    image: '/products/isqueiro-tocha.jpg',
    inStock: true
  },
  {
    id: 'isqueiro-eletrico',
    name: 'Isqueiro Elétrico USB',
    description: 'Isqueiro elétrico recarregável via USB.',
    price: 45.00,
    category: 'isqueiros',
    image: '/products/isqueiro-eletrico.jpg',
    inStock: true
  },

  // Cinzeiros
  {
    id: 'cinzeiro-vidro',
    name: 'Cinzeiro Vidro Redondo',
    description: 'Cinzeiro de vidro resistente. Fácil limpeza.',
    price: 20.00,
    category: 'cinzeiros',
    image: '/products/cinzeiro-vidro.jpg',
    inStock: true
  },
  {
    id: 'cinzeiro-metal',
    name: 'Cinzeiro Metal Vintage',
    description: 'Cinzeiro de metal estilo vintage. Design retrô.',
    price: 35.00,
    category: 'cinzeiros',
    image: '/products/cinzeiro-metal.jpg',
    inStock: true
  },
  {
    id: 'cinzeiro-ceramica',
    name: 'Cinzeiro Cerâmica Artesanal',
    description: 'Cinzeiro de cerâmica pintado à mão.',
    price: 45.00,
    category: 'cinzeiros',
    image: '/products/cinzeiro-ceramica.jpg',
    inStock: true
  },
  {
    id: 'cinzeiro-tampa',
    name: 'Cinzeiro com Tampa Inox',
    description: 'Cinzeiro com tampa para controle de odor.',
    price: 55.00,
    category: 'cinzeiros',
    image: '/products/cinzeiro-tampa.jpg',
    inStock: true
  },
]
