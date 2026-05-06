'use client'

import Link from 'next/link';
import { Gem, Megaphone } from 'lucide-react';

import AdminShell from './AdminShell';

const cards = [
  { href: '/admin/jewelry', label: 'Jewelry', icon: Gem, blurb: 'Add new pieces, edit names, descriptions, prices, and images.' },
  { href: '/admin/banner', label: 'Banner', icon: Megaphone, blurb: 'Update the promo strip shown on every storefront page.' },
];

export default function AdminHomeView() {
  return (
    <AdminShell>
      <section className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl text-brand-700">Welcome back.</h1>
          <p className="text-sm text-brand-500/80 mt-1">Pick what to manage.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white border border-accent-300/40 rounded-2xl shadow-sm p-6 hover:shadow-md hover:border-accent-300 transition-all !no-underline"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="size-5 text-brand-700" />
                  <h2 className="text-base text-brand-700">{card.label}</h2>
                </div>
                <p className="text-sm text-brand-500/80">{card.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
