'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { ChevronDown, Plus, Trash2, Upload, X } from 'lucide-react';

import Button from '../../../components/Button';
import AdminShell from '../AdminShell';
import AutoTextarea from '../AutoTextarea';
import { useToast } from '../Toast';
import CropModal, { type CropRect } from './CropModal';
import Preview, { type DetailImage } from './Preview';
import {
  adminCardPadded,
  adminEyebrow,
  adminGhostButton,
  adminInput,
  adminLabel,
  adminLabelText,
  adminPageEyebrow,
  adminPageHeading,
  adminSectionTitle,
  adminTextarea,
} from '../styles';
import {
  type AdminJewelry,
  type AdminJewelryPrice,
  type JewelryTranslation,
  type JewelryTranslations,
  createAdminJewelry,
  deleteAdminJewelryMedia,
  getAdminJewelry,
  updateAdminJewelry,
  uploadAdminJewelryMedia,
} from '../api';
import { extraFieldName, isBrowseThumbnailKey, isDetailThumbnailKey, parseExtraField } from '../../../helpers';

const THUMBNAIL_BROWSE = 'thumbnail-browse';
const THUMBNAIL_DETAIL = 'thumbnail-detail';

const ASPECT_BROWSE = 4 / 5;
const ASPECT_DETAIL = 1;
const ASPECT_EXTRA = 1;

type Variant =
  | { kind: 'existing'; url: string; fileName: string }
  | { kind: 'new'; file: File; blobUrl: string; rect?: CropRect };

type ThumbnailState = null | {
  source: { file: File; blobUrl: string } | null;
  browse: Variant;
  detail: Variant | null;
};

type ExtraSlot = {
  key: string;
  variation: AdminJewelryPrice['variation'];
  source: { file: File; blobUrl: string } | null;
  variant: Variant;
};

type TranslationDraft = {
  itemName: string;
  description: string;
  featureCollection: string;
};

type EditorState = {
  itemName: string;
  description: string;
  featureCollection: string;
  giftable: boolean;
  bestSeller: boolean;
  prices: AdminJewelryPrice[];
  thumbnail: ThumbnailState;
  extras: ExtraSlot[];
  removedFileNames: string[];
  translations: Record<string, TranslationDraft>;
};

const SUPPORTED_LOCALES: Array<{ code: string; label: string }> = [
  { code: 'en', label: 'English' },
];

const emptyTranslation = (): TranslationDraft => ({ itemName: '', description: '', featureCollection: '' });

const defaultTranslations = (): Record<string, TranslationDraft> =>
  SUPPORTED_LOCALES.reduce<Record<string, TranslationDraft>>((acc, l) => {
    acc[l.code] = emptyTranslation();
    return acc;
  }, {});

type CropTarget =
  | { kind: 'thumbnail'; variant: 'browse' | 'detail' }
  | { kind: 'extra'; key: string };

const VARIATIONS: AdminJewelryPrice['variation'][] = ['Silver', 'Gold', 'White Gold'];

const defaultState: EditorState = {
  itemName: '',
  description: '',
  featureCollection: '',
  giftable: true,
  bestSeller: false,
  prices: [{ variation: 'Silver', amount: 0, currency: 'VND', discount: 0 }],
  thumbnail: null,
  extras: [],
  removedFileNames: [],
  translations: defaultTranslations(),
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const stripPrefix = (fileName: string, directoryId: string) => {
  if (fileName.startsWith(`${directoryId}/`)) return fileName.slice(directoryId.length + 1);
  const parts = fileName.split('/');
  return parts[parts.length - 1];
};

const variantUrl = (v: Variant) => (v.kind === 'existing' ? v.url : v.blobUrl);

const detailDisplayUrl = (t: NonNullable<ThumbnailState>): string => {
  if (t.detail) return variantUrl(t.detail);
  if (t.source) return t.source.blobUrl;
  return variantUrl(t.browse);
};

const sourceDisplayUrlOf = (t: NonNullable<ThumbnailState>): string => {
  if (t.source) return t.source.blobUrl;
  return variantUrl(t.browse);
};

const hydratePrices = (item: AdminJewelry): AdminJewelryPrice[] => {
  if (item.prices.length === 0) return defaultState.prices;
  const fallback = item.currency || 'VND';
  return item.prices.map((p) => ({ ...p, currency: p.currency || fallback }));
};

const hydrateTranslations = (
  translations: AdminJewelry['translations'] | undefined,
): Record<string, TranslationDraft> => {
  const seeded = defaultTranslations();
  if (!translations) return seeded;
  for (const { code } of SUPPORTED_LOCALES) {
    const t = translations[code];
    if (!t) continue;
    seeded[code] = {
      itemName: t.itemName ?? '',
      description: t.description ?? '',
      featureCollection: t.featureCollection ?? '',
    };
  }
  return seeded;
};

const serializeTranslations = (drafts: Record<string, TranslationDraft>): JewelryTranslations => {
  const out: JewelryTranslations = {};
  for (const [code, draft] of Object.entries(drafts)) {
    const entry: JewelryTranslation = {};
    if (draft.itemName.trim()) entry.itemName = draft.itemName.trim();
    if (draft.description.trim()) entry.description = draft.description.trim();
    if (draft.featureCollection.trim()) entry.featureCollection = draft.featureCollection.trim();
    if (Object.keys(entry).length > 0) out[code] = entry;
  }
  return out;
};

const pickDetailUploadFile = (t: ThumbnailState): File | null => {
  if (!t) return null;
  if (t.detail?.kind === 'new') return t.detail.file;
  if (!t.detail && t.source) return t.source.file;
  return null;
};

const mediaToState = (item: AdminJewelry): Pick<EditorState, 'thumbnail' | 'extras'> => {
  const browseM = item.media.find((m) => isBrowseThumbnailKey(m.fileName));
  const detailM = item.media.find((m) => isDetailThumbnailKey(m.fileName));
  const thumbnail: ThumbnailState = browseM
    ? {
        source: null,
        browse: { kind: 'existing', url: browseM.url, fileName: browseM.fileName },
        detail: detailM
          ? { kind: 'existing', url: detailM.url, fileName: detailM.fileName }
          : null,
      }
    : null;
  const fallbackVariation = item.prices[0]?.variation ?? 'Silver';
  const extras: ExtraSlot[] = [];
  item.media.forEach((m) => {
    if (isBrowseThumbnailKey(m.fileName) || isDetailThumbnailKey(m.fileName)) return;
    const parsed = parseExtraField(m.fileName);
    extras.push({
      key: makeId(),
      variation: parsed?.variation ?? fallbackVariation,
      source: null,
      variant: { kind: 'existing', url: m.url, fileName: m.fileName },
    });
  });
  return { thumbnail, extras };
};

const aspectFor = (target: CropTarget): number => {
  if (target.kind === 'extra') return ASPECT_EXTRA;
  return target.variant === 'browse' ? ASPECT_BROWSE : ASPECT_DETAIL;
};

export default function JewelryEditor({ directoryId }: { directoryId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(directoryId);

  const { showSuccess } = useToast();
  const [state, setState] = useState<EditorState>(defaultState);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!isEdit || !directoryId) return;
    setLoading(true);
    getAdminJewelry(directoryId)
      .then((item) => {
        if (!item) throw new Error('Item not found');
        const { thumbnail, extras } = mediaToState(item);
        setState({
          itemName: item.itemName,
          description: item.description,
          featureCollection: item.featureCollection,
          giftable: item.giftable,
          bestSeller: item.bestSeller,
          prices: hydratePrices(item),
          thumbnail,
          extras,
          removedFileNames: [],
          translations: hydrateTranslations(item.translations),
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load'))
      .finally(() => setLoading(false));
  }, [isEdit, directoryId]);

  const trackBlob = (url: string) => {
    blobUrlsRef.current.add(url);
  };

  const onThumbnailChange = (file: File | null) => {
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    trackBlob(blobUrl);
    setState((s) => {
      let removed = s.removedFileNames;
      if (s.thumbnail) {
        if (s.thumbnail.browse.kind === 'existing') removed = [...removed, s.thumbnail.browse.fileName];
        if (s.thumbnail.detail?.kind === 'existing') removed = [...removed, s.thumbnail.detail.fileName];
      }
      return {
        ...s,
        thumbnail: {
          source: { file, blobUrl },
          browse: { kind: 'new', file, blobUrl },
          detail: null,
        },
        removedFileNames: removed,
      };
    });
  };

  const onAddExtras = (variation: AdminJewelryPrice['variation'], files: FileList | null) => {
    if (!files || files.length === 0) return;
    const additions: ExtraSlot[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blobUrl = URL.createObjectURL(file);
      trackBlob(blobUrl);
      additions.push({
        key: makeId(),
        variation,
        source: { file, blobUrl },
        variant: { kind: 'new', file, blobUrl },
      });
    }
    setState((s) => ({ ...s, extras: [...s.extras, ...additions] }));
  };

  const onRemoveExtra = (key: string) => {
    setState((s) => {
      const removing = s.extras.find((e) => e.key === key);
      if (!removing) return s;
      let removedFileNames = s.removedFileNames;
      if (removing.variant.kind === 'existing') {
        removedFileNames = [...removedFileNames, removing.variant.fileName];
      }
      return {
        ...s,
        extras: s.extras.filter((e) => e.key !== key),
        removedFileNames,
      };
    });
  };

  const rectFor = (target: CropTarget): CropRect | undefined => {
    if (target.kind === 'thumbnail') {
      const t = state.thumbnail;
      if (!t) return undefined;
      const v = target.variant === 'browse' ? t.browse : t.detail;
      if (v && v.kind === 'new') return v.rect;
      return undefined;
    }
    const slot = state.extras.find((e) => e.key === target.key);
    if (!slot || slot.variant.kind !== 'new') return undefined;
    return slot.variant.rect;
  };

  const sourceFileFor = (target: CropTarget): File | null => {
    if (target.kind === 'thumbnail') {
      const t = state.thumbnail;
      if (!t) return null;
      if (t.source) return t.source.file;
      const v = target.variant === 'browse' ? t.browse : (t.detail ?? t.browse);
      return v.kind === 'new' ? v.file : null;
    }
    const slot = state.extras.find((e) => e.key === target.key);
    if (!slot) return null;
    if (slot.source) return slot.source.file;
    return slot.variant.kind === 'new' ? slot.variant.file : null;
  };

  const onCropConfirm = (cropped: File, rect: CropRect) => {
    if (!cropTarget) return;
    const blobUrl = URL.createObjectURL(cropped);
    trackBlob(blobUrl);
    setState((s) => {
      if (cropTarget.kind === 'thumbnail') {
        if (!s.thumbnail) return s;
        let removed = s.removedFileNames;
        if (cropTarget.variant === 'browse') {
          if (s.thumbnail.browse.kind === 'existing') {
            removed = [...removed, s.thumbnail.browse.fileName];
          }
          return {
            ...s,
            thumbnail: {
              ...s.thumbnail,
              browse: { kind: 'new', file: cropped, blobUrl, rect },
            },
            removedFileNames: removed,
          };
        }
        if (s.thumbnail.detail?.kind === 'existing') {
          removed = [...removed, s.thumbnail.detail.fileName];
        }
        return {
          ...s,
          thumbnail: {
            ...s.thumbnail,
            detail: { kind: 'new', file: cropped, blobUrl, rect },
          },
          removedFileNames: removed,
        };
      }
      const targetKey = cropTarget.key;
      let removed = s.removedFileNames;
      const next = s.extras.map((extra) => {
        if (extra.key !== targetKey) return extra;
        if (extra.variant.kind === 'existing') {
          removed = [...removed, extra.variant.fileName];
        }
        return { ...extra, variant: { kind: 'new' as const, file: cropped, blobUrl, rect } };
      });
      return { ...s, extras: next, removedFileNames: removed };
    });
    setCropTarget(null);
  };

  const updatePrice = (idx: number, patch: Partial<AdminJewelryPrice>) => {
    setState((s) => {
      const next = [...s.prices];
      next[idx] = { ...next[idx], ...patch };
      return { ...s, prices: next };
    });
  };

  const addPrice = () => {
    const used = new Set(state.prices.map((p) => p.variation));
    const next = VARIATIONS.find((v) => !used.has(v)) ?? 'Gold';
    setState((s) => ({
      ...s,
      prices: [...s.prices, { variation: next, amount: 0, currency: s.prices[0]?.currency ?? 'VND', discount: 0 }],
    }));
  };

  const removePrice = (idx: number) => {
    setState((s) => {
      const removed = s.prices[idx]?.variation;
      if (!removed) return s;
      const remaining = s.extras.filter((e) => e.variation !== removed);
      const orphaned = s.extras.filter((e) => e.variation === removed);
      const removedFileNames = [
        ...s.removedFileNames,
        ...orphaned
          .filter((e): e is ExtraSlot & { variant: { kind: 'existing'; fileName: string; url: string } } =>
            e.variant.kind === 'existing',
          )
          .map((e) => e.variant.fileName),
      ];
      return {
        ...s,
        prices: s.prices.filter((_, i) => i !== idx),
        extras: remaining,
        removedFileNames,
      };
    });
  };

  const appendImageFields = (fd: FormData): boolean => {
    let hasNew = false;
    if (state.thumbnail?.browse.kind === 'new') {
      fd.append(THUMBNAIL_BROWSE, state.thumbnail.browse.file);
      hasNew = true;
    }
    const detailFile = pickDetailUploadFile(state.thumbnail);
    if (detailFile) {
      fd.append(THUMBNAIL_DETAIL, detailFile);
      hasNew = true;
    }
    state.extras.forEach((extra) => {
      if (extra.variant.kind === 'new') {
        fd.append(extraFieldName(extra.variation, extra.key), extra.variant.file);
        hasNew = true;
      }
    });
    return hasNew;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!state.itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (state.prices.length === 0) {
      setError('At least one price is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const translationsPayload = serializeTranslations(state.translations);
      if (!isEdit) {
        const fd = new FormData();
        fd.append('itemName', state.itemName);
        fd.append('description', state.description);
        fd.append('featureCollection', state.featureCollection);
        fd.append('giftable', String(state.giftable));
        fd.append('bestSeller', String(state.bestSeller));
        fd.append('currency', state.prices[0]?.currency ?? 'VND');
        fd.append('prices', JSON.stringify(state.prices));
        fd.append('type', 'ring');
        fd.append('translations', JSON.stringify(translationsPayload));
        appendImageFields(fd);
        const res = await createAdminJewelry(fd);
        const newId = res?.directoryId;
        showSuccess('Piece created.');
        if (newId) {
          router.push(`/admin/jewelry/${encodeURIComponent(newId)}`);
          return;
        }
      } else {
        await updateAdminJewelry(directoryId!, {
          itemName: state.itemName,
          description: state.description,
          featureCollection: state.featureCollection,
          giftable: state.giftable,
          bestSeller: state.bestSeller,
          translations: translationsPayload,
          prices: state.prices.map((p) => ({
            variation: p.variation,
            amount: p.amount,
            currency: p.currency,
            discount: p.discount,
          })),
        });

        for (const full of state.removedFileNames) {
          const fileName = stripPrefix(full, directoryId!);
          await deleteAdminJewelryMedia(directoryId!, fileName);
        }

        const fd = new FormData();
        if (appendImageFields(fd)) {
          await uploadAdminJewelryMedia(directoryId!, fd);
        }

        showSuccess('Changes saved.');
        const refreshed = await getAdminJewelry(directoryId!);
        if (refreshed) {
          const { thumbnail, extras } = mediaToState(refreshed);
          setState((s) => ({ ...s, thumbnail, extras, removedFileNames: [] }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const minAmount = state.prices.length === 0
    ? 0
    : state.prices.reduce((acc, p) => Math.min(acc, p.amount), state.prices[0].amount);
  const previewCurrency = state.prices[0]?.currency || 'VND';

  const browseUrl = state.thumbnail ? variantUrl(state.thumbnail.browse) : null;
  const sourceDisplayUrl = state.thumbnail ? sourceDisplayUrlOf(state.thumbnail) : null;
  const detailThumbUrl = state.thumbnail ? detailDisplayUrl(state.thumbnail) : null;
  const browseCanCrop = sourceFileFor({ kind: 'thumbnail', variant: 'browse' }) !== null;
  const detailThumbCanCrop = sourceFileFor({ kind: 'thumbnail', variant: 'detail' }) !== null;
  const heroEntry = detailThumbUrl
    ? [
        {
          key: '__thumb-detail',
          url: detailThumbUrl,
          target: detailThumbCanCrop
            ? ({ kind: 'thumbnail', variant: 'detail' } as const)
            : undefined,
        },
      ]
    : [];

  const detailImagesByVariation: Record<string, DetailImage[]> = {};
  state.prices.forEach((price, idx) => {
    const extrasForThisVariation = state.extras
      .filter((e) => e.variation === price.variation)
      .map((e) => ({
        key: e.key,
        url: variantUrl(e.variant),
        target: sourceFileFor({ kind: 'extra', key: e.key }) !== null
          ? ({ kind: 'extra', key: e.key } as const)
          : undefined,
      }));
    detailImagesByVariation[price.variation] = idx === 0
      ? [...heroEntry, ...extrasForThisVariation]
      : extrasForThisVariation;
  });
  const previewVariations = state.prices.map((p) => p.variation);
  const pricesByVariation = state.prices.reduce<
    Partial<Record<AdminJewelryPrice['variation'], { amount: number; currency: string }>>
  >((acc, p) => {
    acc[p.variation] = { amount: p.amount, currency: p.currency || 'VND' };
    return acc;
  }, {});

  const activeCropFile = cropTarget ? sourceFileFor(cropTarget) : null;
  const activeCropAspect = cropTarget ? aspectFor(cropTarget) : 1;
  const activeCropRect = cropTarget ? rectFor(cropTarget) : undefined;

  return (
    <AdminShell>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10">
        <form onSubmit={onSubmit} className="flex flex-col gap-7">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className={adminPageEyebrow}>{isEdit ? 'Editing piece' : 'New piece'}</p>
              <h1 className={adminPageHeading}>{state.itemName.trim() || (isEdit ? 'Edit piece' : 'Create a new piece')}</h1>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={saving || loading}
              working={saving}
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create piece'}
            </Button>
          </header>

          {loading ? (
            <p className="text-sm text-brand-500/80">Loading…</p>
          ) : (
            <>
              <section className={adminCardPadded}>
                <header className="flex flex-col gap-1">
                  <p className={adminEyebrow}>General</p>
                  <h2 className={adminSectionTitle}>Item information</h2>
                </header>

                <label className={adminLabel}>
                  <span className={adminLabelText}>Item name</span>
                  <input
                    type="text"
                    required
                    value={state.itemName}
                    onChange={(e) => setState((s) => ({ ...s, itemName: e.target.value }))}
                    className={adminInput}
                    placeholder="Vĩnh Ngân"
                  />
                </label>

                <label className={adminLabel}>
                  <span className={adminLabelText}>Description</span>
                  <AutoTextarea
                    minRows={4}
                    value={state.description}
                    onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
                    className={adminTextarea}
                    placeholder="A few warm sentences for the storefront…"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className={adminLabel}>
                    <span className={adminLabelText}>Feature collection</span>
                    <input
                      type="text"
                      value={state.featureCollection}
                      onChange={(e) => setState((s) => ({ ...s, featureCollection: e.target.value }))}
                      className={adminInput}
                      placeholder="Optional"
                    />
                  </label>

                  <div className="flex flex-col gap-1.5 text-sm">
                    <span className={adminLabelText}>Gifting</span>
                    <label className="flex items-center gap-2 bg-accent-100/40 border border-accent-300/60 rounded-md px-3.5 h-[42px] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={state.giftable}
                        onChange={(e) => setState((s) => ({ ...s, giftable: e.target.checked }))}
                        className="!w-4 !h-4 !text-xs"
                      />
                      <span className="text-sm text-brand-700">
                        {state.giftable ? 'Eligible for gift wrap' : 'Not giftable'}
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              {SUPPORTED_LOCALES.map(({ code, label }) => {
                const draft = state.translations[code];
                const setField = (field: keyof TranslationDraft, value: string) => {
                  setState((s) => ({
                    ...s,
                    translations: {
                      ...s.translations,
                      [code]: { ...s.translations[code], [field]: value },
                    },
                  }));
                };
                return (
                  <section key={`translation-${code}`} className={adminCardPadded}>
                    <header className="flex flex-col gap-1">
                      <p className={adminEyebrow}>Translation · {code.toUpperCase()}</p>
                      <h2 className={adminSectionTitle}>{label}</h2>
                      <p className="text-xs text-brand-500/70">Leave any field blank to fall back to the Vietnamese copy.</p>
                    </header>

                    <label className={adminLabel}>
                      <span className={adminLabelText}>Item name</span>
                      <input
                        type="text"
                        value={draft.itemName}
                        onChange={(e) => setField('itemName', e.target.value)}
                        className={adminInput}
                        placeholder="Eternal Silver"
                      />
                    </label>

                    <label className={adminLabel}>
                      <span className={adminLabelText}>Description</span>
                      <AutoTextarea
                        minRows={4}
                        value={draft.description}
                        onChange={(e) => setField('description', e.target.value)}
                        className={adminTextarea}
                        placeholder="A few warm sentences for the storefront…"
                      />
                    </label>

                    <label className={adminLabel}>
                      <span className={adminLabelText}>Feature collection</span>
                      <input
                        type="text"
                        value={draft.featureCollection}
                        onChange={(e) => setField('featureCollection', e.target.value)}
                        className={adminInput}
                        placeholder="Optional"
                      />
                    </label>
                  </section>
                );
              })}

              <section className={adminCardPadded}>
                <header className="flex flex-col gap-1">
                  <p className={adminEyebrow}>Merchandising</p>
                  <h2 className={adminSectionTitle}>Best seller</h2>
                  <p className="text-xs text-brand-500/70">
                    Featured on the /collections/best-sellers page, sorted by purchase count.
                  </p>
                </header>

                <label className="inline-flex items-center gap-3 bg-accent-100/40 border border-accent-300/60 rounded-md px-3.5 py-3 cursor-pointer select-none w-full sm:max-w-sm">
                  <input
                    type="checkbox"
                    checked={state.bestSeller}
                    onChange={(e) => setState((s) => ({ ...s, bestSeller: e.target.checked }))}
                    className="!size-4 accent-brand-700"
                  />
                  <span className="text-sm text-brand-700">
                    {state.bestSeller ? 'Marked as best seller' : 'Not a best seller'}
                  </span>
                </label>
              </section>

              <section className={adminCardPadded}>
                <header className="flex items-end justify-between gap-3">
                  <div>
                    <p className={adminEyebrow}>Variations</p>
                    <h2 className={adminSectionTitle}>Prices</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addPrice}
                    disabled={state.prices.length >= VARIATIONS.length}
                    className={adminGhostButton}
                  >
                    <Plus className="size-3.5" /> Add variation
                  </button>
                </header>

                <ul className="flex flex-col gap-4 list-none p-0 m-0">
                  {state.prices.map((price, idx) => (
                    <li
                      key={`${price.variation}-${idx}`}
                      className="grid grid-cols-1 sm:grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_100px_120px_auto] gap-3 items-end"
                    >
                      <label className="flex flex-col gap-1.5">
                        <span className={adminLabelText}>Variation</span>
                        <span className="relative">
                          <select
                            value={price.variation}
                            onChange={(e) => updatePrice(idx, { variation: e.target.value as AdminJewelryPrice['variation'] })}
                            className={`${adminInput} appearance-none pr-9`}
                          >
                            {VARIATIONS.map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-brand-500/70 pointer-events-none" />
                        </span>
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={adminLabelText}>Amount</span>
                        <input
                          type="number"
                          min={0}
                          required
                          value={price.amount}
                          onChange={(e) => updatePrice(idx, { amount: Number(e.target.value) })}
                          className={adminInput}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={adminLabelText}>Currency</span>
                        <input
                          type="text"
                          value={price.currency}
                          onChange={(e) => updatePrice(idx, { currency: e.target.value.toUpperCase() })}
                          className={`${adminInput} uppercase tracking-wide text-center`}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={adminLabelText}>Discount</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          max={1}
                          value={price.discount}
                          onChange={(e) => updatePrice(idx, { discount: Number(e.target.value) })}
                          className={adminInput}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removePrice(idx)}
                        disabled={state.prices.length <= 1}
                        className="shrink-0 w-10 h-[42px] flex items-center justify-center rounded-md text-brand-500/70 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-500/70 transition-colors"
                        aria-label="Remove price row"
                      >
                        <Trash2 width={16} height={16} strokeWidth={1.75} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={adminCardPadded}>
                <header className="flex flex-col gap-1">
                  <p className={adminEyebrow}>Imagery</p>
                  <h2 className={adminSectionTitle}>Photos</h2>
                  <p className="text-xs text-brand-500/70">
                    Use the preview cards on the right to crop each image for its container.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-[160px_minmax(0,1fr)] gap-5 items-start">
                  <div className="flex flex-col gap-2">
                    <span className={adminLabelText}>Thumbnail</span>
                    <div className="relative w-40 aspect-square rounded-xl overflow-hidden bg-accent-100 border border-accent-300/60">
                      {sourceDisplayUrl ? (
                        <Image src={sourceDisplayUrl} alt="thumbnail" fill sizes="160px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-brand-500/60 px-2 text-center">
                          No thumbnail
                        </div>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 cursor-pointer transition-colors self-start">
                      <Upload className="size-4" />
                      {state.thumbnail ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onThumbnailChange(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-5">
                    {state.prices.map((price) => {
                      const variation = price.variation;
                      const variationExtras = state.extras.filter((e) => e.variation === variation);
                      return (
                        <div key={`extras-${variation}`} className="flex flex-col gap-2">
                          <div className="flex items-end justify-between">
                            <span className={adminLabelText}>More images — {variation}</span>
                            <label className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-brand-700 hover:text-brand-500 cursor-pointer transition-colors">
                              <Plus className="size-4" /> Add
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => onAddExtras(variation, e.target.files)}
                              />
                            </label>
                          </div>
                          {variationExtras.length === 0 ? (
                            <p className="text-xs text-brand-500/70 italic">No images for {variation} yet.</p>
                          ) : (
                            <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3 list-none p-0 m-0">
                              {variationExtras.map((extra) => {
                                const url = variantUrl(extra.variant);
                                return (
                                  <li key={extra.key} className="relative group">
                                    <div className="relative aspect-square rounded-md overflow-hidden bg-accent-100 border border-accent-300/40">
                                      <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => onRemoveExtra(extra.key)}
                                      aria-label="Remove image"
                                      className="absolute top-1.5 right-1.5 size-6 rounded-full bg-white/90 text-brand-700 border border-accent-300/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:text-red-600"
                                    >
                                      <X className="size-3.5" />
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {error && (
                <p role="alert" className="text-sm text-red-600">{error}</p>
              )}
            </>
          )}
        </form>

        <Preview
          itemName={state.itemName}
          featureCollection={state.featureCollection}
          description={state.description}
          minAmount={minAmount}
          currency={previewCurrency}
          giftable={state.giftable}
          browseImageUrl={browseUrl}
          onCropBrowse={browseUrl && browseCanCrop ? () => setCropTarget({ kind: 'thumbnail', variant: 'browse' }) : undefined}
          detailImagesByVariation={detailImagesByVariation}
          availableVariations={previewVariations}
          pricesByVariation={pricesByVariation}
          onCropDetail={(target) => setCropTarget(target)}
        />
      </div>

      {cropTarget && activeCropFile && (
        <CropModal
          file={activeCropFile}
          aspect={activeCropAspect}
          initialRect={activeCropRect}
          onConfirm={onCropConfirm}
          onCancel={() => setCropTarget(null)}
        />
      )}
    </AdminShell>
  );
}
