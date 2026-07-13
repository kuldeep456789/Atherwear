const USD_RATE = 83;

export const formatUSD = (price: number): string => {
  const usd = price / USD_RATE;
  return `$${usd.toFixed(2)}`;
};

export const formatUSDNumber = (price: number): number => {
  return Number((price / USD_RATE).toFixed(2));
};
