export const MEN_ALLOWED = [
  "shirts",
  "t-shirts",
  "oversized",
  "polo",
  "jeans",
  "cargo",
  "shorts",
  "jackets",
  "hoodies",
];

export const WOMEN_ALLOWED = [
  "dresses",
  "tops",
  "shirts",
  "jeans",
  "jackets",
  "co-ords",
];

export const ACCESSORIES_ALLOWED = [
  "caps",
  "baseball caps",
  "women hats & caps",
  "men hats & caps",
  "wallets",
  "card holders",
  "sunglasses",
  "belts",
  "belts & cummerbunds",
  "crossbody bags",
  "shoulder bags",
  "handbags",
  "backpacks",
  "travel bags"
];

export const BLOCKED = [
  "pet",
  "bird",
  "dog",
  "cat",
  "kitchen",
  "storage",
  "watch accessories",
  "watch",
  "home",
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
  "jewelry"
];

const normalizeCategoryText = (value: string) =>
  value.toLowerCase().replace(/[\s_-]+/g, '');

export function isCategoryAllowed(categoryName: string): boolean {
  if (!categoryName) return false;
  
  const name = normalizeCategoryText(categoryName);
  
  if (BLOCKED.some(word => name.includes(normalizeCategoryText(word)))) {
    return false;
  }

  // Explicitly allow high-level categories that might contain our whitelist items
  if (name.includes("mensclothing") || name.includes("womensclothing") || name.includes("fashionaccessories") || name.includes("apparel") || name.includes("bags") || name.includes("shoesbags")) {
    return true;
  }

  return (
    MEN_ALLOWED.some(cat => name.includes(normalizeCategoryText(cat))) ||
    WOMEN_ALLOWED.some(cat => name.includes(normalizeCategoryText(cat))) ||
    ACCESSORIES_ALLOWED.some(cat => name.includes(normalizeCategoryText(cat)))
  );
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

  // 2. We only accept if it matches our strict clothing/accessories whitelist
  const matchesAny = (allowedList: string[]) => {
    return allowedList.some(cat => searchText.includes(normalizeCategoryText(cat)) || normalizeCategoryText(categoryName).includes(normalizeCategoryText(cat)));
  };

  let collectionType = '';
  let gender = 'Unisex';
  let subcategoryName = 'Other';

  if (matchesAny(MEN_ALLOWED) || (searchText.includes('men') && !searchText.includes('women'))) {
    collectionType = 'Men';
    gender = 'Men';
    if (searchText.includes('shirt') || searchText.includes('tshirt') || searchText.includes('tee')) subcategoryName = 'T-Shirts & Shirts';
    else if (searchText.includes('jacket') || searchText.includes('hoodie')) subcategoryName = 'Jackets & Hoodies';
    else if (searchText.includes('jean') || searchText.includes('cargo') || searchText.includes('pant')) subcategoryName = 'Bottoms';
    else if (searchText.includes('short')) subcategoryName = 'Shorts';
  } else if (matchesAny(WOMEN_ALLOWED) || searchText.includes('women') || searchText.includes('lady') || searchText.includes('girl')) {
    collectionType = 'Women';
    gender = 'Women';
    if (searchText.includes('dress') || searchText.includes('skirt')) subcategoryName = 'Dresses & Skirts';
    else if (searchText.includes('top') || searchText.includes('shirt') || searchText.includes('coord')) subcategoryName = 'Tops & Shirts';
    else if (searchText.includes('jacket') || searchText.includes('suit')) subcategoryName = 'Jackets & Suits';
    else if (searchText.includes('jean') || searchText.includes('pant')) subcategoryName = 'Bottoms';
  } else if (matchesAny(ACCESSORIES_ALLOWED) || searchText.includes('accessory') || searchText.includes('bag') || searchText.includes('wallet') || searchText.includes('belt') || searchText.includes('sunglass') || searchText.includes('cap')) {
    collectionType = 'Accessories';
    if (searchText.includes('bag') || searchText.includes('backpack') || searchText.includes('handbag')) subcategoryName = 'Bags';
    else if (searchText.includes('wallet')) subcategoryName = 'Wallets';
    else if (searchText.includes('sunglass')) subcategoryName = 'Sunglasses';
    else if (searchText.includes('belt')) subcategoryName = 'Belts';
    else if (searchText.includes('cap') || searchText.includes('hat') || searchText.includes('beanie')) subcategoryName = 'Headwear';
    else subcategoryName = 'Accessories';
  } else {
    // If it doesn't match our whitelists, reject it
    return { allowed: false, gender: '', subcategoryName: '', collectionType: '' };
  }

  return { allowed: true, gender, subcategoryName, collectionType };
}
