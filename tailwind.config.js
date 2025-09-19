/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'high-contrast': {
          bg: '#000000',
          text: '#ffffff',
          accent: '#ffff00'
        }
      },
      fontSize: {
        'xs-accessible': ['0.875rem', { lineHeight: '1.6' }],
        'sm-accessible': ['1rem', { lineHeight: '1.6' }],
        'base-accessible': ['1.125rem', { lineHeight: '1.6' }],
        'lg-accessible': ['1.25rem', { lineHeight: '1.6' }],
        'xl-accessible': ['1.5rem', { lineHeight: '1.6' }]
      }
    },
  },
  plugins: [],
}