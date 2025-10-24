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
  buyerEmail: string;
  buyerName: string;
  digits: string;
  jewelryItems: Array<Partial<JewelryItemInfo>>;
  totalAmount: string;
};

type OrderJewelryItems = {
  jewelryId: string;
  orderId: string;
  quantity: number;
};

export type Order = {
  id: string;
  jewelryItems: Array<JewelryItemInfo>;
  orderJewelryItems: Array<OrderJewelryItems>;
  status: 'pending-verification' | 'failed-verification' | 'verified' | 'shipped';
  pendingAt: string;
  failedVerificationAt?: string;
  verifiedAt?: string;
  shipAt?: string;
  buyerId: string;
};

export type Tier = 'silver' | 'gold' | 'platinum' | 'diamond';
export type Buyer = {
  id: string;
  wishlist: Array<JewelryItemInfo>;
  orderHistory: Array<Order>;
  tier: Tier;
  mayraPoint: number;
};
