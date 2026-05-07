'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';

import { primaryButtonClass } from '../../../components/Button';
import AdminShell from '../AdminShell';
import {
  adminEyebrow,
  adminInput,
  adminPageEyebrow,
  adminPageHeading,
} from '../styles';
import { listAdminJewelry, type AdminJewelry } from '../api';
import { browseThumbnailOf } from '../../../helpers';


const minPrice = (prices: AdminJewelry['prices']) => {
  if (prices.length === 0) return 0;
  return prices.reduce((acc, p) => Math.min(acc, p.amount), prices[0].amount);
};

const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

export default function JewelryListView() {
  const [items, setItems] = useState<AdminJewelry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    listAdminJewelry()
      .then((data) => setItems(data ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load jewelry'));
  }, []);

  const filtered = (items ?? []).filter((item) =>
    !query.trim() || item.itemName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <AdminShell>
      <section className="flex flex-col gap-7">
        <header className="flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
          <div>
            <p className={adminPageEyebrow}>Catalogue</p>
            <h1 className={adminPageHeading}>Jewelry</h1>
            <p className="text-sm text-brand-500/80 mt-1">
              {items === null ? 'Loading…' : `${items.length} piece${items.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link href="/admin/jewelry/new" className={`${primaryButtonClass} !no-underline`}>
            <Plus className="size-4" />
            New piece
          </Link>
        </header>

        <div className="relative max-w-md">
          <Search aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-500/70 pointer-events-none" />
          <input
            type="search"
            placeholder="Filter by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${adminInput} !rounded-full pl-11 pr-4`}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        )}

        {items === null ? null : items.length === 0 ? (
          <div className="bg-white border border-accent-300/40 rounded-2xl p-12 text-center shadow-sm shadow-black/5">
            <p className="text-sm text-brand-500/80 mb-4">No jewelry pieces yet.</p>
            <Link href="/admin/jewelry/new" className={`${primaryButtonClass} !no-underline`}>
              <Plus className="size-4" />
              Add your first piece
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-brand-500/70 italic">No pieces match that name.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0">
            {filtered.map((item) => {
              const thumb = browseThumbnailOf(item.media) ?? '';
              const price = minPrice(item.prices);
              return (
                <motion.li
                  key={item.directoryId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/admin/jewelry/${encodeURIComponent(item.directoryId)}`}
                    className="block bg-white border border-accent-300/40 rounded-2xl overflow-hidden shadow-sm shadow-black/5 hover:shadow-md hover:border-accent-300 transition-all !no-underline group"
                  >
                    <div className="relative aspect-square bg-accent-100">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={item.itemName}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-brand-500/60">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-1">
                      <p className={adminEyebrow}>
                        {item.featureCollection || (item.giftable ? 'Giftable' : 'Piece')}
                      </p>
                      <p className="text-base text-brand-700 font-medium truncate">{item.itemName}</p>
                      <p className="text-sm text-brand-500/80">
                        {formatPrice(price, item.currency || item.prices[0]?.currency || 'VND')}
                      </p>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
