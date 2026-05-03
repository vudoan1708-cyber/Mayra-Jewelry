'use client'

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import LoginForm from '../../../components/LoginForm/LoginForm';
import type { JewelryItemInfo } from '../../../../types';
import Image from 'next/image';

export default function DisplayWishlist({ from, wishlistItems }: { from: string | undefined; wishlistItems: Array<JewelryItemInfo> }) {
  const router = useRouter();
  const session = useSession();
  if (session.status === 'authenticated') {
    if (wishlistItems.length > 0) {
      return (
        <div className="self-center">
          {wishlistItems.map((item) => (
            <div key={item.directoryId} className="flex items-center gap-1 shadow-md">
              <Image
                alt={item.itemName}
                src={item.media.find((file) => file.url.includes('thumbnail'))?.url ?? ''}
                width="200"
                height="200"
                className="rounded-md"
              />
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="self-center">
        <p className="text-[100px] text-center select-none">💔</p>
        <p>Danh sách yêu thích của bạn đang trống. <a onClick={() => { router.push('/'); }}>Quay về trang chủ</a> để chọn thêm các món đồ vào danh sách của bạn</p>
      </div>
    )
  }

  const redirectTo = from ?? '/wishlist';
  return (
    <LoginForm title="Hãy đăng nhập để sử dụng chức năng này" redirectTo={redirectTo} />
  )
}
