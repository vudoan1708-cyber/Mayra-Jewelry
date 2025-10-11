'use client'

import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import LoginForm from '../../components/LoginForm/LoginForm';

type ChildProps = {
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated',
  sessionData: Session | null
};

export default function DisplayWishlist({ sessionStatus, sessionData }: Partial<ChildProps>) {
  const router = useRouter();
  console.log('sessionStatus', sessionStatus);
  if (sessionStatus === 'authenticated') {
    return (
      <div className="self-center">
        <p className="text-[100px] text-center select-none">💔</p>
        <p>Danh sách yêu thích của bạn đang trống. <a onClick={() => { router.push('/'); }}>Quay về trang chủ</a> để chọn thêm các món đồ vào danh sách của bạn</p>
      </div>
    )
  }
  return (
    <LoginForm title="Hãy đăng nhập để sử dụng chức năng này" redirectTo="/wishlist" />
  )
}
