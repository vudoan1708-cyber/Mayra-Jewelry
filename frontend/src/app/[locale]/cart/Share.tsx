import { useCallback, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';
import { Share2 } from 'lucide-react';

import { PAYMENT_INFO } from '../../../helpers';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button';
import { AnimatePresence } from 'framer-motion';

export default function Share({ encodedId, itemName, itemAmount, itemVariation }: { encodedId: string; itemName: string; itemAmount: number; itemVariation: string }) {
  const t = useTranslations('cart.share');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [copyState, setCopyState] = useState<boolean>(false);

  const info = `${PAYMENT_INFO} ${itemName}`;
  const sharePath = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/product/${encodedId ?? ''}?amount=${itemAmount}&info=${info}&variation=${itemVariation}`;
  }, [encodedId, itemAmount, info, itemVariation]);

  const copyToClipboard = useCallback(async (text: string) => {
    if (typeof window === 'undefined') {
      console.error('No window API');
      return false;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('execCommand failed');
      }
      setCopyState(true);
      const timeout = setTimeout(() => {
        setOpenModal(false);
        clearTimeout(timeout);
      }, 1000);
      return true;
    } catch {
      setCopyState(false);
      return false;
    }
  }, []);
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-accent-600 underline decoration-accent-500/70 hover:decoration-accent-600 underline-offset-4 transition-colors"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenModal(true); }}
      >
        <Share2 size={14} strokeWidth={1.75} style={{ width: 14, height: 14, flexShrink: 0 }} />
        {t('trigger')}
      </button>
      <AnimatePresence mode="wait">
        {openModal && (
          <Modal title={t('title')} className="!min-w-[320px] md:!min-w-[36em]" onClose={() => { setOpenModal(false); }}>
            <div className="flex gap-2 items-center w-full bg-accent-200/40 border border-accent-500/30 p-2 rounded-xl">
              <div className="whitespace-nowrap overflow-hidden text-ellipsis flex-1 text-sm text-brand-700/80 px-1">{sharePath}</div>
              <Button
                variant="secondary"
                className="!text-brand-700 !border-accent-500/40 hover:!text-brand-700 hover:!border-accent-500 hover:bg-accent-300/40 text-xs uppercase tracking-[0.2em] px-4 py-2"
                onClick={() => { copyToClipboard(sharePath); }}
              >
                {copyState ? t('copied') : t('copy')}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
