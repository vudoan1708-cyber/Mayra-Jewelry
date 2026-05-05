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
    <div className="flex gap-2 items-center font-serif">
      {tabItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`${(item.disabled && 'disabled cursor-not-allowed') || 'cursor-pointer'} ${(item.active && 'border-b-2 border-b-accent-500 text-accent-600 font-semibold') || 'text-brand-500 hover:text-accent-600'} rounded-sm px-2 py-[2px] duration-200`}
          onClick={() => { tabClicked(item); }}>
          {item.label}
        </motion.div>
      ))}
    </div>
  );
}
