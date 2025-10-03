import Image from 'next/image';

export default function PaymentSection({ qrCode, loading }: { qrCode: string, loading: boolean }) {
  if (loading && !qrCode) return null;
  return (
    <section className="flex justify-center">
      <Image src={qrCode} alt="Test" width="450" height="450" className="bg-transparent" />
    </section>
  )
}
