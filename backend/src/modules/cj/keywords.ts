
const MEN_STYLES = [
  'oversized', 'regular fit', 'slim fit', 'relaxed fit', 'baggy',
  'streetwear', 'minimal', 'casual', 'formal', 'premium', 'luxury',
  'vintage', 'washed', 'graphic', 'printed', 'solid', 'striped',
  'checked', 'plaid', 'embroidered', 'drop shoulder', 'boxy',
  'athletic', 'sporty', 'preppy', 'workwear', 'outdoor', 'tactical',
  'military', 'biker', 'urban', 'classic', 'retro', 'boho',
  'tie dye', 'acid wash', 'distressed', 'raw hem', 'patchwork',
];

const MEN_FABRICS = [
  'cotton', 'linen', 'denim', 'fleece', 'knit', 'wool',
  'polyester', 'rayon', 'viscose', 'corduroy', 'twill', 'canvas',
  'mesh', 'jersey', 'terry', 'velvet', 'satin', 'nylon',
];

const MEN_PRODUCTS = [
  't shirt', 'shirt', 'polo shirt', 'henley shirt', 'linen shirt',
  'oxford shirt', 'flannel shirt', 'denim shirt',
  'jeans', 'slim jeans', 'baggy jeans', 'wide leg jeans', 'straight jeans',
  'cargo pants', 'cargo shorts', 'chinos', 'khakis', 'trousers',
  'dress pants', 'joggers', 'sweatpants', 'track pants', 'shorts',
  'hoodie', 'zip hoodie', 'pullover hoodie', 'sweatshirt', 'crewneck',
  'jacket', 'bomber jacket', 'denim jacket', 'leather jacket', 'windbreaker',
  'puffer jacket', 'parka', 'trench coat', 'overcoat', 'anorak',
  'blazer', 'suit jacket', 'sports coat',
  'sweater', 'cardigan', 'turtleneck', 'knitwear', 'vest sweater',
  'tank top', 'sleeveless shirt', 'muscle tee',
  'tracksuit', 'co ord set', 'matching set',
  'shorts', 'board shorts', 'swim shorts', 'gym shorts', 'running shorts',
  'ethnic wear', 'kurta', 'sherwani',
  'vest', 'gilet', 'waistcoat',
  'jumpsuit', 'romper',
];

const WOMEN_PRODUCTS = [
  'top', 'crop top', 'tank top', 't shirt', 'shirt', 'blouse', 'bodysuit',
  'tube top', 'cami top', 'halter top', 'corset top', 'bustier',
  'shirt dress', 'smock top', 'peplum top',
  'jeans', 'mom jeans', 'flare jeans', 'wide leg jeans', 'skinny jeans',
  'boyfriend jeans', 'straight jeans', 'ripped jeans', 'high waist jeans',
  'pants', 'trousers', 'wide leg pants', 'palazzo', 'culottes',
  'leggings', 'yoga pants', 'joggers', 'sweatpants', 'track pants',
  'mini skirt', 'maxi skirt', 'midi skirt', 'pleated skirt', 'wrap skirt',
  'denim skirt', 'pencil skirt', 'flared skirt', 'a-line skirt',
  'dress', 'bodycon dress', 'maxi dress', 'midi dress', 'mini dress',
  'wrap dress', 'sundress', 'shirt dress', 'slip dress', 'shirt waist dress',
  'floral dress', 'casual dress', 'party dress', 'evening dress',
  'hoodie', 'zip hoodie', 'sweatshirt', 'crewneck', 'pullover',
  'sweater', 'cardigan', 'turtleneck sweater', 'knitwear', 'crop cardigan',
  'jacket', 'blazer', 'denim jacket', 'bomber jacket', 'windbreaker',
  'leather jacket', 'puffer jacket', 'parka', 'trench coat', 'winter jacket',
  'co ord set', 'matching set', 'two piece set', 'lounge set',
  'jumpsuit', 'romper', 'playsuit', 'overalls',
  'ethnic wear', 'kurti', 'lehenga', 'salwar suit', 'anarkali',
  'activewear', 'gym set', 'sports bra', 'workout top', 'gym leggings',
];

const WOMEN_STYLES = [
  'oversized', 'slim fit', 'relaxed', 'fitted', 'flowy',
  'casual', 'formal', 'party', 'boho', 'cottagecore',
  'streetwear', 'minimal', 'elegant', 'chic', 'vintage',
  'retro', 'y2k', 'old money', 'preppy', 'athleisure',
  'korean fashion', 'aesthetic', 'trendy', 'classy',
  'summer', 'winter', 'spring', 'festive', 'beach',
];

const TRENDING = [
  'oversized', 'streetwear', 'old money', 'minimal', 'luxury',
  'premium', 'vintage', 'retro', 'y2k', 'korean fashion',
  'japanese fashion', 'new arrival', 'best seller', 'trending',
  'aesthetic', 'cottagecore', 'dark academia', 'preppy', 'boho',
  'athleisure', 'workwear', 'classic',
];

const SEASONS = [
  'summer', 'winter', 'spring', 'autumn',
];

const OCCASIONS = [
  'casual', 'formal', 'party', 'gym', 'beach', 'office',
];

export interface SearchKeyword {
  keyword: string;
  gender: 'Men' | 'Women' | 'Unisex';
  category: string;
}

function generateMenKeywords(): SearchKeyword[] {
  const result: SearchKeyword[] = [];
  const seen = new Set<string>();

  const add = (keyword: string, category: string) => {
    const k = keyword.trim().toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      result.push({ keyword: k, gender: 'Men', category });
    }
  };

  for (const product of MEN_PRODUCTS) {
    const cat = mapProductToCategory(product);

    // Base forms
    add(`men ${product}`, cat);
    add(`men's ${product}`, cat);
    add(`male ${product}`, cat);

    // Style combos
    for (const style of MEN_STYLES) {
      add(`men ${style} ${product}`, cat);
    }

    // Fabric combos (selected products)
    if (['t shirt', 'shirt', 'hoodie', 'joggers', 'shorts', 'trousers', 'jeans'].includes(product)) {
      for (const fabric of MEN_FABRICS.slice(0, 6)) {
        add(`men ${fabric} ${product}`, cat);
      }
    }

    // Trending combos
    for (const trend of TRENDING.slice(0, 8)) {
      add(`${trend} men ${product}`, cat);
    }

    // Season combos (top products only)
    if (['t shirt', 'shirt', 'shorts', 'jacket', 'hoodie', 'sweater', 'jeans'].includes(product)) {
      for (const season of SEASONS) {
        add(`men ${season} ${product}`, cat);
      }
    }

    // Occasion combos
    for (const occ of OCCASIONS.slice(0, 3)) {
      add(`men ${occ} ${product}`, cat);
    }
  }

  return result;
}

function generateWomenKeywords(): SearchKeyword[] {
  const result: SearchKeyword[] = [];
  const seen = new Set<string>();

  const add = (keyword: string, category: string) => {
    const k = keyword.trim().toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      result.push({ keyword: k, gender: 'Women', category });
    }
  };

  for (const product of WOMEN_PRODUCTS) {
    const cat = mapProductToCategory(product);

    // Base forms
    add(`women ${product}`, cat);
    add(`women's ${product}`, cat);

    // Style combos
    for (const style of WOMEN_STYLES) {
      add(`women ${style} ${product}`, cat);
    }

    // Trending combos
    for (const trend of TRENDING.slice(0, 8)) {
      add(`${trend} women ${product}`, cat);
    }

    // Season combos (top products only)
    if (['dress', 'top', 'crop top', 'jeans', 'jacket', 'hoodie', 'leggings', 'skirt'].includes(product)) {
      for (const season of SEASONS) {
        add(`women ${season} ${product}`, cat);
      }
    }
    // Occasion combos
    for (const occ of OCCASIONS.slice(0, 4)) {
      add(`women ${occ} ${product}`, cat);
    }
  }
  return result;
}
function generateUnisexKeywords(): SearchKeyword[] {
  const result: SearchKeyword[] = [];
  const seen = new Set<string>();

  const add = (keyword: string, gender: 'Men' | 'Women' | 'Unisex', category: string) => {
    const k = keyword.trim().toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      result.push({ keyword: k, gender, category });
    }
  };
  const unisexItems = [
    { kw: 'unisex t shirt', cat: 'T-Shirts & Tops' },
    { kw: 'unisex hoodie', cat: 'Hoodies' },
    { kw: 'unisex sweatshirt', cat: 'Sweatshirts' },
    { kw: 'couple hoodie', cat: 'Hoodies' },
    { kw: 'couple matching set', cat: 'Co-Ord Sets' },
    { kw: 'oversized tee unisex', cat: 'T-Shirts & Tops' },
    { kw: 'streetwear clothing', cat: 'Other' },
    { kw: 'hip hop clothing', cat: 'Other' },
    { kw: 'korean street fashion', cat: 'Other' },
    { kw: 'japanese streetwear', cat: 'Other' },
    { kw: 'y2k fashion clothing', cat: 'Other' },
    { kw: 'old money aesthetic clothing', cat: 'Other' },
    { kw: 'cottagecore clothing', cat: 'Other' },
    { kw: 'dark academia outfit', cat: 'Other' },
    { kw: 'aesthetic clothing', cat: 'Other' },
    { kw: 'festival outfit', cat: 'Other' },
    { kw: 'rave outfit', cat: 'Other' },
    { kw: 'techwear clothing', cat: 'Other' },
    { kw: 'gorpcore outfit', cat: 'Other' },
    { kw: 'normcore outfit', cat: 'Other' },
  ];

  for (const { kw, cat } of unisexItems) {
    add(kw, 'Unisex', cat);
  }

  return result;
}

function mapProductToCategory(product: string): string {
  const p = product.toLowerCase();
  if (p.includes('t shirt') || p.includes('t-shirt') || p.includes('tank') || p.includes('muscle tee') || p.includes('sleeveless')) return 'T-Shirts & Tops';
  if (p.includes('bodysuit') || p.includes('tube top') || p.includes('cami') || p.includes('halter') || p.includes('corset') || p.includes('bustier') || p.includes('peplum') || p.includes('smock') || p.includes('crop top') || p.includes('top')) return 'Tops';
  if (p.includes('blouse')) return 'Tops';
  if (p.includes('polo')) return 'Polo Shirts';
  if (p.includes('henley') || p.includes('oxford') || p.includes('flannel') || p.includes('denim shirt') || p.includes('linen shirt') || p.includes('shirt')) return 'Shirts';
  if (p.includes('flare jean') || p.includes('mom jean') || p.includes('wide leg jean') || p.includes('skinny jean') || p.includes('boyfriend jean') || p.includes('ripped jean') || p.includes('high waist jean') || p.includes('straight jean') || p.includes('slim jean') || p.includes('baggy jean') || p.includes('jean')) return 'Jeans';
  if (p.includes('cargo short')) return 'Shorts';
  if (p.includes('cargo')) return 'Cargo Pants';
  if (p.includes('chino') || p.includes('khaki') || p.includes('dress pant') || p.includes('trouser') || p.includes('palazzo') || p.includes('culottes') || p.includes('wide leg pant') || p.includes('pants') || p.includes('pant')) return 'Trousers & Pants';
  if (p.includes('jogger') || p.includes('sweatpant') || p.includes('track pant')) return 'Joggers';
  if (p.includes('board short') || p.includes('swim short') || p.includes('gym short') || p.includes('running short') || p.includes('short')) return 'Shorts';
  if (p.includes('zip hoodie') || p.includes('pullover hoodie') || p.includes('hoodie')) return 'Hoodies';
  if (p.includes('crewneck') || p.includes('pullover') || p.includes('sweatshirt')) return 'Sweatshirts';
  if (p.includes('turtleneck') || p.includes('cardigan') || p.includes('knitwear') || p.includes('vest sweater') || p.includes('crop cardigan') || p.includes('sweater')) return 'Sweaters & Knitwear';
  if (p.includes('bomber') || p.includes('windbreaker') || p.includes('puffer') || p.includes('parka') || p.includes('trench') || p.includes('overcoat') || p.includes('anorak') || p.includes('denim jacket') || p.includes('leather jacket') || p.includes('winter jacket') || p.includes('jacket')) return 'Jackets & Blazers';
  if (p.includes('suit jacket') || p.includes('sports coat') || p.includes('blazer')) return 'Jackets & Blazers';
  if (p.includes('waistcoat') || p.includes('gilet') || p.includes('vest')) return 'Jackets & Blazers';
  if (p.includes('tracksuit') || p.includes('co ord') || p.includes('matching set') || p.includes('two piece') || p.includes('lounge set')) return 'Co-Ord Sets';
  if (p.includes('jumpsuit') || p.includes('romper') || p.includes('playsuit') || p.includes('overalls')) return 'Dresses';
  if (p.includes('ethnic') || p.includes('kurta') || p.includes('kurti') || p.includes('lehenga') || p.includes('sherwani') || p.includes('salwar') || p.includes('anarkali')) return 'Ethnic Wear';
  if (p.includes('legging') || p.includes('yoga')) return 'Leggings';
  if (p.includes('pencil skirt') || p.includes('flared skirt') || p.includes('a-line skirt') || p.includes('denim skirt') || p.includes('pleated skirt') || p.includes('wrap skirt') || p.includes('mini skirt') || p.includes('maxi skirt') || p.includes('midi skirt') || p.includes('skirt')) return 'Skirts';
  if (p.includes('bodycon dress') || p.includes('maxi dress') || p.includes('midi dress') || p.includes('mini dress') || p.includes('wrap dress') || p.includes('sundress') || p.includes('slip dress') || p.includes('floral dress') || p.includes('party dress') || p.includes('evening dress') || p.includes('shirt dress') || p.includes('dress')) return 'Dresses';
  if (p.includes('sports bra') || p.includes('workout top') || p.includes('gym set') || p.includes('gym legging') || p.includes('activewear')) return 'Activewear';
  return 'Other';
}

export const SEARCH_KEYWORDS: SearchKeyword[] = [
  ...generateMenKeywords(),
  ...generateWomenKeywords(),
  ...generateUnisexKeywords(),
];

// Backward-compat alias used by products.service.ts
export const BROAD_CATEGORY_KEYWORDS: string[] = [
  'men clothing', "men's clothing", 'men fashion',
  'women clothing', "women's clothing", 'women fashion',
  'men streetwear', 'women streetwear',
  'men casual wear', 'women casual wear',
  'men formal wear', 'women formal wear',
  'new collection men', 'new collection women',
  'summer collection men', 'summer collection women',
  'winter collection men', 'winter collection women',
  'men activewear', 'women activewear',
  'men sportswear', 'women sportswear',
  'men ethnic wear', 'women ethnic wear',
  'men premium clothing', 'women premium clothing',
  'men luxury fashion', 'women luxury fashion',
  'men trending outfit', 'women trending outfit',
  'men korean fashion', 'women korean fashion',
  'men oversized clothing', 'women oversized clothing',
  'men vintage clothing', 'women vintage clothing',
  'men workwear', 'women workwear',
  'men party outfit', 'women party outfit',
  'men summer outfit', 'women summer outfit',
  'men winter outfit', 'women winter outfit',
];

export const BROAD_CATEGORY_KEYWORDS_WITH_GENDER: SearchKeyword[] = [
  // Men broad
  { keyword: 'men clothing', gender: 'Men', category: 'Other' },
  { keyword: "men's clothing", gender: 'Men', category: 'Other' },
  { keyword: 'men fashion', gender: 'Men', category: 'Other' },
  { keyword: 'men streetwear', gender: 'Men', category: 'Other' },
  { keyword: 'men casual wear', gender: 'Men', category: 'Other' },
  { keyword: 'men formal wear', gender: 'Men', category: 'Other' },
  { keyword: 'new collection men', gender: 'Men', category: 'Other' },
  { keyword: 'summer collection men', gender: 'Men', category: 'Other' },
  { keyword: 'winter collection men', gender: 'Men', category: 'Other' },
  { keyword: 'men apparel', gender: 'Men', category: 'Other' },
  { keyword: 'men outfits', gender: 'Men', category: 'Other' },
  { keyword: 'men activewear', gender: 'Men', category: 'Other' },
  { keyword: 'men sportswear', gender: 'Men', category: 'Other' },
  { keyword: 'men ethnic wear', gender: 'Men', category: 'Ethnic Wear' },
  { keyword: 'men premium clothing', gender: 'Men', category: 'Other' },
  { keyword: 'men luxury fashion', gender: 'Men', category: 'Other' },
  { keyword: 'men trending outfit', gender: 'Men', category: 'Other' },
  { keyword: 'men korean fashion', gender: 'Men', category: 'Other' },
  { keyword: 'men oversized clothing', gender: 'Men', category: 'Other' },
  { keyword: 'men vintage clothing', gender: 'Men', category: 'Other' },
  { keyword: 'men summer outfit', gender: 'Men', category: 'Other' },
  { keyword: 'men winter outfit', gender: 'Men', category: 'Other' },
  { keyword: 'men party outfit', gender: 'Men', category: 'Other' },
  { keyword: 'men workwear', gender: 'Men', category: 'Other' },
  // Women broad
  { keyword: 'women clothing', gender: 'Women', category: 'Other' },
  { keyword: "women's clothing", gender: 'Women', category: 'Other' },
  { keyword: 'women fashion', gender: 'Women', category: 'Other' },
  { keyword: 'women streetwear', gender: 'Women', category: 'Other' },
  { keyword: 'women casual wear', gender: 'Women', category: 'Other' },
  { keyword: 'women formal wear', gender: 'Women', category: 'Other' },
  { keyword: 'new collection women', gender: 'Women', category: 'Other' },
  { keyword: 'summer collection women', gender: 'Women', category: 'Other' },
  { keyword: 'winter collection women', gender: 'Women', category: 'Other' },
  { keyword: 'women apparel', gender: 'Women', category: 'Other' },
  { keyword: 'women outfits', gender: 'Women', category: 'Other' },
  { keyword: 'women activewear', gender: 'Women', category: 'Other' },
  { keyword: 'women sportswear', gender: 'Women', category: 'Other' },
  { keyword: 'women ethnic wear', gender: 'Women', category: 'Ethnic Wear' },
  { keyword: 'women premium clothing', gender: 'Women', category: 'Other' },
  { keyword: 'women luxury fashion', gender: 'Women', category: 'Other' },
  { keyword: 'women trending outfit', gender: 'Women', category: 'Other' },
  { keyword: 'women korean fashion', gender: 'Women', category: 'Other' },
  { keyword: 'women oversized clothing', gender: 'Women', category: 'Other' },
  { keyword: 'women vintage clothing', gender: 'Women', category: 'Other' },
  { keyword: 'women summer outfit', gender: 'Women', category: 'Other' },
  { keyword: 'women winter outfit', gender: 'Women', category: 'Other' },
  { keyword: 'women party outfit', gender: 'Women', category: 'Other' },
  { keyword: 'women workwear', gender: 'Women', category: 'Other' },
];
