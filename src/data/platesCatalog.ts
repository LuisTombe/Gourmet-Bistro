import { ProductCategory } from '../types/index.ts';

export interface PlateMeta {
  id: number;
  index: number;
  name: string;
  shortName: string;
  category: ProductCategory;
  subtitle: string;
  description: string;
  sculptedItems: string[];
  colorAccent: string;
  badgeBg: string;
  /** Imagen optimizada del plato servido en alta definición */
  image: string;
  /** Estación gastronómica */
  station: 'Cocina' | 'Parrilla' | 'Pastelería' | 'Bar';
}

export const PLATES_CATALOG: PlateMeta[] = [
  {
    id: 1,
    index: 0,
    name: 'Plato I · Carnes & Grill a la Leña',
    shortName: 'Carnes & Grill',
    category: 'Carnes & Grill',
    subtitle: 'Cortes madurados, cordero patagónico y salmón austral',
    description:
      'Selección de alta cocina a las brasas: medallón de Ojo de Bife Angosto sellado a la parrilla, costillas de cordero al romero y filete de salmón austral glaseado.',
    sculptedItems: [
      'Ojo de Bife Angosto (400g)',
      'Costillas de Cordero Patagónico',
      'Salmón Austral Glaseado',
    ],
    colorAccent: '#f73b20',
    badgeBg: '#fdedea',
    image: '/assets/dishes/carnes.jpg',
    station: 'Parrilla',
  },
  {
    id: 2,
    index: 1,
    name: 'Plato II · Pastas & Risottos Artesanales',
    shortName: 'Pastas & Risottos',
    category: 'Pastas & Risottos',
    subtitle: 'Arroz carnaroli marino, ravioli braseado y pappardelle toscano',
    description:
      'Pastas al dente y risottos de autor: Risotto ai Frutti di Mare con langostinos y mejillones, raviolis de ossobuco al vino tinto y cintas pappardelle al ragú.',
    sculptedItems: [
      'Risotto ai Frutti di Mare',
      'Ravioli de Ossobuco Braseado',
      'Pappardelle al Ragu de Jabalí',
    ],
    colorAccent: '#f84d35',
    badgeBg: '#f5ffbb',
    image: '/assets/dishes/pastas.jpg',
    station: 'Cocina',
  },
  {
    id: 3,
    index: 2,
    name: 'Plato III · Entradas de Autor',
    shortName: 'Entradas',
    category: 'Entradas',
    subtitle: 'Burrata pugliese, carpaccio trufado y tartar de atún rojo',
    description:
      'Aperturas gastronómicas frescas y sutiles: Burrata Pugliese artesanal con higos caramelizados, láminas de carpaccio de res trufado y timbal de dados de atún rojo con palta.',
    sculptedItems: [
      'Carpaccio de Res Trufado',
      'Burrata Pugliese con Higos',
      'Tartar de Atún Rojo & Palta',
    ],
    colorAccent: '#fb2d54',
    badgeBg: '#fdedea',
    image: '/assets/dishes/entradas.jpg',
    station: 'Cocina',
  },
  {
    id: 4,
    index: 3,
    name: 'Plato IV · Alta Pastelería & Postres',
    shortName: 'Postres',
    category: 'Postres',
    subtitle: 'Esfera de cacao Valrhona 70% y Tiramisú Tradizionale',
    description:
      'Dulces de precisión y texturas inolvidables: Esfera de Chocolate Valrhona 70% con hoja de oro comestible y Tiramisú Tradizionale con crema mascarpone.',
    sculptedItems: [
      'Esfera de Chocolate Valrhona',
      'Tiramisú Tradizionale',
    ],
    colorAccent: '#360802',
    badgeBg: '#bcffbb',
    image: '/assets/dishes/postres.jpg',
    station: 'Pastelería',
  },
  {
    id: 5,
    index: 4,
    name: 'Plato V · Coctelería de Autor & Bar',
    shortName: 'Bebidas & Bar',
    category: 'Bebidas & Bar',
    subtitle: 'Smoked Old Fashioned, Gin Tonic Botánico y Limonada Fresca',
    description:
      'Mixología botánica y destilados finos: Old Fashioned ahumado con esencia de roble, copa balón de Gin Tonic con enebro y Limonada natural de Hierbabuena.',
    sculptedItems: [
      'Cóctel Smoked Old Fashioned',
      'Gin Tonic Botánico',
      'Limonada de Hierbabuena & Jengibre',
    ],
    colorAccent: '#477ee9',
    badgeBg: '#f5ffbb',
    image: '/assets/dishes/bebidas.jpg',
    station: 'Bar',
  },
];

// Compatibilidad retroactiva
export const DISHES = PLATES_CATALOG;
export const PLATES_3D_CATALOG = PLATES_CATALOG;
export type Plate3DMeta = PlateMeta;
