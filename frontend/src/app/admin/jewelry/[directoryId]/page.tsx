import type { Metadata } from 'next';

import JewelryEditor from '../JewelryEditor';

export const metadata: Metadata = {
  title: 'Edit piece',
  description: 'Edit an existing jewelry piece on the Mayra storefront.',
};

export default async function Page({
  params,
}: {
  params: Promise<{ directoryId: string }>;
}) {
  const { directoryId } = await params;
  return <JewelryEditor directoryId={decodeURIComponent(directoryId)} />;
}
