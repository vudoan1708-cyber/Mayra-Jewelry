'use client'

import { useState } from 'react';

import { signIn } from 'next-auth/react';

import { motion } from 'framer-motion';

import Button from '../../components/Button';

export default function LoginForm() {
  const [clicked, setClicked] = useState<boolean>(false);
  return (
    <motion.form
      initial={{ opacity: 0, scale: 1.09 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-4 h-max self-center text-brand-100 rounded-md shadow-lg p-3 max-w-[400px]"
      action={async () => {
        await signIn('facebook', { redirectTo: '/' });
      }}
    >
      <h2 className="text-2xl text-center text-gray-600">Hãy lưu trữ<br /> các món đồ yêu thích của bạn</h2>
      <Button
        variant="secondary"
        className="items-center justify-center text-facebook border-facebook py-1"
        disabled={clicked}
        onClick={() => {
          setClicked(true);
        }}>
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 fill-facebook"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
        Đăng nhập bằng Facebook
      </Button>
    </motion.form>
  )
}