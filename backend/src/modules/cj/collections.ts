
export const MEN_COLLECTIONS = [
  't-shirts',
  'shirts',
  'polo',
  'jeans',
  'cargo',
  'hoodies'
];
export const WOMEN_COLLECTIONS = [
  'tops',
  'jeans',
  'dresses',
  'hoodies'
];
export const isAllowedMenCollection = (categoryName: string): boolean => {
  const name = categoryName.toLowerCase().replace(/[\s_'&-]+/g, '');
  return MEN_COLLECTIONS.some(allowed => name.includes(allowed.replace(/-/g, '')));
};
export const isAllowedWomenCollection = (categoryName: string): boolean => {
  const name = categoryName.toLowerCase().replace(/[\s_'&-]+/g, '');
  return WOMEN_COLLECTIONS.some(allowed => name.includes(allowed.replace(/-/g, '')));
};
