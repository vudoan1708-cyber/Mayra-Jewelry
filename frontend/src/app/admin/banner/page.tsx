import type { Metadata } from 'next';

import BannerEditor from './BannerEditor';

export const metadata: Metadata = {
  title: 'Banner',
  description: 'Edit the storefront promo banner shown above the navigation.',
  alternates: { canonical: '/admin/banner' },
};

export default function Page() {
  return <BannerEditor />;
}
