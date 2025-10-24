'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { motion } from 'framer-motion';

import { format } from 'date-fns';

import type { JewelryItemInfo, Order } from '../../../types';
import { ENGLISH_TO_VIETNAMESE, ORDER_STATUS } from '../../helpers';

export default function Order({ item, order, idx }: { item: JewelryItemInfo; order: Order, idx: number }) {
  const router = useRouter();
  const DotStatus = () => {
    if (order.status === ORDER_STATUS.PENDING_VERIFICATION) {
      return <div className="rounded-full w-[20px] h-[20px] p-1 ml-[10px] bg-yellow-400 animate-glow"></div>
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
    <div className="flex items-start gap-1 overflow-hidden border border-top-1 rounded-md">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: .4, type: 'keyframes' } }}
        whileHover={{ scale: 1.05, transition: { type: 'spring' } }}
        className="cursor-pointer">
        <Image
          alt={item.itemName}
          src={item.media.find((file) => file.url.includes('thumbnail'))?.url ?? ''}
          width="250"
          height="250"
          className="relative object-cover rounded-md hover:scale-105 transition-all"
          onClick={() => { router.push(`/product/${item.directoryId}`); }}
      />
      </motion.div>
      <div className="flex flex-col gap-1 w-full">
        <h3 className="text-lg">{item.itemName}</h3>
        <hr className="relative w-full" />
        <span><strong>Số lượng mua:</strong> {order.orderJewelryItems[idx].quantity}</span>
        <span><strong>Ngày mua:</strong> {format(new Date(order.pendingAt), 'dd/MM/yyyy')}</span>
        <div className="flex flex-col gap-1">
          <strong>Trạng thái đơn hàng:</strong> 
          <div>
            <div className="flex gap-2 items-center flex-wrap">
              <DotStatus />
              {ENGLISH_TO_VIETNAMESE[order.status]}
            </div>

            {order.status === ORDER_STATUS.VERIFIED && (
              <div className="flex gap-2 items-center flex-wrap">
                <DotStatus />
                Hàng đang được chuẩn bị để ship
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
