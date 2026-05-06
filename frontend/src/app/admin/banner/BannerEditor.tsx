'use client'

import { useEffect, useState, type FormEvent } from 'react';

import AdminShell from '../AdminShell';
import AutoTextarea from '../AutoTextarea';
import { getPublicBanner, updateAdminBanner } from '../api';

type FormState = {
  enText: string;
  viText: string;
  active: boolean;
};

const defaultState: FormState = {
  enText: '',
  viText: '',
  active: true,
};

function BannerStripPreview({ text, locale, active }: { text: string; locale: 'en' | 'vi'; active: boolean }) {
  return (
    <div className="bg-white border border-accent-300/40 rounded-2xl overflow-hidden">
      <div className="text-[10px] uppercase tracking-[0.24em] text-brand-500/70 px-4 pt-3 pb-1">
        {locale === 'en' ? 'English' : 'Tiếng Việt'}
      </div>
      <div className={`relative bg-brand-700 text-accent-100 p-1 w-full text-center uppercase text-xs tracking-[0.15em] ${active ? '' : 'opacity-50'}`}>
        <span className="text-base">📢 </span>
        {text || <span className="italic opacity-70">Empty</span>}
      </div>
      {!active && (
        <div className="px-4 py-2 text-xs text-brand-500/70">
          The banner is currently hidden from shoppers.
        </div>
      )}
    </div>
  );
}

export default function BannerEditor() {
  const [state, setState] = useState<FormState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getPublicBanner()
      .then((banner) => {
        if (banner) {
          setState({ enText: banner.enText, viText: banner.viText, active: banner.active });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateAdminBanner({
        enText: state.enText,
        viText: state.viText,
        active: state.active,
      });
      setSuccess('Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-brand-700">Banner</h1>
              <p className="text-sm text-brand-500/80 mt-1">The promo strip shown above the storefront nav.</p>
            </div>
            <button
              type="submit"
              disabled={saving || loading}
              className="bg-brand-700 text-accent-100 uppercase tracking-[0.2em] text-xs px-5 py-2.5 rounded-md hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </header>

          {loading ? (
            <p className="text-sm text-brand-500/80">Loading…</p>
          ) : (
            <section className="bg-white border border-accent-300/40 rounded-2xl p-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-brand-500/80">English text</span>
                <AutoTextarea
                  minRows={2}
                  value={state.enText}
                  onChange={(e) => setState((s) => ({ ...s, enText: e.target.value }))}
                  placeholder="10% off all rings until Oct 20"
                  className="bg-white border border-accent-300/60 rounded-md px-3 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500 resize-none overflow-hidden leading-6"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-brand-500/80">Vietnamese text</span>
                <AutoTextarea
                  minRows={2}
                  value={state.viText}
                  onChange={(e) => setState((s) => ({ ...s, viText: e.target.value }))}
                  placeholder="Giảm giá 10% các mẫu nhẫn đến hết 20/10"
                  className="bg-white border border-accent-300/60 rounded-md px-3 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500 resize-none overflow-hidden leading-6"
                />
              </label>

              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={state.active}
                  onChange={(e) => setState((s) => ({ ...s, active: e.target.checked }))}
                  className="!size-4 accent-brand-700"
                />
                <span className="text-brand-500/80">Show banner to shoppers</span>
              </label>

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {success && !error && <p className="text-sm text-emerald-700">{success}</p>}
            </section>
          )}
        </form>

        <aside className="flex flex-col gap-4 sticky top-6 self-start">
          <header className="text-[10px] uppercase tracking-[0.32em] text-brand-500/70">Storefront preview</header>
          <BannerStripPreview text={state.enText} locale="en" active={state.active} />
          <BannerStripPreview text={state.viText} locale="vi" active={state.active} />
        </aside>
      </div>
    </AdminShell>
  );
}
