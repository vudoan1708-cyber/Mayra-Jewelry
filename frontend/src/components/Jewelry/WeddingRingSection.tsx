'use client'

import Button from '../Button';

export default function WeddingRingSection() {
  return (
    <div className="mt-3 p-6 flex gap-4 flex-wrap items-start">
      <img
        alt="ring on someone's finger"
        src="https://pixabay.com/get/g501286bbe73700547dd862dd7c9896010c94895bbcc596947161eb0087a8ab96339f2eff1cc5ef54cbbf4f2d3530ce89b12bbd30bd72d794aecc76db592ded0da2a9ca759e4625cd28ea13f3180bcb0b_640.jpg"
        width="640"
        height="426"
        className="rounded-md object-contain" />
      <div className="flex-1 flex flex-col gap-4">
        <h3 className="text-3xl">Đám cưới sắp tới rồi, mình phải làm sao?</h3>
        <div>
          <p>Không gì phải lo cả, đã có Mayra lo liệu.</p>
          <p><a href="https://www.facebook.com/mayrajewelry.insaigon" target="_blank"><u>Liên lạc trực tiếp với shop</u></a> để được tư vấn cụ thể về nhẫn trùng với sở thích màu sắc, và cá tính của bạn ạ.</p>
        </div>
        <Button variant="primary" onClick={() => {}}>Tham khảo thêm các loại nhẫn cưới</Button>
      </div>
    </div>
  )
}
