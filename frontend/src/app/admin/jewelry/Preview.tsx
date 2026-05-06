'use client'

import Image from 'next/image';

type PreviewProps = {
  itemName: string;
  featureCollection: string;
  description: string;
  thumbnailUrl: string | null;
  extraImageUrls: string[];
  minAmount: number;
  currency: string;
  giftable: boolean;
};

const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

export default function Preview({
  itemName,
  featureCollection,
  description,
  thumbnailUrl,
  extraImageUrls,
  minAmount,
  currency,
  giftable,
}: PreviewProps) {
  const allImages = [thumbnailUrl, ...extraImageUrls].filter(Boolean) as string[];

  return (
    <aside className="flex flex-col gap-3 sticky top-6 self-start max-h-[calc(100dvh-3rem)] min-h-0">
      <section className="bg-white border border-accent-300/40 rounded-2xl overflow-hidden shrink-0">
        <div className="text-[10px] uppercase tracking-[0.24em] text-brand-500/70 px-4 pt-3 pb-1">
          Browse card
        </div>
        <div className="relative cursor-default overflow-hidden">
          <figure className="text-sm h-48 overflow-hidden m-0">
            {thumbnailUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={thumbnailUrl}
                  alt={itemName || 'thumbnail'}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-accent-100 text-xs text-brand-500/60">
                Upload a thumbnail to preview
              </div>
            )}
            <figcaption className="absolute bottom-0 w-full bg-white/85 backdrop-blur-sm flex justify-between items-center px-3 py-2">
              <div className="min-w-0">
                <b className="text-sm text-gray-800 truncate block">{itemName || 'Untitled piece'}</b>
                {featureCollection && (
                  <p className="font-light text-xs text-brand-500/70 truncate">{featureCollection}</p>
                )}
              </div>
              <b className="text-brand-700 text-sm shrink-0 ml-2">
                {formatPrice(minAmount, currency)}
              </b>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-white border border-accent-300/40 rounded-2xl p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="text-[10px] uppercase tracking-[0.24em] text-brand-500/70 mb-2 shrink-0">
          Detail page
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <h2 className="text-lg text-brand-700 font-semibold leading-tight">{itemName || 'Untitled piece'}</h2>
          {featureCollection && (
            <p className="text-xs text-brand-500/70 mt-0.5">{featureCollection}</p>
          )}
          <p className="text-base text-brand-700 font-semibold mt-2">{formatPrice(minAmount, currency)}</p>
          {description && (
            <p className="text-xs text-brand-500/90 mt-2 whitespace-pre-line leading-relaxed">{description}</p>
          )}
          {giftable && (
            <p className="text-[10px] uppercase tracking-[0.24em] text-accent-600 mt-2">Giftable</p>
          )}
          {allImages.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {allImages.slice(0, 4).map((src, idx) => (
                <div key={`${src}-${idx}`} className="relative aspect-square rounded-md overflow-hidden bg-accent-100">
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
