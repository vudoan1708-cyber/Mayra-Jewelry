'use client'

import { create } from 'zustand';
import type { JewelryVariation } from '../components/Jewelry/Variation';

export type CartItem = {
  itemName: string;
  imgUrl: string;
  variation: JewelryVariation;
  amount: number;
  count?: number; // Different to store count, which counts every item, this only counts per item name
  sum?: number;
};
type CartStore = {
  count: number;
  items: Array<CartItem>;
  addItem: (item: CartItem) => void;
  setTo: (wholeStore: { count: CartStore['count'], items: CartStore['items'] }) => void;
  removeItem: (item: CartItem) => void;
};
export const useCartCount = create<CartStore>((set) => ({
  count: 0,
  items: [],
  addItem: (item) => set((state) => ({
    count: state.count + 1,
    items: [ ...state.items, item ],
  })),
  setTo: (wholeStore) => set(() => ({
    count: wholeStore.count ?? 0,
    items: wholeStore.items ?? [],
  })),
  removeItem: (item) => set((state) => ({
    count: state.count - 1,
    items: state.items.filter((_, idx) => {
      const foundIdx = state.items.findIndex((stateItem) => stateItem.itemName === item.itemName && stateItem.variation.key === item.variation.key);
      return foundIdx !== idx;
    }),
  })),
}));
