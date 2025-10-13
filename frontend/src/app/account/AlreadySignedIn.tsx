'use client'

import Image from 'next/image';

import { motion } from 'framer-motion';

import Button from '../../components/Button';

import { signOut } from 'next-auth/react';

export default function AlreadySignedIn({ userName, userImage }: { userName: string, userImage: string }) {
  return (
    <div className="w-full max-w-[540px] h-full flex items-center justfy-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow-lg p-1 grid grid-cols-1 items-center gap-2">
        {(!userName || !userImage)
          ? (
            <p>Shop không thể lấy được tên hoặc hình ảnh đại diện từ Facebook của bạn 🥲</p>
          )
          : (
            <>
              <div className="flex gap-1 items-center">
                <Image
                  alt="user profile image"
                  src={userImage}
                  width="50"
                  height="50"
                  className="rounded-md"
                />
                <h3 className="text-2xl">{userName}</h3>
              </div>
              <div>
                <p>Bạn đã đăng nhập vào Mayra thông qua tài khoản Facebook <b>{userName}</b> và đang tích điểm Mayra Point.</p>
                <p>Hãy bấm nút phía dưới nếu bạn muốn đăng xuất khỏi Mayra.</p>
              </div>
              <Button
                variant="secondary"
                className="border-red-500 text-red-500 hover:border-red-400 hover:text-red-400"
                onClick={async () => {
                  await signOut({ redirectTo: '/' });
                }}>
                Đăng xuất khỏi Mayra
              </Button>
            </>
          )
        }
      </motion.div>
    </div>
  )
}
