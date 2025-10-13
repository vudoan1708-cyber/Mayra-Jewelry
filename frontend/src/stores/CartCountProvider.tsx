'use client'

import { create } from 'zustand';
import type { JewelryVariation } from '../components/Jewelry/Variation';

export type CartItem = {
  id: string;
  itemName: string;
  imgUrl: string;
  variation: JewelryVariation;
  amount: number;
  count?: number; // Different to store count, which counts every item, this only counts per item name
  sum?: number;
};
type CartStore = {
  items: Array<CartItem>;
  addItem: (item: CartItem) => void;
  setTo: (wholeStore: { items: CartStore['items'] }) => void;
  removeItem: (item: CartItem) => void;
  removeAllByItemName: (item: CartItem) => void;
};
export const useCartCount = create<CartStore>((set) => ({
  count: 0,
  items: [],
  addItem: (item) => set((state) => ({
    items: [ ...state.items, item ],
  })),
  setTo: (wholeStore) => set(() => ({
    items: wholeStore.items ?? [],
  })),
  removeItem: (item) => set((state) => ({
    items: state.items.filter((_, idx) => {
      const foundIdx = state.items.findIndex((stateItem) => stateItem.itemName === item.itemName && stateItem.variation.key === item.variation.key);
      return foundIdx !== idx;
    }),
  })),
  removeAllByItemName: (item) => set((state) => ({
    items: state.items.filter((stateItem) => {
      return stateItem.itemName !== item.itemName || stateItem.variation.key !== item.variation.key;
    }),
  }))
}));
