'use client'

import Image from 'next/image';
import { useState, type DOMAttributes } from 'react';

import { AnimatePresence } from 'framer-motion';

import Button from '../Button';
import Modal from '../Modal/Modal';

import { verifyingOrder } from '../../server/data';
import type { JewelryItemInfo } from '../../../types';

export default function QRCodeImage({
  qrCode, loading, items, userId,
}: {
  qrCode: string; loading: boolean; items: Array<Partial<JewelryItemInfo>>; userId: string
}) {
  const [confirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);

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
      await verifyingOrder({
        buyerId: userId ?? '',
        buyerName: name,
        digits: partialAccountNumber,
        jewelryItems: items,
      })
    } catch (e) {
      alert(e.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return null;
  if (!qrCode) return null;
  return (
    <section className="w-full md:w-auto flex flex-col items-center md:items-start">
      <Image src={qrCode} alt="Test" width="450" height="450" className="bg-transparent" />
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
