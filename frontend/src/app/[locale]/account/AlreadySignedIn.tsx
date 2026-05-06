'use client'

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

import { motion } from 'framer-motion';

import Order from './Order';
import Button from '../../../components/Button';

import type { Order as OrderType, Tier } from '../../../../types';
import Tabs, { type Tab } from '../../../components/Tabs/Tabs';
import { convertMayraPointToTier, convertTierToTextColour } from '../../../helpers';
import MayraPointProgress from './MayraPointProgress';

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
  const t = useTranslations('account');
  const TABS = useMemo<Tab[]>(() => [
    { id: 1, label: t('tabs.orders'), active: true },
    { id: 2, label: t('tabs.account'), active: false },
  ], [t]);
  const [activeTab, setActiveTab] = useState<Tab>(() => TABS.find((tab) => tab.active) as Tab);
  const [root, setRoot] = useState<HTMLElement | null>(null);

  const Toolbar = () => {
    return (
      <div className="mx-auto w-full max-w-[600px] px-4">
        <div className="sticky top-0 left-0 z-10 bg-accent-100 border-b border-accent-300/40 shadow-sm">
          <div className="flex justify-between items-center px-3 py-2">
            <div className="flex gap-2 items-center">
              <Image
                alt="user profile image"
                src={userImage}
                width="50"
                height="50"
                className="rounded-md"
              />
              <h3 className="text-2xl text-brand-700">{userName}</h3>
            </div>

            <span title={convertMayraPointToTier(userPoint)} className={`flex gap-1 text-xl justify-self-end mr-1 ${convertTierToTextColour(userTier)}`}><h3>{userPoint}</h3> 🪙</span>
          </div>
          <div className="px-3 pb-2">
            <Tabs items={TABS} onSelect={(item) => { setActiveTab(item); }} />
          </div>
        </div>
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
                  <h3>{t('orderId', { id: order.id.split('-').join('') })}</h3>
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
          <p>
            {t.rich('loggedInVia', {
              name: userName,
              b: (chunks) => <b>{chunks}</b>,
            })}
          </p>
          <p>{t('logoutHint')}</p>
        </div>

        <Button
          variant="secondary"
          className="border-red-500 text-red-500 hover:border-red-400 hover:text-red-400"
          onClick={async () => {
            await signOut({ redirectTo: '/' });
          }}>
          {t('logoutCta')}
        </Button>
      </>
    )
  };
  
  return (
    <div className="relative flex items-start justify-center my-6 mx-auto w-full max-w-[600px] px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full bg-accent-100 border border-accent-300/40 rounded-2xl shadow-2xl shadow-black/50 p-4 md:p-6 grid grid-cols-1 items-center gap-2 text-brand-700">
        {(!userName || !userImage)
          ? (
            <p>{t('missingFb')}</p>
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
