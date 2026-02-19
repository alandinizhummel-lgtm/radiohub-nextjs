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
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        text: 'var(--text)',
        text2: 'var(--text2)',
        text3: 'var(--text3)',
        green: 'var(--green)',
        orange: 'var(--orange)',
        red: 'var(--red)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--text2)',
            '--tw-prose-headings': 'var(--text)',
            '--tw-prose-lead': 'var(--text2)',
            '--tw-prose-links': 'var(--accent)',
            '--tw-prose-bold': 'var(--text)',
            '--tw-prose-counters': 'var(--text3)',
            '--tw-prose-bullets': 'var(--text3)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-quotes': 'var(--text2)',
            '--tw-prose-quote-borders': 'var(--accent)',
            '--tw-prose-captions': 'var(--text3)',
            '--tw-prose-code': 'var(--accent)',
            '--tw-prose-pre-code': 'var(--text)',
            '--tw-prose-pre-bg': 'var(--surface2)',
            '--tw-prose-th-borders': 'var(--border)',
            '--tw-prose-td-borders': 'var(--border)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
