'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';

export type Tab = {
  id: string | number,
  label: string,
  active: boolean,
  disabled?: boolean,
};

export default function Tabs({ items, onSelect }: { items: Array<Tab>, onSelect: (item: Tab) => void }) {
  const [tabItems, setItems] = useState<Array<Tab>>(items);
  const tabClicked = (tab: Tab) => {
    const mapped = items.map((item) => ({
      ...item,
      active: item.id === tab.id,
    }));
    setItems(mapped);
    onSelect(tab);
  };

  return (
    <div className="inline-flex gap-1 items-center font-serif bg-accent-100/85 backdrop-blur-sm border border-accent-300/40 rounded-full p-1 shadow-sm">
      {tabItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`${(item.disabled && 'disabled cursor-not-allowed') || 'cursor-pointer'} ${(item.active && 'bg-accent-300 text-brand-700 font-semibold shadow-sm') || 'text-brand-500 hover:text-brand-700'} rounded-full px-4 py-1.5 duration-200`}
          onClick={() => { tabClicked(item); }}>
          {item.label}
        </motion.div>
      ))}
    </div>
  );
}
