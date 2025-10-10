'use client'

import { ChevronUp } from 'lucide-react';

import Button from '../Button';
import NavItem from '../Navigation/NavItem';

export default function Footer() {
  return (
    <footer className="relative w-full">
      <Button
        variant="tertiary"
        className="w-full !bg-gray-200 hover:!bg-gray-300 rounded-b-none"
        onClick={() => { document?.getElementById('extra_nav_info')?.scrollIntoView({ behavior: 'smooth' }); }}>
        <div className="text-black flex gap-2 justify-center font-serif">
          NHẢY LÊN TRÊN
          <ChevronUp />
        </div>
      </Button>

      <div className="bg-gray-100">
        <nav className="flex gap-36 justify-center p-8 text-black">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg">Follow us</h3>
            <ul>
              <NavItem href="https://www.facebook.com/mayrajewelry.insaigon" target="_blank" externalLink withBorder={false}>
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 fill-brand-500"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
              </NavItem>
            </ul>
          </div>
        </nav>
      </div>
    </footer>
  )
}
