import Image from 'next/image';
import type { JewelryItemInfo, Order } from '../../../types';
import { ENGLISH_TO_VIETNAMESE } from '../../helpers';

export default function Order({ item, order, idx }: { item: JewelryItemInfo; order: Order, idx: number }) {
  return (
    <div className="flex items-start gap-1">
      <Image
        alt={item.itemName}
        src={item.media.find((file) => file.url.includes('thumbnail'))?.url ?? ''}
        width="200"
        height="200"
        className="rounded-md"
      />
      <div className="flex flex-col gap-1">
        <strong>{item.itemName}</strong>
        <span>Số lượng mua: {order.orderJewelryItems[idx].quantity}</span>
        <span>Trạng thái đơn hàng: {ENGLISH_TO_VIETNAMESE[order.status]}</span>
      </div>
    </div>
  )
}
