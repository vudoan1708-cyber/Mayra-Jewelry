import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Share2 } from 'lucide-react';

import { PAYMENT_INFO } from '../../../helpers';
import { buildSharePath } from '../../../helpers/referral';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button';
import LoginForm from '../../../components/LoginForm/LoginForm';
import { AnimatePresence } from 'framer-motion';
import { createReferralToken } from '../../../server/actions/referral';

type FetchStatus = 'idle' | 'loading' | 'done';

export default function Share({ encodedId, itemName, itemAmount, itemVariation }: { encodedId: string; itemName: string; itemAmount: number; itemVariation: string }) {
  const translateShare = useTranslations('cart.share');
  const translateLogin = useTranslations('loginForm');
  const session = useSession();
  const isAuthenticated = session.status === 'authenticated';

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [copyState, setCopyState] = useState<boolean>(false);
  const [referralToken, setReferralToken] = useState<string | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const hasFetchedRef = useRef<boolean>(false);

  const info = `${PAYMENT_INFO} ${itemName}`;
  const sharePath = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return buildSharePath({
      origin: window.location.origin,
      encodedId,
      itemAmount,
      info,
      itemVariation,
      referralToken,
    });
  }, [encodedId, itemAmount, info, itemVariation, referralToken]);

  useEffect(() => {
    if (!openModal || !isAuthenticated || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setFetchStatus('loading');
    createReferralToken(encodedId)
      .then((result) => {
        if (result.status === 'ok') setReferralToken(result.token);
        setFetchStatus('done');
      })
      .catch(() => {
        setFetchStatus('done');
      });
  }, [openModal, isAuthenticated, encodedId]);

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

  const redirectTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-accent-600 underline decoration-accent-500/70 hover:decoration-accent-600 underline-offset-4 transition-colors"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenModal(true); }}
      >
        <Share2 size={14} strokeWidth={1.75} style={{ width: 14, height: 14, flexShrink: 0 }} />
        {translateShare('trigger')}
      </button>
      <AnimatePresence mode="wait">
        {openModal && (
          <Modal
            title={translateShare('title')}
            className="!min-w-[320px] md:!min-w-[36em]"
            onClose={() => { setOpenModal(false); }}
          >
            {isAuthenticated ? (
              <div className="flex gap-2 items-center w-full bg-accent-200/40 border border-accent-500/30 p-2 rounded-xl">
                <div className="whitespace-nowrap overflow-hidden text-ellipsis flex-1 text-sm text-brand-700/80 px-1">{sharePath}</div>
                <Button
                  variant="secondary"
                  className="!text-brand-700 !border-accent-500/40 hover:!text-brand-700 hover:!border-accent-500 hover:bg-accent-300/40 text-xs uppercase tracking-[0.2em] px-4 py-2"
                  onClick={() => { copyToClipboard(sharePath); }}
                  working={fetchStatus === 'loading'}
                >
                  {copyState ? translateShare('copied') : translateShare('copy')}
                </Button>
              </div>
            ) : (
              <LoginForm title={translateLogin('featureTitle')} redirectTo={redirectTo} />
            )}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
