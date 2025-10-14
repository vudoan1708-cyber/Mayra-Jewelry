'use client'

import Image from 'next/image';
import Button from '../Button';

export default function QRCodeImage({ qrCode, loading }: { qrCode: string, loading: boolean }) {
  if (loading) return null;
  if (!qrCode) return null;
  return (
    <section className="w-full md:w-auto flex flex-col items-center md:items-start">
      <Image src={qrCode} alt="Test" width="450" height="450" className="bg-transparent" />
      <div className="flex gap-1 items-center justify-center w-full">
        <Button variant="primary" onClick={() => {}}>
          Xác nhận chuyển khoản
        </Button>
      </div>
    </section>
  )
}
