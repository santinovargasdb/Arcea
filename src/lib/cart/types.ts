export type CartLine = {
  key: string; // `${slug}__${size}__${color}`
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number; // centavos
  quantity: number;
};

export const cartKey = (slug: string, size: string, color: string) =>
  `${slug}__${size}__${color}`;
