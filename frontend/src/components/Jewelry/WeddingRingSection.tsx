'use client'

import { useRouter } from 'next/navigation';
import Button from '../Button';

export default function WeddingRingSection() {
  const router = useRouter();
  return (
    <div className="p-6 flex gap-4 flex-wrap items-start h-screen snap-start">
      <img
        alt="ring on someone's finger"
        src="images/wedding-ring.webp"
        width="640"
        height="426"
        className="rounded-md object-contain shadow-sm" />
      <div className="flex-1 flex flex-col gap-4">
        <h3 className="text-3xl font-medium">Đám cưới sắp tới rồi, mình phải làm sao?</h3>
        <div>
          <p>Không gì phải lo cả, đã có Mayra lo liệu.</p>
          <p><a href="https://www.facebook.com/mayrajewelry.insaigon" target="_blank"><u>Liên lạc trực tiếp với shop</u></a> để được tư vấn cụ thể về nhẫn trùng với sở thích màu sắc, và cá tính của bạn ạ.</p>
          <p className="mt-1">Nếu bạn đã biết được loại nhẫn mà bản thân muốn sở hữu, hãy nhấp vào nút bên dưới để khám phá ạ.</p>
        </div>
        <Button variant="primary" onClick={() => { router.push('/collections/wedding-rings'); }}>
          Tham khảo thêm các loại nhẫn cưới
        </Button>
      </div>
    </div>
  )
}
