'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';

import { useRouter } from '../../../i18n/navigation';

export type BrowseSearchItem = {
  id: string;
  name: string;
  thumbnail: string;
  collection?: string | null;
};

const MAX_RESULTS = 8;

export default function Search({ items }: { items: BrowseSearchItem[] }) {
  const t = useTranslations('browse');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const trimmedQuery = query.trim();
  const filtered = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (!q) return [];
    return items
      .filter((item) => item.name.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [items, trimmedQuery]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    const handlePointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, []);

  const select = (item: BrowseSearchItem) => {
    setOpen(false);
    setQuery('');
    router.push(`/product/${item.id}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(filtered[highlighted]);
    }
  };

  const showDropdown = open && trimmedQuery.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <SearchIcon
          aria-hidden
          className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-brand-500/70 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label={t('searchAriaLabel')}
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full bg-white border border-accent-300/60 rounded-full pl-14 pr-10 py-3 text-sm text-brand-700 placeholder:text-brand-500/50 focus:outline-none focus:border-brand-500 transition-colors"
        />
        {query && (
          <button
            type="button"
            aria-label="clear"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-brand-500/70 hover:text-brand-700 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 bg-white border border-accent-300/60 rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-30 max-h-[60dvh] overflow-y-auto"
          >
            {filtered.length === 0
              ? (
                <li className="px-4 py-3 text-sm text-brand-500/80 italic">
                  {t('noResults')}
                </li>
              )
              : filtered.map((item, idx) => (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={idx === highlighted}
                  onPointerEnter={() => setHighlighted(idx)}
                  onClick={() => select(item)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                    idx === highlighted ? 'bg-accent-100' : 'bg-white'
                  }`}
                >
                  <div className="relative size-12 shrink-0 rounded-md overflow-hidden bg-accent-100">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-700 truncate">{item.name}</p>
                    {item.collection && (
                      <p className="text-xs text-brand-500/70 truncate">{item.collection}</p>
                    )}
                  </div>
                </li>
              ))
            }
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
