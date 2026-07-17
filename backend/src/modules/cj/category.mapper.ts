export const MEN_ALLOWED = [
  "shirts",
  "shirt",
  "t-shirts",
  "t-shirt",
  "oversized",
  "polo",
  "jeans",
  "cargo",
  "shorts",
  "jackets",
  "jacket",
  "hoodies",
  "hoodie",
  "sweatshirts",
  "sweatshirt",
  "trousers",
  "trouser",
  "pants",
  "pant",
  "joggers",
  "jogger",
  "blazer",
  "sweater"
];

export const WOMEN_ALLOWED = [
  "dresses",
  "dress",
  "tops",
  "top",
  "shirts",
  "shirt",
  "jeans",
  "jackets",
  "jacket",
  // "co-ords",
  "sweatshirts",
  "sweatshirt",
  "hoodies",
  "hoodie",
  "blouses",
  "blouse",
  "shorts",
  "skirts",
  "skirt",
  "trousers",
  "trouser",
  "pants",
  "pant",
  "leggings",
  "legging",
  "cardigan",
  "cardigans",
  "wholesale-tops-sets"
];

export const BLOCKED = [
  "pet",
  "bird",
  "dog",
  "cat",
  "kitchen",
  "storage",
  "watch",
  "furniture",
  "chair",
  "table",
  "sofa",
  "bed",
  "car",
  "seat belt",
  "garden",
  "beauty",
  "luggage",
  "jewelry",
  "sandal",
  "slipper",
  "footwear",
  "shoe",
  "sneaker",
  "wrench",
  "socket",
  "tool",
  "hardware",
  "drill",
  "screwdriver",
  "hammer",
  "pliers",
  "electronic",
  "computer",
  "phone case",
  "screen protector",
  "toy",
  "puzzle",
  "model",
  "gaming",
  "headphone",
  "earphone",
  "speaker",
  "cable",
  "charger",
  "power bank",
  "automotive",
  "motorcycle",
  "bike",
  "helmet",
  "sporting goods",
  "exercise",
  "fitness",
  "yoga",
  "camping",
  "decoration",
  "christmas",
  "halloween",
  "sticker",
  "keychain",
  "patch",
  "pin",
  "badge"
];

// Category-level blocks — also checked in isCategoryAllowed
export const CATEGORY_BLOCKED = [
  "shoes",
  "footwear",
  "sneakers",
  "sandals",
  "electronics",
  "computer",
  "phone",
  "toy",
  "sporting goods",
  "automotive",
  "home & garden",
  "home improvement",
  "tools",
  "hardware",
  "industrial",
  "office",
  "school supplies",
  "pet supplies",
  "beauty",
  "health",
  "personal care",
  "baby",
  "maternity",
  "food",
  "drink",
  "grocery",
  "music",
  "instrument",
  "movie",
  "dvd",
  "book",
  "stationery",
  "craft",
  "sewing",
  "fabric",
  "party supplies",
  "wedding",
  "event",
  "lighting",
  "lamp",
  "electrical",
  "plumbing",
  "bathroom",
  "kitchen & dining",
  "bedding",
  "bath",
  "curtain",
  "pillow",
  "mattress",
  "towel",
  "rug",
  "mat",
  "outdoor living",
  "garden tools",
  "plant",
  "flower",
  "seed",
  "soil",
  "fertilizer",
  "pest control",
  "slippers",
  "short-sleeves",
  "couple&parent -child jackets",
  "ladies short sleeve"
];

const normalizeCategoryText = (value: string) =>
  value.toLowerCase().replace(/[\s_'&-]+/g, '');

export function isCategoryAllowed(categoryName: string): boolean {
  if (!categoryName) return false;

  const name = normalizeCategoryText(categoryName);

  if (BLOCKED.some(word => name.includes(normalizeCategoryText(word)))) {
    return false;
  }

  if (CATEGORY_BLOCKED.some(word => name.includes(normalizeCategoryText(word)))) {
    return false;
  }

  // Only allow clothing high-level categories
  if (name.includes("mensclothing") || name.includes("womensclothing") || name.includes("apparel")) {
    return true;
  }

  return (
    MEN_ALLOWED.some(cat => name.includes(normalizeCategoryText(cat))) ||
    WOMEN_ALLOWED.some(cat => name.includes(normalizeCategoryText(cat)))
  );
}
export function isHardBlocked(product: any): boolean {
  const name = String(product?.productNameEn ?? product?.productName ?? product?.nameEn ?? product?.name ?? '').toLowerCase();
  const categoryName = String(product?.categoryName ?? product?.categoryThirdName ?? product?.categorySecondName ?? product?.categoryFirstName ?? '').toLowerCase();
  const combined = `${name} ${categoryName}`;

  const hardBlockWords = [
    'shoe', 'shoes', 'sneaker', 'sneakers', 'sandal', 'sandals', 'slipper', 'slippers', 'heel', 'heels', 'boot', 'boots', 'footwear',
    'electronic', 'electronics', 'phone', 'phones', 'laptop', 'laptops', 'tablet', 'tablets', 'computer', 'computers', 'cable', 'cables', 'charger', 'chargers',
    'power bank', 'power banks', 'headphone', 'headphones', 'earphone', 'earphones', 'speaker', 'speakers', 'camera', 'cameras',
    'pet', 'pets', 'dog', 'dogs', 'cat', 'cats', 'bird', 'birds', 'fish', 'fishes',
    'furniture', 'sofa', 'sofas', 'chair', 'chairs', 'table', 'tables', 'bed', 'beds', 'mattress', 'mattresses',
    'kitchen', 'cookware', 'utensil', 'utensils', 'appliance', 'appliances',
    'toy', 'toys', 'puzzle', 'puzzles', 'gaming', 'video game', 'video games',
    'car', 'cars', 'motorcycle', 'motorcycles', 'automotive', 'tire', 'tires',
    'tool', 'tools', 'drill', 'drills', 'hammer', 'hammers', 'wrench', 'wrenches', 'hardware',
    'watch', 'watches', 'jewelry', 'ring', 'rings', 'necklace', 'necklaces', 'bracelet', 'bracelets',
    'beauty', 'skincare', 'makeup', 'cosmetic', 'cosmetics', 'perfume', 'perfumes',
    'medicine', 'medicines', 'supplement', 'supplements', 'health',
    'food', 'foods', 'drink', 'drinks', 'grocery', 'groceries',
    'book', 'books', 'stationery', 'school supply', 'school supplies',
    'plant', 'plants', 'seed', 'seeds', 'soil', 'garden',
    'luggage', 'suitcase', 'suitcases', 'backpack', 'backpacks', 'bag', 'bags',
    'pillow', 'pillows', 'curtain', 'curtains', 'towel', 'towels', 'rug', 'rugs', 'mat', 'mats', 'bedding',
  ];

  return hardBlockWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(combined);
  });
}

export function isProductAllowed(product: any): { allowed: boolean; gender: string; subcategoryName: string; collectionType: string } {
  const name = String(product?.productNameEn ?? product?.productName ?? product?.nameEn ?? product?.name ?? '').toLowerCase();
  const categoryName = String(product?.categoryName ?? product?.categoryThirdName ?? product?.categorySecondName ?? product?.categoryFirstName ?? '').toLowerCase();
  const description = String(product?.description ?? '').toLowerCase();
  const searchText = normalizeCategoryText(`${name} ${categoryName} ${description}`);

  // 1. Check for blocked keywords
  if (BLOCKED.some(word => searchText.includes(normalizeCategoryText(word)) || normalizeCategoryText(categoryName).includes(normalizeCategoryText(word)))) {
    return { allowed: false, gender: '', subcategoryName: '', collectionType: '' };
  }

  if (CATEGORY_BLOCKED.some(word => searchText.includes(normalizeCategoryText(word)) || normalizeCategoryText(categoryName).includes(normalizeCategoryText(word)))) {
    return { allowed: false, gender: '', subcategoryName: '', collectionType: '' };
  }

  const matchesAny = (allowedList: string[]) => {
    return allowedList.some(cat => searchText.includes(normalizeCategoryText(cat)) || normalizeCategoryText(categoryName).includes(normalizeCategoryText(cat)));
  };

  // Check explicit gender signals in name/category
  const hasWomenSignal = /\b(women|woman|womens|ladies|lady|girl|girls|female)\b/i.test(`${name} ${categoryName}`);
  const hasMenSignal = /\b(men|man|mens|male|gents|boys)\b/i.test(`${name} ${categoryName}`) && !hasWomenSignal;

  let collectionType = '';
  let gender = 'Unisex';
  let subcategoryName = 'Other';

  // PRIORITY: Women signal comes first to avoid "women's shirts" being classified as Men
  if (hasWomenSignal || (!hasMenSignal && matchesAny(WOMEN_ALLOWED) && !searchText.includes('men') && (searchText.includes('women') || searchText.includes('female') || searchText.includes('lady')))) {
    collectionType = 'Women';
    gender = 'Women';
    if (searchText.includes('ethnic')) subcategoryName = 'Ethnic Wear';
    else if (searchText.includes('coord') || searchText.includes('co-ord') || searchText.includes('set')) subcategoryName = 'Co-Ord Sets';
    else if (searchText.includes('activewear') || searchText.includes('yoga') || searchText.includes('gym')) subcategoryName = 'Activewear';
    else if (searchText.includes('dress')) subcategoryName = 'Dresses';
    else if (searchText.includes('skirt')) subcategoryName = 'Skirts';
    else if (searchText.includes('jacket') || searchText.includes('coat') || searchText.includes('blazer')) subcategoryName = 'Jackets';
    else if (searchText.includes('hoodie')) subcategoryName = 'Hoodies';
    else if (searchText.includes('sweatshirt') || searchText.includes('sweater') || searchText.includes('cardigan')) subcategoryName = 'Sweatshirts';
    else if (searchText.includes('jean') || searchText.includes('denim')) subcategoryName = 'Jeans';
    else if (searchText.includes('short')) subcategoryName = 'Shorts';
    else if (searchText.includes('pant') || searchText.includes('trouser') || searchText.includes('legging') || searchText.includes('cargo') || searchText.includes('jogger')) subcategoryName = 'Pants';
    else if (searchText.includes('tshirt') || searchText.includes('t-shirt') || searchText.includes('tee')) subcategoryName = 'T-Shirts';
    else if (searchText.includes('shirt') || searchText.includes('blouse')) subcategoryName = 'Shirts';
    else if (searchText.includes('top')) subcategoryName = 'Tops';
    else subcategoryName = 'Tops'; // fallback for women
  } else if (hasMenSignal || (matchesAny(MEN_ALLOWED) && !hasWomenSignal && (searchText.includes('men') || searchText.includes('male') || searchText.includes('man')))) {
    collectionType = 'Men';
    gender = 'Men';
    if (searchText.includes('ethnic')) subcategoryName = 'Ethnic Wear';
    else if (searchText.includes('coord') || searchText.includes('co-ord') || searchText.includes('set')) subcategoryName = 'Co-Ord Sets';
    else if (searchText.includes('jacket') || searchText.includes('coat') || searchText.includes('blazer')) subcategoryName = 'Jackets';
    else if (searchText.includes('hoodie')) subcategoryName = 'Hoodies';
    else if (searchText.includes('sweatshirt')) subcategoryName = 'Sweatshirts';
    else if (searchText.includes('sweater') || searchText.includes('cardigan') || searchText.includes('knit')) subcategoryName = 'Sweaters';
    else if (searchText.includes('cargo')) subcategoryName = 'Cargo Pants';
    else if (searchText.includes('jean') || searchText.includes('denim')) subcategoryName = 'Jeans';
    else if (searchText.includes('jogger') || searchText.includes('sweatpant')) subcategoryName = 'Joggers';
    else if (searchText.includes('short')) subcategoryName = 'Shorts';
    else if (searchText.includes('polo')) subcategoryName = 'Polo Shirts';
    else if (searchText.includes('tshirt') || searchText.includes('t-shirt') || searchText.includes('tee')) subcategoryName = 'T-Shirts';
    else if (searchText.includes('shirt')) subcategoryName = 'Shirts';
    else subcategoryName = 'Shirts'; // fallback for men
  } else {
    // If it doesn't match our whitelists with explicit gender signal, reject it
    return { allowed: false, gender: '', subcategoryName: '', collectionType: '' };
  }

  return { allowed: true, gender, subcategoryName, collectionType };
}


















































