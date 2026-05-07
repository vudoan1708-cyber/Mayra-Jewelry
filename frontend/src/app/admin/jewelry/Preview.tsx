'use client'

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import { Crop } from 'lucide-react';

import type { MaterialId } from '../../../components/Jewelry/Variation';

export type CropTargetSpec =
  | { kind: 'thumbnail'; variant: 'detail' }
  | { kind: 'extra'; key: string };

export type DetailImage = {
  key: string;
  url: string;
  target?: CropTargetSpec;
};

export type VariationPrice = { amount: number; currency: string };

type PreviewProps = {
  itemName: string;
  featureCollection: string;
  description: string;
  minAmount: number;
  currency: string;
  giftable: boolean;
  browseImageUrl: string | null;
  onCropBrowse?: () => void;
  detailImagesByVariation: Record<string, DetailImage[]>;
  availableVariations: MaterialId[];
  pricesByVariation: Partial<Record<MaterialId, VariationPrice>>;
  onCropDetail: (target: CropTargetSpec) => void;
};

const VARIATION_SWATCH: Record<MaterialId, string> = {
  Silver: 'bg-gray-400',
  Gold: 'bg-amber-300',
  'White Gold': 'bg-slate-100',
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
  minAmount,
  currency,
  giftable,
  browseImageUrl,
  onCropBrowse,
  detailImagesByVariation,
  availableVariations,
  pricesByVariation,
  onCropDetail,
}: PreviewProps) {
  return (
    <aside className="flex flex-col gap-3 sticky top-6 self-start max-h-[calc(100dvh-3rem)] min-h-0">
      <BrowseCardPreview
        itemName={itemName}
        featureCollection={featureCollection}
        minAmount={minAmount}
        currency={currency}
        thumbnailUrl={browseImageUrl}
        onCrop={onCropBrowse}
      />

      <DetailPreview
        itemName={itemName}
        featureCollection={featureCollection}
        description={description}
        fallbackAmount={minAmount}
        fallbackCurrency={currency}
        giftable={giftable}
        imagesByVariation={detailImagesByVariation}
        availableVariations={availableVariations}
        pricesByVariation={pricesByVariation}
        onCrop={onCropDetail}
      />
    </aside>
  );
}

function VariationChip({
  variation,
  selected,
  onSelect,
}: {
  variation: MaterialId;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={variation}
      aria-label={variation}
      aria-current={selected}
      className={`rounded-full border-2 cursor-pointer transition-all ${VARIATION_SWATCH[variation]} ${
        selected
          ? 'w-[27px] h-[27px] shadow-lg border-brand-500'
          : 'w-4 h-4 hover:scale-105 hover:opacity-90'
      }`}
    />
  );
}

function CropOverlayButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="absolute top-2 right-2 z-20 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-brand-700 border border-accent-300/60 shadow-sm text-[10px] uppercase tracking-[0.18em] transition-colors"
    >
      <Crop className="size-3" /> Crop
    </button>
  );
}

function BrowseCardPreview({
  itemName,
  featureCollection,
  minAmount,
  currency,
  thumbnailUrl,
  onCrop,
}: {
  itemName: string;
  featureCollection: string;
  minAmount: number;
  currency: string;
  thumbnailUrl: string | null;
  onCrop?: () => void;
}) {
  return (
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
              {onCrop && <CropOverlayButton onClick={onCrop} label="Crop browse thumbnail" />}
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
  );
}

function DetailPreview({
  itemName,
  featureCollection,
  description,
  fallbackAmount,
  fallbackCurrency,
  giftable,
  imagesByVariation,
  availableVariations,
  pricesByVariation,
  onCrop,
}: {
  itemName: string;
  featureCollection: string;
  description: string;
  fallbackAmount: number;
  fallbackCurrency: string;
  giftable: boolean;
  imagesByVariation: Record<string, DetailImage[]>;
  availableVariations: MaterialId[];
  pricesByVariation: Partial<Record<MaterialId, VariationPrice>>;
  onCrop: (target: CropTargetSpec) => void;
}) {
  const [currentVariation, setCurrentVariation] = useState<MaterialId | null>(
    availableVariations[0] ?? null,
  );
  useEffect(() => {
    if (!currentVariation || !availableVariations.includes(currentVariation)) {
      setCurrentVariation(availableVariations[0] ?? null);
    }
  }, [availableVariations, currentVariation]);

  const images = useMemo(
    () => (currentVariation ? imagesByVariation[currentVariation] ?? [] : []),
    [imagesByVariation, currentVariation],
  );
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    setActiveIdx(0);
  }, [currentVariation]);
  useEffect(() => {
    setActiveIdx((idx) => (idx >= images.length ? 0 : idx));
  }, [images.length]);
  const active = images[activeIdx];

  const activePrice = currentVariation ? pricesByVariation[currentVariation] : undefined;
  const displayAmount = activePrice?.amount ?? fallbackAmount;
  const displayCurrency = activePrice?.currency || fallbackCurrency;

  return (
    <section className="bg-white border border-accent-300/40 rounded-2xl p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="text-[10px] uppercase tracking-[0.24em] text-brand-500/70 mb-2 shrink-0">
        Detail page
      </div>
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 flex flex-col gap-3">
        <div className="relative aspect-square w-full shrink-0 rounded-xl bg-accent-100 border border-accent-300/40 overflow-hidden">
          {active ? (
            <>
              <Image
                key={active.url}
                src={active.url}
                alt={itemName || 'preview'}
                fill
                sizes="340px"
                className="object-cover bg-white"
              />
              {active.target && (
                <CropOverlayButton onClick={() => onCrop(active.target!)} label="Crop for detail page" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-brand-500/60 px-4 text-center">
              Upload images to preview the detail hero
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-1">
                {images.map((img, idx) => (
                  <button
                    key={img.key}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    aria-current={idx === activeIdx}
                    className="group p-1 -m-1 flex items-center justify-center"
                  >
                    <span
                      className={`block h-2 rounded-full transition-all ${
                        idx === activeIdx
                          ? 'w-5 bg-brand-700'
                          : 'w-2 bg-brand-700/40 group-hover:bg-brand-700/70'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[10px] tabular-nums text-brand-700/80 leading-none px-0.5 select-none">
                {activeIdx + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        {availableVariations.length > 0 && (
          <div className="flex gap-2 items-center">
            {availableVariations.map((v) => (
              <VariationChip
                key={v}
                variation={v}
                selected={v === currentVariation}
                onSelect={() => setCurrentVariation(v)}
              />
            ))}
          </div>
        )}

        <h2 className="text-lg text-brand-700 font-semibold leading-tight">{itemName || 'Untitled piece'}</h2>
        {featureCollection && (
          <p className="text-xs text-brand-500/70 -mt-2">{featureCollection}</p>
        )}
        <p className="text-base text-brand-700 font-semibold">
          {formatPrice(displayAmount, displayCurrency)}
        </p>
        {description && (
          <p className="text-xs text-brand-500/90 whitespace-pre-line leading-relaxed">{description}</p>
        )}
        {giftable && (
          <p className="text-[10px] uppercase tracking-[0.24em] text-accent-600">Giftable</p>
        )}
      </div>
    </section>
  );
}
