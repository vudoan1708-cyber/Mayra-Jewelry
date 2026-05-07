'use client'

import { useEffect, useState, type FormEvent } from 'react';

import Button from '../../../components/Button';
import AdminShell from '../AdminShell';
import AutoTextarea from '../AutoTextarea';
import { useToast } from '../Toast';
import {
  adminCardPadded,
  adminEyebrow,
  adminLabel,
  adminLabelText,
  adminPageEyebrow,
  adminPageHeading,
  adminSectionTitle,
  adminTextarea,
} from '../styles';
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

function StripPreview({ text, locale, active }: { text: string; locale: 'en' | 'vi'; active: boolean }) {
  return (
    <div className="bg-white border border-accent-300/40 rounded-2xl overflow-hidden shadow-sm shadow-black/5">
      <div className="text-[10px] uppercase tracking-[0.24em] text-brand-500/60 px-4 pt-3 pb-2 flex items-center justify-between">
        <span>{locale === 'en' ? 'English' : 'Tiếng Việt'}</span>
        <span className={active ? 'text-emerald-700' : 'text-brand-500/50'}>
          {active ? 'Live' : 'Hidden'}
        </span>
      </div>
      <div className={`relative bg-brand-700 text-accent-100 p-1.5 w-full text-center uppercase text-xs tracking-[0.15em] ${active ? '' : 'opacity-40'}`}>
        <span className="text-base">📢 </span>
        {text || <span className="italic opacity-70">Empty</span>}
      </div>
    </div>
  );
}

export default function BannerEditor() {
  const { showSuccess } = useToast();
  const [state, setState] = useState<FormState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      await updateAdminBanner({
        enText: state.enText,
        viText: state.viText,
        active: state.active,
      });
      showSuccess('Banner saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10">
        <form onSubmit={onSubmit} className="flex flex-col gap-7">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className={adminPageEyebrow}>Storefront</p>
              <h1 className={adminPageHeading}>Promo banner</h1>
              <p className="text-sm text-brand-500/80 mt-1">The strip shown above the main navigation, on every page.</p>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={saving || loading}
              working={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </header>

          {loading ? (
            <p className="text-sm text-brand-500/80">Loading…</p>
          ) : (
            <>
              <section className={adminCardPadded}>
                <header className="flex flex-col gap-1">
                  <p className={adminEyebrow}>Localised copy</p>
                  <h2 className={adminSectionTitle}>What it says</h2>
                </header>

                <label className={adminLabel}>
                  <span className={adminLabelText}>English</span>
                  <AutoTextarea
                    minRows={2}
                    value={state.enText}
                    onChange={(e) => setState((s) => ({ ...s, enText: e.target.value }))}
                    placeholder="10% off all rings until Oct 20"
                    className={adminTextarea}
                  />
                </label>

                <label className={adminLabel}>
                  <span className={adminLabelText}>Vietnamese</span>
                  <AutoTextarea
                    minRows={2}
                    value={state.viText}
                    onChange={(e) => setState((s) => ({ ...s, viText: e.target.value }))}
                    placeholder="Giảm giá 10% các mẫu nhẫn đến hết 20/10"
                    className={adminTextarea}
                  />
                </label>
              </section>

              <section className={adminCardPadded}>
                <header className="flex flex-col gap-1">
                  <p className={adminEyebrow}>Visibility</p>
                  <h2 className={adminSectionTitle}>Display</h2>
                </header>

                <label className="inline-flex items-center gap-3 bg-accent-100/40 border border-accent-300/60 rounded-md px-3.5 py-3 cursor-pointer select-none w-full sm:max-w-sm">
                  <input
                    type="checkbox"
                    checked={state.active}
                    onChange={(e) => setState((s) => ({ ...s, active: e.target.checked }))}
                    className="!size-4 accent-brand-700"
                  />
                  <span className="text-sm text-brand-700">
                    {state.active ? 'Show banner to shoppers' : 'Banner is hidden from shoppers'}
                  </span>
                </label>
                <p className="text-xs text-brand-500/70">
                  When hidden, the strip disappears entirely from the storefront — no fallback text is shown.
                </p>
              </section>

              {error && (
                <p role="alert" className="text-sm text-red-600">{error}</p>
              )}
            </>
          )}
        </form>

        <aside className="flex flex-col gap-3 sticky top-6 self-start max-h-[calc(100dvh-3rem)]">
          <p className={adminEyebrow}>Preview</p>
          <StripPreview text={state.enText} locale="en" active={state.active} />
          <StripPreview text={state.viText} locale="vi" active={state.active} />
        </aside>
      </div>
    </AdminShell>
  );
}
