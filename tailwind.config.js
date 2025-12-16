/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Space Mono', 'monospace'],
      },
      colors: {
        primary: '#0F172A',
        'primary-surface': '#1E293B',
        link: '#3B82F6',
        accent: '#D9F99D',
        'accent-fg': '#0F172A',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        'text-secondary': '#64748B',
        void: '#0B0F19',
        glass: 'rgba(255, 255, 255, 0.03)',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
        neon: {
          purple: '#A855F7',
          cyan: '#22D3EE',
          orange: '#F97316',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
        },
        glow: {
          indigo: '#4F46E5',
          pink: '#EC4899',
        },
      },
      backgroundImage: {
        // 核心流光渐变
        'gradient-aurora': 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
        'gradient-mesh': 'radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(15, 23, 42, 0.06)',
        float: '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.5)',
        'glow-cyan': '0 0 20px -5px rgba(34, 211, 238, 0.5)',
        'glow-orange': '0 0 20px -5px rgba(249, 115, 22, 0.5)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'stagger': 'stagger 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backdropBlur: {
        'glass': '16px',
      },
      fontSize: {
        'hero': ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '0.02em' }],
        'display': ['48px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '0.02em' }],
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'h3': ['20px', { lineHeight: '1.3', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'mono': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'glass': '16px',
        'card': '12px',
        'button': '8px',
      },
    },
  },
  plugins: [],
}
