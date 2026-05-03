'use client'

import Image from 'next/image';
import { signOut } from 'next-auth/react';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { motion } from 'framer-motion';

import Order from './Order';
import Button from '../../../components/Button';

import type { Order as OrderType, Tier } from '../../../../types';
import Tabs, { type Tab } from '../../../components/Tabs/Tabs';
import { convertMayraPointToTier, convertTierToTextColour } from '../../../helpers';
import MayraPointProgress from './MayraPointProgress';

const TABS = [
  { id: 1, label: 'Đơn hàng', active: true },
  { id: 2, label: 'Tài khoản', active: false },
];

export default function AlreadySignedIn({
  userName,
  userImage,
  userPoint,
  userTier,
  orders,
}: {
  userName: string;
  userImage: string;
  orders: Array<OrderType>;
  userPoint: number;
  userTier: Tier;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(() => TABS.find((tab) => tab.active) as Tab);
  const [root, setRoot] = useState<HTMLElement | null>(null);

  const Toolbar = () => {
    return (
      <div className="sticky top-0 left-0 z-10 bg-white">
        <div className="flex justify-between items-center bg-transparent-white shadow-sm">
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

          <span title={convertMayraPointToTier(userPoint)} className={`flex gap-1 text-xl justify-self-end mr-1 ${convertTierToTextColour(userTier)}`}><h3>{userPoint}</h3> 🪙</span>
        </div>
        <Tabs items={TABS} onSelect={(item) => { setActiveTab(item); }} />
      </div>
    );
  };

  useEffect(() => {
    const el = document.getElementById('portal-before-anchor');
    if (!el) return;
    el.style.position = 'sticky';
    el.style.top = '57px';
    el.style.zIndex = '10';

    setRoot(el);
  }, []);

  const ComponentRenderBasedOnActiveTab = () => {
    if (activeTab.id === 1) {
      return (
        <>
          {orders?.length > 0 && (
            <ul className="grid grid-cols-1 gap-4 items-center justify-center list-none overflow-visible">
              {orders.map((order) => (
                <li key={order.id} className="flex flex-col gap-1 border-radius-[0_6px_6px_0] p-1">
                  <h3>Mã đơn #{order.id.split('-').join('')}</h3>
                  {order.jewelryItems.map((item, idx) => (
                    <Order key={`${order.id}-${idx + 1}`} item={item} order={order} idx={idx} />
                  ))}
                </li>
              ))}
            </ul>
          )}
        </>
      )
    }
    return (
      <>
        <MayraPointProgress current={userPoint} />

        <div className="mt-1">
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
  };
  
  return (
    <div className="relative flex items-start justfy-center my-4 max-w-[600px] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full bg-white shadow-lg p-3 grid grid-cols-1 items-center gap-2">
        {(!userName || !userImage)
          ? (
            <p>Shop không thể lấy được tên hoặc hình ảnh đại diện từ Facebook của bạn 🥲</p>
          )
          : (
            <>
              {root
                ? ReactDOM.createPortal(
                    Toolbar(),
                    document.getElementById('portal-before-anchor') as HTMLElement,
                  )
                : Toolbar()}
              <ComponentRenderBasedOnActiveTab />
            </>
          )
        }
      </motion.div>
    </div>
  )
}
