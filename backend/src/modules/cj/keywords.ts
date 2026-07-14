// Keyword combinations for CJ Dropshipping product fetching.
// Style × Product combinations generate hundreds of search terms
// to build a large, diverse clothing catalog.

const MEN_STYLES = [
  'oversized', 'regular fit', 'slim fit', 'relaxed fit', 'baggy',
  'streetwear', 'minimal', 'casual', 'formal', 'premium', 'luxury',
  'vintage', 'washed', 'graphic', 'printed', 'solid', 'striped',
  'checked', 'plaid', 'embroidered', 'drop shoulder',
];

const MEN_FABRICS = [
  'cotton', 'linen', 'denim', 'fleece', 'knit', 'wool',
  'polyester', 'rayon', 'viscose',
];

const MEN_PRODUCTS = [
  't shirt', 'shirt', 'jeans', 'cargo pants', 'hoodie', 'jacket',
  'blazer', 'joggers', 'trousers', 'shorts', 'sweater', 'sweatshirt',
  'knitwear', 'co ord set', 'ethnic wear',
];

const WOMEN_PRODUCTS = [
  'top', 'crop top', 'tank top', 't shirt', 'shirt', 'shirt dress',
  'jeans', 'mom jeans', 'flare jeans', 'wide leg jeans',
  'pants', 'trousers', 'leggings', 'palazzo', 'skirt', 'mini skirt',
  'maxi skirt', 'dress', 'bodycon dress', 'maxi dress', 'midi dress',
  'mini dress', 'co ord set', 'hoodie', 'sweatshirt', 'sweater',
  'cardigan', 'jacket', 'blazer', 'denim jacket', 'winter jacket',
  'ethnic wear',
];

const TRENDING = [
  'oversized', 'streetwear', 'old money', 'minimal', 'luxury',
  'premium', 'vintage', 'retro', 'y2k', 'korean fashion',
  'japanese fashion', 'new arrival', 'best seller',
];

export interface SearchKeyword {
  keyword: string;
  gender: 'Men' | 'Women' | 'Unisex';
  category: string;
}

function generateMenKeywords(): SearchKeyword[] {
  const result: SearchKeyword[] = [];
  for (const product of MEN_PRODUCTS) {
    result.push({ keyword: `men ${product}`, gender: 'Men', category: mapProductToCategory(product) });
    result.push({ keyword: `men's ${product}`, gender: 'Men', category: mapProductToCategory(product) });
    for (const style of MEN_STYLES) {
      result.push({ keyword: `men ${style} ${product}`, gender: 'Men', category: mapProductToCategory(product) });
    }
    for (const style of TRENDING.slice(0, 5)) {
      result.push({ keyword: `${style} men ${product}`, gender: 'Men', category: mapProductToCategory(product) });
    }
  }
  return result;
}

function generateWomenKeywords(): SearchKeyword[] {
  const result: SearchKeyword[] = [];
  for (const product of WOMEN_PRODUCTS) {
    result.push({ keyword: `women ${product}`, gender: 'Women', category: mapProductToCategory(product) });
    result.push({ keyword: `women's ${product}`, gender: 'Women', category: mapProductToCategory(product) });
    for (const style of TRENDING.slice(0, 5)) {
      result.push({ keyword: `${style} women ${product}`, gender: 'Women', category: mapProductToCategory(product) });
    }
  }
  return result;
}

function mapProductToCategory(product: string): string {
  const p = product.toLowerCase();
  if (p.includes('t shirt') || p.includes('t-shirt') || p.includes('top') || p.includes('tank')) return 'T-Shirts & Tops';
  if (p.includes('shirt')) return 'Shirts';
  if (p.includes('jeans') || p.includes('flare') || p.includes('wide')) return 'Jeans';
  if (p.includes('cargo')) return 'Cargo Pants';
  if (p.includes('trouser') || p.includes('pants') || p.includes('pant') || p.includes('chino')) return 'Trousers & Pants';
  if (p.includes('jogger')) return 'Joggers';
  if (p.includes('short')) return 'Shorts';
  if (p.includes('hoodie')) return 'Hoodies';
  if (p.includes('sweatshirt')) return 'Sweatshirts';
  if (p.includes('sweater') || p.includes('knitwear') || p.includes('cardigan')) return 'Sweaters & Knitwear';
  if (p.includes('jacket') || p.includes('blazer') || p.includes('winter')) return 'Jackets & Blazers';
  if (p.includes('co ord') || p.includes('coord') || p.includes('set')) return 'Co-Ord Sets';
  if (p.includes('ethnic') || p.includes('kurta') || p.includes('lehenga')) return 'Ethnic Wear';
  if (p.includes('legging')) return 'Leggings';
  if (p.includes('palazzo')) return 'Palazzo';
  if (p.includes('skirt')) return 'Skirts';
  if (p.includes('dress')) return 'Dresses';
  if (p.includes('denim jacket')) return 'Denim Jackets';
  return 'Other';
}

export const SEARCH_KEYWORDS: SearchKeyword[] = [
  ...generateMenKeywords(),
  ...generateWomenKeywords(),
];

export const BROAD_CATEGORY_KEYWORDS = [
  'men clothing', "men's clothing", 'men fashion',
  'women clothing', "women's clothing", 'women fashion',
  'men streetwear', 'women streetwear',
  'men casual wear', 'women casual wear',
  'men formal wear', 'women formal wear',
  'new collection men', 'new collection women',
  'summer collection men', 'summer collection women',
  'winter collection men', 'winter collection women',
];
