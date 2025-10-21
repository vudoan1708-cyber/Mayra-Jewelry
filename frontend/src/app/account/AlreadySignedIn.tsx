'use client'

import Image from 'next/image';

import { motion } from 'framer-motion';

import Button from '../../components/Button';

import { signOut } from 'next-auth/react';
import type { Order } from '../../../types';

export default function AlreadySignedIn({ userName, userImage, orders }: { userName: string; userImage: string; orders: Array<Order> }) {
  return (
    <div className="w-full max-w-[540px] flex items-center justfy-center my-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow-lg p-3 grid grid-cols-1 items-center gap-2">
        {(!userName || !userImage)
          ? (
            <p>Shop không thể lấy được tên hoặc hình ảnh đại diện từ Facebook của bạn 🥲</p>
          )
          : (
            <>
              <div className="flex gap-1 items-center bg-transparent-white shadow-sm">
                <Image
                  alt="user profile image"
                  src={userImage}
                  width="50"
                  height="50"
                  className="rounded-md"
                />
                <h3 className="text-2xl">{userName}</h3>
              </div>
              {orders?.length > 0 && (
                <ul className="grid grid-cols-1 gap-1 items-center justify-center list-none overflow-auto max-h-[540px]">
                  {orders.map((order, orderIdx) => (
                    <li key={order.id}>
                      <h3>Order #{orderIdx + 1}</h3>
                      {order.jewelryItems.map((item, idx) => (
                        <div key={`${order.id}-${idx + 1}`} className="flex items-center gap-1 shadow-md">
                          <Image
                            alt={item.itemName}
                            src={item.media.find((file) => file.url.includes('thumbnail'))?.url ?? ''}
                            width="200"
                            height="200"
                            className="rounded-md"
                          />
                          <div className="flex flex-col gap-1">
                            <strong>{item.itemName}</strong>
                            <span>{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
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
