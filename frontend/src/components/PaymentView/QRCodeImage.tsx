'use client'

import Image from 'next/image';
import { useState, type DOMAttributes } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

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
    <section className="relative w-full md:w-auto flex flex-col items-center md:items-start">
      <Image src={qrCode} alt="Test" width="450" height="450" className="bg-transparent" />
      {showWarning && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute w-full h-full bg-transparent-white flex flex-col gap-3 items-center justify-center text-center text-black p-1 rounded-md">
          <div className="grid grid-rows-2 p-1 bg-[rgba(255,255,255,.75)] rounded-lg">
            <h3>Bạn có thể theo dõi trạng thái order nếu đăng nhập trước khi mua hàng.</h3>
            <span className="inline-grid gap-1 items-center ">
              <Button variant="secondary" onClick={() => { setShowWarning(false); }}>Không cần</Button>
              <Button variant="primary" onClick={() => { router.push(`/account?autoSignin=true&from=${window.btoa(window.location.href)}`); }}>Đăng nhập</Button>
            </span>
          </div>
        </motion.div>
      )}
      <div className="flex gap-1 items-center justify-center w-full">
        <Button variant="primary" onClick={() => { setOpenConfirmModal(true); }}>
          Xác nhận chuyển khoản
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {confirmModal && (
          <Modal title="Xác nhận chuyển khoản" className="w-[320px]" onClose={() => { closeModal(); }}>
            <div>
              <header>
                Để shop có thể xác minh việc chuyển khoản, xin vui lòng ghi chú <b>tên của người chuyển khoản</b> và <b>5 số cuối </b>
                trên số tài khoản bạn đã sử dụng cho việc chuyển khoản để shop kiểm chứng lại
              </header>
              <input type="text" placeholder="Đoàn Khánh Hương" pattern="/[a-zA-Z]/gi" className="my-1 h-[50px] p-1 text-2xl font-semibold text-center rounded-sm w-full" autoFocus onInput={onNameInput} />
              <input type="text" placeholder="01234" pattern="/[0-9]/g" maxLength={5} className="my-1 h-[50px] p-1 text-2xl font-semibold text-center rounded-sm w-full" onInput={onDigitInput } />
            </div>
            <div className="w-full flex gap-1 items-center justify-end mt-1">
              <Button variant="secondary" className="p-1" disabled={verifying} working={verifying} onClick={() => { closeModal(); }}>Huỷ</Button>
              <Button variant="primary" className="p-1" disabled={disabled || verifying} working={verifying} onClick={() => { sendConfirmation(); }}>Xác nhận</Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </section>
  )
}
