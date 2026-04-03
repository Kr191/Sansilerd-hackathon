/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kuhu brand palette
        primary:        '#6B00D7',
        'primary-dark': '#5500AA',
        'primary-light':'#F0E6FF',
        accent:         '#6EE000',
        'accent-dark':  '#55B000',
        'accent-light': '#F0FFD6',
        secondary:      '#64748b',
        // Override Tailwind violet to match Kuhu purple
        violet: {
          50:  '#F0E6FF',
          100: '#E0CCFF',
          200: '#C199FF',
          300: '#A366FF',
          400: '#8433FF',
          500: '#7200E6',
          600: '#6B00D7',
          700: '#6B00D7',
          800: '#5500AA',
          900: '#3D007A',
        },
        // Override lime to match Kuhu green
        lime: {
          50:  '#F0FFD6',
          100: '#DFFFAA',
          200: '#C5FF77',
          300: '#A8F044',
          400: '#8EE000',
          500: '#6EE000',
          600: '#55B000',
          700: '#3D8000',
          800: '#285500',
          900: '#142B00',
        },
      },
    },
  },
  plugins: [],
}

