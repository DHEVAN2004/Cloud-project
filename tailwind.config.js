/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#0b1d38',
        sidebarAlt: '#122c4f',
        primary: '#1d8cf8',
        success: '#2cc16a',
        warning: '#f59e0b',
        error: '#ef4444',
        panel: '#f4f7fb',
        border: '#dfe7f3',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(20, 43, 80, 0.08)',
      },
    },
  },
  plugins: [],
};
