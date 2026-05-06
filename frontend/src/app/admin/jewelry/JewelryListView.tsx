'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Plus, Search } from 'lucide-react';

import AdminShell from '../AdminShell';
import { listAdminJewelry, type AdminJewelry } from '../api';

const thumbnailOf = (media: AdminJewelry['media']) =>
  media.find((m) => m.fileName.endsWith('file-thumbnail'))?.url ?? '';

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
      <section className="flex flex-col gap-6">
        <header className="flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl text-brand-700">Jewelry</h1>
            <p className="text-sm text-brand-500/80 mt-1">
              {items === null ? 'Loading…' : `${items.length} piece${items.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link
            href="/admin/jewelry/new"
            className="inline-flex items-center gap-2 bg-brand-700 text-accent-100 px-4 py-2 rounded-md text-xs uppercase tracking-[0.2em] hover:bg-brand-600 transition-colors !no-underline"
          >
            <Plus className="size-4" />
            New piece
          </Link>
        </header>

        <div className="relative">
          <Search aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-500/70 pointer-events-none" />
          <input
            type="search"
            placeholder="Filter by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-accent-300/60 rounded-full pl-11 pr-4 py-2.5 text-sm text-brand-700 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        )}

        {items === null ? null : items.length === 0 ? (
          <div className="bg-white border border-accent-300/40 rounded-2xl p-10 text-center">
            <p className="text-sm text-brand-500/80 mb-4">No jewelry pieces yet.</p>
            <Link
              href="/admin/jewelry/new"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 !no-underline"
            >
              <Plus className="size-4" />
              Add your first piece
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
            {filtered.map((item) => {
              const thumb = thumbnailOf(item.media);
              const price = minPrice(item.prices);
              return (
                <li key={item.directoryId}>
                  <Link
                    href={`/admin/jewelry/${encodeURIComponent(item.directoryId)}`}
                    className="block bg-white border border-accent-300/40 rounded-2xl overflow-hidden hover:shadow-md hover:border-accent-300 transition-all !no-underline"
                  >
                    <div className="relative aspect-square bg-accent-100">
                      {thumb ? (
                        <Image src={thumb} alt={item.itemName} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-brand-500/60">No image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-brand-700 truncate">{item.itemName}</p>
                      {item.featureCollection && (
                        <p className="text-xs text-brand-500/70 truncate">{item.featureCollection}</p>
                      )}
                      <p className="text-xs text-brand-500/80 mt-1">{formatPrice(price, item.currency || item.prices[0]?.currency || 'VND')}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
