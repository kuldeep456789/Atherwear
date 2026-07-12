const COLOR_MAP: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  navyblue: '#1e3a5f',
  charcoalgrey: '#4a4a4a',
  olivegreen: '#556b2f',
  darkbrown: '#5c4033',
  beige: '#d4c4a8',
  pink: '#f8b4c4',
  lavender: '#b8a9c9',
  peach: '#ffcba4',
  skyblue: '#87ceeb',
  cream: '#fffdd0',
  purple: '#7b4f9e',
  rosegold: '#b76e79',
  red: '#c0392b',
  green: '#2d6a4f',
  grey: '#9e9e9e',
  gray: '#9e9e9e',
  yellow: '#f4d03f',
  orange: '#e67e22',
  blue: '#2980b9',
  maroon: '#800000',
};

export const getColorHex = (color: string): string => {
  const key = color.toLowerCase().replace(/\s+/g, '');
  return COLOR_MAP[key] || '#cccccc';
};
