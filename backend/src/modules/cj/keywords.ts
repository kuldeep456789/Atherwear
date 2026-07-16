/**
 * CRAWL_CATALOG
 *
 * A flat list of category-level search keywords used by the cron job to sync
 * products from CJ Dropshipping into the Redis warehouse.
 *
 * Design: instead of cross-multiplying styles × products × fabrics (thousands of
 * API calls), we use one targeted keyword per category per gender.
 * ~26 keywords × max 5 pages each = ~130 API calls per sync run.
 */

export interface CrawlEntry {
  keyword: string;
  gender: 'Men' | 'Women';
  category: string;
}

export const CRAWL_CATALOG: CrawlEntry[] = [
  // ─── MEN ──────────────────────────────────────────────────────────────────
  { keyword: 'men t-shirt',       gender: 'Men',   category: 'T-Shirts' },
  { keyword: 'men shirt',         gender: 'Men',   category: 'Shirts' },
  { keyword: 'men polo shirt',    gender: 'Men',   category: 'Shirts' },
  { keyword: 'men jeans',         gender: 'Men',   category: 'Jeans' },
  { keyword: 'men cargo pants',   gender: 'Men',   category: 'Cargo Pants' },
  { keyword: 'men shorts',        gender: 'Men',   category: 'Shorts' },
  { keyword: 'men hoodie',        gender: 'Men',   category: 'Hoodies' },
  { keyword: 'men sweatshirt',    gender: 'Men',   category: 'Sweatshirts' },
  { keyword: 'men jacket',        gender: 'Men',   category: 'Jackets' },
  { keyword: 'men trousers',      gender: 'Men',   category: 'Trousers & Pants' },
  { keyword: 'men joggers',       gender: 'Men',   category: 'Joggers' },
  { keyword: 'men co-ord set',    gender: 'Men',   category: 'Co-Ord Sets' },
  { keyword: 'men ethnic wear',   gender: 'Men',   category: 'Ethnic Wear' },
  { keyword: 'men activewear',    gender: 'Men',   category: 'Activewear' },

  // ─── WOMEN ────────────────────────────────────────────────────────────────
  { keyword: 'women top',         gender: 'Women', category: 'Tops' },
  { keyword: 'women t-shirt',     gender: 'Women', category: 'T-Shirts' },
  { keyword: 'women dress',       gender: 'Women', category: 'Dresses' },
  { keyword: 'women jeans',       gender: 'Women', category: 'Jeans' },
  { keyword: 'women skirt',       gender: 'Women', category: 'Skirts' },
  { keyword: 'women pants',       gender: 'Women', category: 'Trousers & Pants' },
  { keyword: 'women shorts',      gender: 'Women', category: 'Shorts' },
  { keyword: 'women hoodie',      gender: 'Women', category: 'Hoodies' },
  { keyword: 'women sweatshirt',  gender: 'Women', category: 'Sweatshirts' },
  { keyword: 'women jacket',      gender: 'Women', category: 'Jackets' },
  { keyword: 'women co-ord set',  gender: 'Women', category: 'Co-Ord Sets' },
  { keyword: 'women ethnic wear', gender: 'Women', category: 'Ethnic Wear' },
  { keyword: 'women activewear',  gender: 'Women', category: 'Activewear' },
];

/**
 * Normalise a category name into a Redis key segment.
 * e.g. "Trousers & Pants" → "trousers-pants"
 */
export function categoryToKey(cat: string): string {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Map a product title / keyword to one of our canonical category names.
 * Used in products.service.ts for search-query keyword matching.
 */
export function mapProductToCategory(product: string): string {
  const p = product.toLowerCase();
  if (p.includes('t-shirt') || p.includes('t shirt') || p.includes('tee') || p.includes('tank') || p.includes('sleeveless')) return 'T-Shirts';
  if (p.includes('polo')) return 'Shirts';
  if (p.includes('henley') || p.includes('oxford') || p.includes('flannel') || p.includes('linen shirt') || p.includes('denim shirt') || p.includes('shirt')) return 'Shirts';
  if (p.includes('jean')) return 'Jeans';
  if (p.includes('cargo short')) return 'Shorts';
  if (p.includes('cargo')) return 'Cargo Pants';
  if (p.includes('chino') || p.includes('khaki') || p.includes('trouser') || p.includes('palazzo') || p.includes('culottes') || p.includes('wide leg pant') || p.includes('pant')) return 'Trousers & Pants';
  if (p.includes('jogger') || p.includes('sweatpant') || p.includes('track pant')) return 'Joggers';
  if (p.includes('short')) return 'Shorts';
  if (p.includes('zip hoodie') || p.includes('pullover hoodie') || p.includes('hoodie')) return 'Hoodies';
  if (p.includes('crewneck') || p.includes('pullover') || p.includes('sweatshirt')) return 'Sweatshirts';
  if (p.includes('turtleneck') || p.includes('cardigan') || p.includes('knitwear') || p.includes('sweater')) return 'Sweaters & Knitwear';
  if (p.includes('jacket') || p.includes('blazer') || p.includes('windbreaker') || p.includes('puffer') || p.includes('bomber') || p.includes('parka') || p.includes('trench') || p.includes('overcoat')) return 'Jackets';
  if (p.includes('tracksuit') || p.includes('co-ord') || p.includes('co ord') || p.includes('matching set') || p.includes('two piece') || p.includes('lounge set')) return 'Co-Ord Sets';
  if (p.includes('dress') || p.includes('romper') || p.includes('jumpsuit') || p.includes('playsuit')) return 'Dresses';
  if (p.includes('skirt')) return 'Skirts';
  if (p.includes('ethnic') || p.includes('kurta') || p.includes('kurti') || p.includes('lehenga') || p.includes('sherwani') || p.includes('salwar') || p.includes('anarkali')) return 'Ethnic Wear';
  if (p.includes('legging') || p.includes('yoga')) return 'Leggings';
  if (p.includes('bodysuit') || p.includes('tube top') || p.includes('cami') || p.includes('halter') || p.includes('corset') || p.includes('bustier') || p.includes('peplum') || p.includes('smock') || p.includes('crop top') || p.includes('blouse') || p.includes('top')) return 'Tops';
  if (p.includes('sports bra') || p.includes('workout') || p.includes('gym') || p.includes('activewear')) return 'Activewear';
  return 'Other';
}

/**
 * Keywords kept for the search bar matching in products.service.ts.
 * These are the canonical terms a user might type.
 */
export const SEARCH_KEYWORDS = CRAWL_CATALOG.map(entry => ({
  keyword: entry.keyword,
  gender: entry.gender,
  category: entry.category,
}));

/**
 * Backwards-compat exports used elsewhere in the codebase.
 */
export const BROAD_CATEGORY_KEYWORDS: string[] = CRAWL_CATALOG.map(e => e.keyword);
export const BROAD_CATEGORY_KEYWORDS_WITH_GENDER = CRAWL_CATALOG.map(e => ({
  keyword: e.keyword,
  gender: e.gender,
  category: e.category,
}));
