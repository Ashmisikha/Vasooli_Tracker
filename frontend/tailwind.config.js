/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bullish: {
          DEFAULT: '#0ECB81',
          primary: '#0ECB81',
          light: '#E8F8F0',
          dark: '#0A8C5A',
        },
        bearish: {
          DEFAULT: '#8B1A1A',
          primary: '#8B1A1A',
          light: '#F5E6E6',
          dark: '#5C1010',
        },
        neutral: {
          DEFAULT: '#8E8E93',
          primary: '#8E8E93',
          light: '#F5F5F5',
          dark: '#636366',
        },
        groww: {
          green: '#0ECB81',
          blue: '#4A6CF7',
          dark: '#1A1A2E',
          gray: '#F5F7FA',
          border: '#E8EBEF',
          text: '#666D80',
          muted: '#9BA3B5',
        },
        brand: {
          blue: '#4A6CF7',
          orange: '#FFA726',
          green: '#0A5C3A',
          red: '#8B1A1A',
          yellow: '#8E8E93',
        },
        'dark-green': {
          DEFAULT: '#0A5C3A',
          dark: '#0A4A2E',
          darker: '#0A3A22',
          light: '#0A6C4A',
          lighter: '#0A7C5A',
          muted: '#1A4A3A',
        },
        'brand-green': '#0A5C3A',
      },
      fontFamily: {
        inter: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'groww': '0 2px 8px rgba(0,0,0,0.06)',
        'groww-lg': '0 8px 25px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
