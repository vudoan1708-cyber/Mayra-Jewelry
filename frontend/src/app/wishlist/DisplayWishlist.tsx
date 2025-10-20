'use client'

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import LoginForm from '../../components/LoginForm/LoginForm';

export default function DisplayWishlist({ from }: { from: string | undefined }) {
  const router = useRouter();
  const session = useSession();
  if (session.status === 'authenticated') {
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
