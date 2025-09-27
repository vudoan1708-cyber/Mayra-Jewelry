/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      spacing: {
        '1': '8px',
        '2': '12px',
        '3': '16px',
        '4': '24px',
        '5': '32px',
        '6': '48px',
      },
      backgroundColor: {
        'brand-500': 'var(--brand-500)',
        'transparent-white': 'var(--transparent-white)',
      },
      colors: {
        'brand-500': 'var(--brand-500)',
      }
    },
  },
  plugins: [],
}

