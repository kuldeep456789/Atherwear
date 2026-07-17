import { CLOTHING_CATEGORIES } from './collections';

export const BLOCKED = [
  "pet", "bird", "dog", "cat", "kitchen", "storage", "watch", "furniture", 
  "chair", "table", "sofa", "bed", "car", "seat belt", "garden", "beauty", 
  "luggage", "jewelry", "sandal", "slipper", "footwear", "shoe", "sneaker", 
  "wrench", "socket", "tool", "hardware", "drill", "screwdriver", "hammer", 
  "pliers", "electronic", "computer", "phone case", "screen protector", 
  "toy", "puzzle", "model", "gaming", "headphone", "earphone", "speaker"
];

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

export function getCategoryInfoById(categoryId: string): { gender: string; subcategoryName: string; collectionType: string } | null {
  if (!categoryId) return null;
  
  for (const cat of CLOTHING_CATEGORIES.men) {
    if (cat.categoryId === categoryId) {
      return { gender: 'Men', subcategoryName: cat.name, collectionType: 'Men' };
    }
  }
  for (const cat of CLOTHING_CATEGORIES.women) {
    if (cat.categoryId === categoryId) {
      return { gender: 'Women', subcategoryName: cat.name, collectionType: 'Women' };
    }
  }
  return null;
}
