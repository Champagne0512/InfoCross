/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      colors: {
        canvas: '#FAFAFA',
        surface: '#FFFFFF',
        ink: '#0F172A',
        'ink-soft': '#64748B',
        border: '#E2E8F0',
        academic: '#2563EB',
        life: '#F97316',
        activity: '#059669',
        intelligence: '#7C3AED',
        neutral: '#F1F5F9',
      },
      boxShadow: {
        sheet: '0 20px 45px rgba(15, 23, 42, 0.08)',
        card: '0 12px 28px rgba(15, 23, 42, 0.06)',
        subtle: '0 1px 3px rgba(15, 23, 42, 0.08)',
      },
      spacing: {
        13: '3.25rem',
      },
      borderRadius: {
        xl: '1.25rem',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
