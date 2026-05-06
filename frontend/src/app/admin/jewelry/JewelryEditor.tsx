'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Plus, Trash2, Upload, X } from 'lucide-react';

import AdminShell from '../AdminShell';
import AutoTextarea from '../AutoTextarea';
import Preview from './Preview';
import {
  type AdminJewelry,
  type AdminJewelryPrice,
  createAdminJewelry,
  deleteAdminJewelryMedia,
  getAdminJewelry,
  updateAdminJewelry,
  uploadAdminJewelryMedia,
} from '../api';

type ImageSlot =
  | { kind: 'existing'; url: string; fileName: string }
  | { kind: 'new'; file: File; blobUrl: string }
  | null;

type ExtraSlot =
  | { kind: 'existing'; url: string; fileName: string; key: string }
  | { kind: 'new'; file: File; blobUrl: string; key: string };

type EditorState = {
  itemName: string;
  description: string;
  featureCollection: string;
  giftable: boolean;
  prices: AdminJewelryPrice[];
  thumbnail: ImageSlot;
  extras: ExtraSlot[];
  removedFileNames: string[];
};

const VARIATIONS: AdminJewelryPrice['variation'][] = ['Silver', 'Gold', 'White Gold'];

const defaultState: EditorState = {
  itemName: '',
  description: '',
  featureCollection: '',
  giftable: true,
  prices: [{ variation: 'Silver', amount: 0, currency: 'VND', discount: 0 }],
  thumbnail: null,
  extras: [],
  removedFileNames: [],
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const stripPrefix = (fileName: string, directoryId: string) => {
  if (fileName.startsWith(`${directoryId}/`)) return fileName.slice(directoryId.length + 1);
  const parts = fileName.split('/');
  return parts[parts.length - 1];
};

const mediaToState = (item: AdminJewelry): Pick<EditorState, 'thumbnail' | 'extras'> => {
  let thumbnail: ImageSlot = null;
  const extras: ExtraSlot[] = [];
  item.media.forEach((m, idx) => {
    if (m.fileName.endsWith('file-thumbnail')) {
      thumbnail = { kind: 'existing', url: m.url, fileName: m.fileName };
    } else {
      extras.push({ kind: 'existing', url: m.url, fileName: m.fileName, key: `existing-${idx}` });
    }
  });
  return { thumbnail, extras };
};

export default function JewelryEditor({ directoryId }: { directoryId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(directoryId);

  const [state, setState] = useState<EditorState>(defaultState);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
          prices: item.prices.length > 0 ? item.prices : defaultState.prices,
          thumbnail,
          extras,
          removedFileNames: [],
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
      const removed = [...s.removedFileNames];
      if (s.thumbnail?.kind === 'existing') removed.push(s.thumbnail.fileName);
      return {
        ...s,
        thumbnail: { kind: 'new', file, blobUrl },
        removedFileNames: removed,
      };
    });
  };

  const onAddExtras = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const additions: ExtraSlot[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blobUrl = URL.createObjectURL(file);
      trackBlob(blobUrl);
      additions.push({ kind: 'new', file, blobUrl, key: makeId() });
    }
    setState((s) => ({ ...s, extras: [...s.extras, ...additions] }));
  };

  const onRemoveExtra = (key: string) => {
    setState((s) => {
      const removing = s.extras.find((e) => e.key === key);
      if (!removing) return s;
      const removedFileNames = [...s.removedFileNames];
      if (removing.kind === 'existing') removedFileNames.push(removing.fileName);
      return {
        ...s,
        extras: s.extras.filter((e) => e.key !== key),
        removedFileNames,
      };
    });
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
    setState((s) => ({ ...s, prices: s.prices.filter((_, i) => i !== idx) }));
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
    setSuccess(null);
    try {
      if (!isEdit) {
        const fd = new FormData();
        fd.append('itemName', state.itemName);
        fd.append('description', state.description);
        fd.append('featureCollection', state.featureCollection);
        fd.append('giftable', String(state.giftable));
        fd.append('currency', state.prices[0]?.currency ?? 'VND');
        fd.append('prices', JSON.stringify(state.prices));
        fd.append('type', 'ring');
        if (state.thumbnail?.kind === 'new') {
          fd.append('file-thumbnail', state.thumbnail.file);
        }
        state.extras.forEach((extra) => {
          if (extra.kind === 'new') fd.append(`extra-${extra.key}`, extra.file);
        });
        const res = await createAdminJewelry(fd);
        const newId = res?.directoryId;
        if (newId) {
          router.push(`/admin/jewelry/${encodeURIComponent(newId)}`);
          return;
        }
        setSuccess('Created.');
      } else {
        await updateAdminJewelry(directoryId!, {
          itemName: state.itemName,
          description: state.description,
          featureCollection: state.featureCollection,
          giftable: state.giftable,
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
        let hasNew = false;
        if (state.thumbnail?.kind === 'new') {
          fd.append('file-thumbnail', state.thumbnail.file);
          hasNew = true;
        }
        state.extras.forEach((extra) => {
          if (extra.kind === 'new') {
            fd.append(`extra-${extra.key}`, extra.file);
            hasNew = true;
          }
        });
        if (hasNew) await uploadAdminJewelryMedia(directoryId!, fd);

        setSuccess('Saved.');
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
  const thumbnailUrl = state.thumbnail
    ? state.thumbnail.kind === 'existing' ? state.thumbnail.url : state.thumbnail.blobUrl
    : null;
  const extraImageUrls = state.extras.map((e) => e.kind === 'existing' ? e.url : e.blobUrl);

  return (
    <AdminShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl text-brand-700">{isEdit ? 'Edit piece' : 'New piece'}</h1>
            <button
              type="submit"
              disabled={saving || loading}
              className="bg-brand-700 text-accent-100 uppercase tracking-[0.2em] text-xs px-5 py-2.5 rounded-md hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </button>
          </header>

          {loading ? (
            <p className="text-sm text-brand-500/80">Loading…</p>
          ) : (
            <>
              <section className="bg-white border border-accent-300/40 rounded-2xl p-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-brand-500/80">Item name</span>
                  <input
                    type="text"
                    required
                    value={state.itemName}
                    onChange={(e) => setState((s) => ({ ...s, itemName: e.target.value }))}
                    className="bg-white border border-accent-300/60 rounded-md px-3 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-brand-500/80">Description</span>
                  <AutoTextarea
                    minRows={4}
                    value={state.description}
                    onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
                    className="bg-white border border-accent-300/60 rounded-md px-3 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500 resize-none overflow-hidden leading-6"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-brand-500/80">Feature collection</span>
                  <input
                    type="text"
                    value={state.featureCollection}
                    onChange={(e) => setState((s) => ({ ...s, featureCollection: e.target.value }))}
                    className="bg-white border border-accent-300/60 rounded-md px-3 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500"
                  />
                </label>

                <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={state.giftable}
                    onChange={(e) => setState((s) => ({ ...s, giftable: e.target.checked }))}
                    className="!size-4 accent-brand-700"
                  />
                  <span className="text-brand-500/80">Giftable</span>
                </label>
              </section>

              <section className="bg-white border border-accent-300/40 rounded-2xl p-6 flex flex-col gap-4">
                <header className="flex items-center justify-between">
                  <h2 className="text-base text-brand-700">Prices</h2>
                  <button
                    type="button"
                    onClick={addPrice}
                    disabled={state.prices.length >= VARIATIONS.length}
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 disabled:opacity-40"
                  >
                    <Plus className="size-3.5" /> Add variation
                  </button>
                </header>
                <ul className="flex flex-col gap-3 list-none p-0 m-0">
                  {state.prices.map((price, idx) => (
                    <li key={`${price.variation}-${idx}`} className="grid grid-cols-[1fr_1fr_90px_80px_auto] gap-2 items-end">
                      <label className="flex flex-col gap-1 text-xs">
                        <span className="text-brand-500/70">Variation</span>
                        <select
                          value={price.variation}
                          onChange={(e) => updatePrice(idx, { variation: e.target.value as AdminJewelryPrice['variation'] })}
                          className="bg-white border border-accent-300/60 rounded-md px-2 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500"
                        >
                          {VARIATIONS.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs">
                        <span className="text-brand-500/70">Amount</span>
                        <input
                          type="number"
                          min={0}
                          required
                          value={price.amount}
                          onChange={(e) => updatePrice(idx, { amount: Number(e.target.value) })}
                          className="bg-white border border-accent-300/60 rounded-md px-2 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs">
                        <span className="text-brand-500/70">Currency</span>
                        <input
                          type="text"
                          value={price.currency}
                          onChange={(e) => updatePrice(idx, { currency: e.target.value.toUpperCase() })}
                          className="bg-white border border-accent-300/60 rounded-md px-2 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500 uppercase"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs">
                        <span className="text-brand-500/70">Discount</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          max={1}
                          value={price.discount}
                          onChange={(e) => updatePrice(idx, { discount: Number(e.target.value) })}
                          className="bg-white border border-accent-300/60 rounded-md px-2 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removePrice(idx)}
                        disabled={state.prices.length <= 1}
                        className="size-9 flex items-center justify-center text-brand-500/70 hover:text-red-600 disabled:opacity-30"
                        aria-label="Remove price row"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white border border-accent-300/40 rounded-2xl p-6 flex flex-col gap-4">
                <h2 className="text-base text-brand-700">Thumbnail</h2>
                <div className="flex items-start gap-4">
                  <div className="relative size-32 rounded-md overflow-hidden bg-accent-100 shrink-0">
                    {thumbnailUrl ? (
                      <Image src={thumbnailUrl} alt="thumbnail" fill sizes="128px" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-brand-500/60 px-2 text-center">
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 cursor-pointer">
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
              </section>

              <section className="bg-white border border-accent-300/40 rounded-2xl p-6 flex flex-col gap-4">
                <header className="flex items-center justify-between">
                  <h2 className="text-base text-brand-700">More images</h2>
                  <label className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 cursor-pointer">
                    <Plus className="size-4" /> Add
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => onAddExtras(e.target.files)}
                    />
                  </label>
                </header>
                {state.extras.length === 0 ? (
                  <p className="text-xs text-brand-500/70">No extra images yet.</p>
                ) : (
                  <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3 list-none p-0 m-0">
                    {state.extras.map((extra) => {
                      const url = extra.kind === 'existing' ? extra.url : extra.blobUrl;
                      return (
                        <li key={extra.key} className="relative group">
                          <div className="relative aspect-square rounded-md overflow-hidden bg-accent-100">
                            <Image src={url} alt="" fill sizes="128px" className="object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveExtra(extra.key)}
                            aria-label="Remove image"
                            className="absolute top-1 right-1 size-6 rounded-full bg-white/90 text-brand-700 border border-accent-300/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {error && (
                <p role="alert" className="text-sm text-red-600">{error}</p>
              )}
              {success && !error && (
                <p className="text-sm text-emerald-700">{success}</p>
              )}
            </>
          )}
        </form>

        <Preview
          itemName={state.itemName}
          featureCollection={state.featureCollection}
          description={state.description}
          thumbnailUrl={thumbnailUrl}
          extraImageUrls={extraImageUrls}
          minAmount={minAmount}
          currency={previewCurrency}
          giftable={state.giftable}
        />
      </div>
    </AdminShell>
  );
}
