'use client'

import Link from 'next/link';
import { Gem, Megaphone, Users, ArrowUpRight } from 'lucide-react';

import AdminShell from './AdminShell';
import {
  adminEyebrow,
  adminPageEyebrow,
  adminPageHeading,
  adminSectionTitle,
} from './styles';

const cards = [
  { href: '/admin/jewelry', label: 'Jewelry', icon: Gem, blurb: 'Add new pieces, edit names, descriptions, prices, and images.' },
  { href: '/admin/banner', label: 'Banner', icon: Megaphone, blurb: 'Update the promo strip shown above the storefront nav.' },
  { href: '/admin/users', label: 'Users', icon: Users, blurb: 'Add or disable admin teammates. Two-factor enforced for everyone.' },
];

export default function AdminHomeView() {
  return (
    <AdminShell>
      <section className="flex flex-col gap-7">
        <header>
          <p className={adminPageEyebrow}>Atelier</p>
          <h1 className={adminPageHeading}>Welcome back.</h1>
          <p className="text-sm text-brand-500/80 mt-1">Pick what to manage.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white border border-accent-300/40 rounded-2xl shadow-sm shadow-black/5 p-7 hover:shadow-md hover:border-accent-300 transition-all !no-underline flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-full bg-accent-100/70 border border-accent-300/40 flex items-center justify-center text-brand-700">
                    <Icon className="size-5" />
                  </div>
                  <ArrowUpRight className="size-4 text-brand-500/40 group-hover:text-brand-500 transition-colors" />
                </div>
                <div>
                  <p className={adminEyebrow}>Section</p>
                  <h2 className={adminSectionTitle}>{card.label}</h2>
                </div>
                <p className="text-sm text-brand-500/80 leading-relaxed">{card.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
