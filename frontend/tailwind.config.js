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
        'brand-100': 'var(--brand-100)',
        'brand-200': 'var(--brand-200)',
        'brand-300': 'var(--brand-300)',
        'brand-400': 'var(--brand-400)',
        'brand-500': 'var(--brand-500)',
        'brand-600': 'var(--brand-600)',
        'brand-700': 'var(--brand-700)',
        'transparent-white': 'var(--transparent-white)',
        'transparent-black': 'var(--transparent-black)',
        'facebook': 'var(--facebook)',
      },
      colors: {
        'brand-100': 'var(--brand-100)',
        'brand-200': 'var(--brand-200)',
        'brand-300': 'var(--brand-300)',
        'brand-400': 'var(--brand-400)',
        'brand-500': 'var(--brand-500)',
        'brand-600': 'var(--brand-600)',
        'brand-700': 'var(--brand-700)',
        'disabled': 'bg-text-gray-400',
        'facebook': 'var(--facebook)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      keyframes: {
        glow: {
          '0%': {
            transform: 'scale(1)',
            boxShadow:
              '0 0 6px 0 rgba(250,204,21,0.25), 0 0 12px 0 rgba(250,204,21,0.25)'
          },
          '50%': {
            transform: 'scale(1.12)',
            boxShadow:
              '0 0 12px 6px rgba(250,204,21,0.3), 0 0 36px 12px rgba(250,204,21,0.3)'
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow:
              '0 0 6px 0 rgba(250,204,21,0.25), 0 0 12px 0 rgba(250,204,21,0.25)'
          },
        }
      },
      animation: {
        glow: 'glow 1.8s ease-in-out infinite'
      },
    },
  },
  plugins: [],
}

