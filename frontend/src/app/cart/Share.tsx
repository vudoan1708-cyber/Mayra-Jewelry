import { useCallback, useState } from 'react';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { PAYMENT_INFO } from '../../helpers';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button';
import { AnimatePresence } from 'framer-motion';

export default function Share({ encryptedId, itemAmount, itemVariation }: { encryptedId: string, itemAmount: number, itemVariation: string }) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [copyState, setCopyState] = useState<boolean>(false);

  const info = PAYMENT_INFO;
  const sharePath = `${window.location.origin}/product/${encryptedId ?? ''}?amount=${itemAmount}&info=${info}&variation=${itemVariation}`;

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
    } catch (err: any) {
      setCopyState(false);
      toast.error(err);
      return false;
    }
  }, []);
  return (
    <>
      <a onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenModal(true);  }}>Chia sẻ</a>
      <AnimatePresence mode="wait">
        {openModal && (
          <Modal title="Chia sẻ với bạn bè của bạn" className="min-w-[340px] md:min-w-[36em]" onClose={() => { setOpenModal(false); }}>
            <div className="flex gap-2 items-center w-full border border-gray-500 p-1 px-2 rounded-md">
              <div className="whitespace-nowrap overflow-hidden text-ellipsis w-[200px] md:w-[25em]">{sharePath}</div>
              <Button variant="secondary" className="text-sm" onClick={() => { copyToClipboard(sharePath); }}>
                {copyState ? 'Đã sao chép' : 'Sao chép link'}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <ToastContainer aria-label="Added to cart" position="bottom-left" />
    </>
  )
}
