'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';

export type Tab = {
  id: string | number,
  label: string,
  active: boolean,
  disabled?: boolean,
  onSelect: (item: Tab) => void,
};

export default function Tabs({ items }: { items: Array<Tab> }) {
  const [tabItems, setItems] = useState<Array<Tab>>(items);
  const tabClicked = (tab: Tab) => {
    const mapped = items.map((item) => ({
      ...item,
      active: item.id === tab.id,
    }));
    setItems(mapped);
    tab.onSelect(tab);
  };

  return (
    <div className="flex gap-2 items-center">
      {tabItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`${(item.disabled && 'disabled cursor-not-allowed') || 'cursor-pointer'} ${(item.active && 'border-b-2 border-b-brand-500 text-brand-500 font-semibold') || 'text-gray-600 hover:bg-gray-200'} rounded-sm px-1 py-[2px] duration-200`}
          onClick={() => { tabClicked(item); }}>
          {item.label}
        </motion.div>
      ))}
    </div>
  );
}
