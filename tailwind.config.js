/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        'ink-2': '#454545',
        'ink-3': '#767676',
        paper: '#ffffff',
        bg: '#fff9dc',
        'bg-2': '#ffffff',
        forest: '#171717',
        'forest-2': '#2a2a2a',
        'forest-soft': '#e4f7f3',
        gold: '#ffd91a',
        'gold-2': '#ffbf00',
        'gold-soft': '#fff1a8',
        teal: '#0f8f7c',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'PingFang SC', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'Songti SC', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
