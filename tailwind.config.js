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
        bg: '#0b0c10',
        bg2: '#10121a',
        surface: '#14161f',
        surface2: '#1a1d28',
        border: '#222533',
        border2: '#2d3044',
        accent: '#4f8ef7',
        accent2: '#7aaff9',
        text: '#e2e5f0',
        text2: '#8d94b0',
        text3: '#4a5070',
        green: '#3fc983',
        orange: '#f0944d',
        red: '#e05c5c',
      },
    },
  },
  plugins: [],
}
