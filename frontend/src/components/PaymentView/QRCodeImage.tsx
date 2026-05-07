'use client'

import Image from 'next/image';
import { useState, type DOMAttributes } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import Button from '../Button';
import Modal from '../Modal/Modal';

import { requestVerifyingOrder } from '../../server/data';
import type { JewelryItemInfo } from '../../../types';
import { useRouter } from 'next/navigation';

export default function QRCodeImage({
  qrCode,
  loading,
  items,
  userId,
  userEmail,
  totalAmount,
  onSuccessfulConfirmation,
}: {
  qrCode: string;
  loading: boolean;
  items: Array<Partial<JewelryItemInfo>>;
  userId: string;
  userEmail: string;
  totalAmount: string;
  onSuccessfulConfirmation?: () => void;
}) {
  const router = useRouter();
  const t = useTranslations('payment');
  const [confirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(!userId);

  const [partialAccountNumber, setPartialAccountNumber] = useState<string>('');
  const [name, setName] = useState<string>('');

  const onNameInput: DOMAttributes<HTMLInputElement>['onInput'] = (e) => {
    const input = e.target as HTMLInputElement;
    const {value} = input;
    setName(value);
    setDisabled(() => partialAccountNumber.length < 5 || !value);
  }
  const onDigitInput: DOMAttributes<HTMLInputElement>['onInput'] = (e) => {
    const input = e.target as HTMLInputElement;
    const {value} = input;
    setPartialAccountNumber(value);
    setDisabled(() => !name || value.length < 5);
  };

  const closeModal = () => {
    setOpenConfirmModal(false);
    setName('');
    setPartialAccountNumber('');
    setDisabled(true);
  }

  const sendConfirmation = async () => {
    try {
      setVerifying(true);
      console.log('userEmail', userEmail)
      await requestVerifyingOrder({
        buyerId: userId || (userEmail ? window.btoa(userEmail) : 'anonymous'),
        buyerEmail: userEmail || 'anonymous',
        buyerName: name,
        digits: partialAccountNumber,
        jewelryItems: items,
        totalAmount,
      })
      closeModal();
      if (onSuccessfulConfirmation) {
        onSuccessfulConfirmation();
      }
    } catch (e) {
      alert((e as { message: string }).message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return null;
  if (!qrCode) return null;
  return (
    <section className="relative w-full md:w-auto flex flex-col items-center md:items-start gap-3">
      <div className="relative bg-accent-100 rounded-2xl p-2 shadow-xl shadow-black/30 border border-accent-300/40">
        <Image src={qrCode} alt="Test" width="450" height="450" className="bg-transparent rounded-lg" />
      </div>
      {showWarning && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-brand-700/70 backdrop-blur-sm flex flex-col gap-3 items-center justify-center text-center p-2 rounded-lg">
          <div className="grid grid-rows-[auto_auto] gap-3 p-4 bg-accent-100 border border-accent-300/40 rounded-2xl shadow-xl shadow-black/40 max-w-[300px] text-brand-700">
            <h3 className="text-base leading-snug">{t('loginPromptForOrders')}</h3>
            <span className="inline-grid gap-2 items-center">
              <Button
                variant="secondary"
                className="!text-brand-700 !border-accent-500/40 hover:!text-brand-700 hover:!border-accent-500 hover:bg-accent-300/40 text-xs uppercase tracking-[0.25em] py-2"
                onClick={() => { setShowWarning(false); }}
              >
                {t('later')}
              </Button>
              <Button
                variant="primary"
                className="text-xs py-2"
                onClick={() => { router.push(`/account?autoSignin=true&from=${window.btoa(window.location.href)}`); }}
              >
                {t('signIn')}
              </Button>
            </span>
          </div>
        </motion.div>
      )}
      <div className="flex gap-1 items-center justify-center w-full">
        <Button
          variant="primary"
          onClick={() => { setOpenConfirmModal(true); }}
        >
          {t('confirmTransfer')}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {confirmModal && (
          <Modal title={t('confirmModalTitle')} className="w-[320px]" onClose={() => { closeModal(); }}>
            <div>
              <header>
                {t('confirmModalBodyPrefix')} <b>{t('confirmModalBodySender')}</b> {t('confirmModalBodyAnd')} <b>{t('confirmModalBodyDigits')} </b>
                {t('confirmModalBodySuffix')}
              </header>
              <input type="text" placeholder={t('namePlaceholder')} pattern="/[a-zA-Z]/gi" className="my-1 h-[50px] p-1 text-2xl font-semibold text-center rounded-sm w-full" autoFocus onInput={onNameInput} />
              <input type="text" placeholder="01234" pattern="/[0-9]/g" maxLength={5} className="my-1 h-[50px] p-1 text-2xl font-semibold text-center rounded-sm w-full" onInput={onDigitInput } />
            </div>
            <div className="w-full flex gap-2 items-center justify-end mt-2">
              <Button
                variant="secondary"
                className="!text-brand-700 !border-accent-500/40 hover:!text-brand-700 hover:!border-accent-500 hover:bg-accent-300/40 text-xs uppercase tracking-[0.25em] py-2 px-4"
                disabled={verifying}
                working={verifying}
                onClick={() => { closeModal(); }}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                className="text-xs py-2 px-4"
                disabled={disabled || verifying}
                working={verifying}
                onClick={() => { sendConfirmation(); }}
              >
                {t('confirm')}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </section>
  )
}
