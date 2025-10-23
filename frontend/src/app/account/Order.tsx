'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { JewelryItemInfo, Order } from '../../../types';
import { ENGLISH_TO_VIETNAMESE, ORDER_STATUS } from '../../helpers';

export default function Order({ item, order, idx }: { item: JewelryItemInfo; order: Order, idx: number }) {
  const router = useRouter();
  const DotStatus = () => {
    if (order.status === ORDER_STATUS.PENDING_VERIFICATION) {
      return <div className="rounded-full w-[20px] h-[20px] p-1 bg-yellow-400 animate-glow"></div>
    }

    return (
      <DotLottieReact
        src="https://lottie.host/bfb3f3c0-6319-482f-90a0-e774c665b65e/US0OjVQhI9.lottie"
        renderConfig={{ autoResize: true }}
        className="w-10 h-10 p-0 mr-[-10px]"
        autoplay
      />
    )
  };
  return (
    <div className="flex items-start gap-1 overflow-hidden">
      <div className="cursor-pointer hover:scale-105 transition-all">
        <Image
          alt={item.itemName}
          src={item.media.find((file) => file.url.includes('thumbnail'))?.url ?? ''}
          width="200"
          height="200"
          className="relative object-cover rounded-md "
          onClick={() => { router.push(`/product/${item.directoryId}`); }}
      />
      </div>
      <div className="flex flex-col gap-1">
        <strong>{item.itemName}</strong>
        <span><strong>Số lượng mua:</strong> {order.orderJewelryItems[idx].quantity}</span>
        <div className="flex flex-col gap-1">
          <strong>Trạng thái đơn hàng:</strong> 
          <div className="flex gap-2 items-center flex-wrap">
            <DotStatus />
            {ENGLISH_TO_VIETNAMESE[order.status]}
          </div>
        </div>
      </div>
    </div>
  )
}
