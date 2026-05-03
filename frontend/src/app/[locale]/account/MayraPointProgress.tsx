'use client'

import { motion } from 'framer-motion';

export default function MayraPointProgress({ current, max = 1200 }: { current: number, max?: number }) {
  const distance = 300;
  const segments = max / distance;
  return (
    <div className="pt-1">
      <h3>Thang điểm Mayra Point</h3>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%', transition: { duration: .25 } }}
        className="relative h-[20px] rounded-md bg-gray-400">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${current * 100 / max}%`, transition: { delay: 0.25 } }}
          style={{
            background: 'linear-gradient(to right, var(--brand-200), var(--brand-500))',
          }}
          className="relative h-[20px] rounded-md">
          <span className="absolute right-0 top-0 text-white bg-[rgba(255,255,255,.25)] h-[inherit] flex items-center p-1 rounded-md font-bold">
            {current}
          </span>
        </motion.div>
      </motion.div>

      <motion.div className="relative w-full h-[20px] with-after">
        {Array.from({ length: segments + 1 }).map((_, idx) => (
          <motion.span
            initial={{ height: '-10px', opacity: 0 }}
            animate={{ height: '10px', opacity: 1, transition: { delay: idx * 0.25, type: 'keyframes' } }}
            key={idx}
            style={{
              left: `${(distance * idx) * 100 / max}%`,
            }}
            className="absolute bottom-0 text-gray-600 translate-x-[-50%] with-after">
            <p className={`${idx === segments  && 'w-[45px]'}`}>{distance * idx}</p>

            <style jsx global>{`
              div.with-after::after {
                content: "";
                position: absolute;
                top: 4px;
                left: 0;
                width: 100%;
                height: 1px;
                background: gray;
                transition: transform 0.3s ease;
              }
              span.with-after::after {
                content: "";
                position: absolute;
                top: -5px;
                left: 50%;
                width: 1px;
                height: 7px;
                background: gray;
                transform: translateX(-50%);
                transition: transform 0.3s ease;
              }
            `}
            </style>
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
