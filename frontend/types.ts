export type Prices = {
  id: number;
  variation: 'Silver' | 'Gold' | 'White Gold';
  amount: number;
  currency: string;
  discount: number;
};
export type Media = {
  url: string;
  fileName: string;
};
export type JewelryItemInfo = {
  directoryId: string;
  itemName: string;
  description: string;
  purchases: number;
  featureCollection: string;
  bestSeller: boolean;
  type: 'ring' | 'bracelet';
  views: number;
  currency: string;
  inStock: boolean;
  giftable: boolean;
  prices: Prices[];
  media: Media[];
};
export type VeriyingOrderPayload = {
  buyerId: string;
  buyerName: string;
  digits: string;
  jewelryItems: Array<Partial<JewelryItemInfo>>;
};
