'use client'

import { create } from 'zustand';
import type { JewelryVariation } from '../components/Jewelry/Variation';

type CartItem = {
  itemName: string;
  imgUrl: string;
  variation: JewelryVariation;
  amount: number;
};
type CartStore = {
  count: number;
  items: Array<CartItem>;
  addItem: (item: CartItem) => void;
  setTo: (wholeStore: { count: CartStore['count'], items: CartStore['items'] }) => void;
  removeItem: (idx: number) => void;
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
  removeItem: (idx) => set((state) => ({
    count: state.count - 1,
    items: state.items.filter((_, i) => i !== idx),
  })),
}));
