'use client'

import { useEffect, useRef, useState, type RefObject } from 'react';
import ReactDOM from 'react-dom';

import { SlidersHorizontal, X } from 'lucide-react';

import Button from '../Button';

export default function Filter() {
  const [ openFilter, setOpenFilter ] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  function FilterModal({ ref }: { ref: RefObject<HTMLDivElement | null> }) {
    return (
      <div className="fixed w-dvw h-dvh left-0 bg-transparent-black backdrop-blur-md transition-all">
        <div ref={ref} className="relative w-full md:w-96 top-[48px] h-dvh bg-white">
          <header className="uppercase p-4 flex justify-between items-center">
            Filter
            <Button variant="tertiary" onClick={() => { setOpenFilter(false); }}><X /></Button>
          </header>
          <hr />
        </div>
      </div>
    )
  }

  const clickOnBody = (e: PointerEvent) => {
    if (!modalRef.current?.contains(e.target as Node)) {
      setOpenFilter(false);
    }
  };

  useEffect(() => {
    if (openFilter) {
      document.body.classList.add('overflow-hidden');
      document.body.addEventListener('click', clickOnBody);
    } else {
      document.body.classList.remove('overflow-hidden');
      document.body.removeEventListener('click', clickOnBody);
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
      document.body.removeEventListener('click', clickOnBody);
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
