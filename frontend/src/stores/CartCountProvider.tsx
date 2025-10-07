'use client'

import { create } from 'zustand';

type CartStore = {
  carts: number;
  increment: () => void;
  setTo: (value: number) => void;
};
export const useCartCount = create<CartStore>((set) => ({
  carts: 0,
  increment: () => set((state) => ({ carts: state.carts + 1 })),
  setTo: (value: number) => set(() => ({ carts: value  })),
}));
