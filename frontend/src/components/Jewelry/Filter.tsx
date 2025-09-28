'use client'

import { useEffect, useRef, useState, type RefObject } from 'react';
import ReactDOM from 'react-dom';

import { motion } from 'framer-motion';

import { SlidersHorizontal, X } from 'lucide-react';

import Button from '../Button';

export default function Filter() {
  const [ openFilter, setOpenFilter ] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  function FilterModal({ ref }: { ref: RefObject<HTMLDivElement | null> }) {
    return (
      <motion.div
        initial={{ backgroundColor: 'var(--backdrop-color)' }}
        animate={{ backgroundColor: 'var(--transparent-black)', transition: { duration: 0.2 } }}
        className="fixed w-dvw h-dvh left-0 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          style={{ transformOrigin: 'left' }}
          ref={ref}
          className="absolute w-full md:w-96 top-0 md:top-[48px] h-dvh bg-white">
          <header className="uppercase p-4 flex justify-between items-center">
            Filter
            <Button variant="tertiary" onClick={() => { setOpenFilter(false); }}><X /></Button>
          </header>
          <hr />
        </motion.div>
      </motion.div>
    )
  }

  const clickOnBody = (e: PointerEvent) => {
    if (!modalRef.current?.contains(e.target as Node)) {
      setOpenFilter(false);
    }
  };
  const escKey = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      setOpenFilter(false);
    }
  };

  useEffect(() => {
    if (openFilter) {
      document.body.addEventListener('click', clickOnBody);
      document.body.addEventListener('keyup', escKey);
    } else {
      document.body.removeEventListener('click', clickOnBody);
      document.body.removeEventListener('keyup', escKey);
    }

    return () => {
      document.body.removeEventListener('click', clickOnBody);
      document.body.removeEventListener('keyup', escKey);
    }
  }, [openFilter]);
  return (
    <>
      <Button variant="tertiary" className="text-left self-start m-4 p-0" onClick={() => { setOpenFilter(!openFilter); }}>
        <div className="flex gap-2 items-center uppercase text-gray-500">
          Filter
          <SlidersHorizontal />
        </div>
      </Button>

      {openFilter && ReactDOM.createPortal(
        <FilterModal ref={modalRef} />,
        document.body,
      )}
    </>
  )
}
