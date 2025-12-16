/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 莫兰迪色盘
      colors: {
        cream: '#FDFCF8',
        mist: '#F2F4F6',
        charcoal: '#374151',
        slate: '#6B7280',
        morandi: {
          green: '#A6B9A8',
          blue: '#93A8AC',
          clay: '#D9A69F',
          lavender: '#B4A8BF',
        }
      },
      // 字体系统
      fontFamily: {
        sans: ['Manrope', 'Outfit', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      // 布局实用类
      gridTemplateColumns: {
        'dashboard': '240px 1fr', // 左侧导航固定，右侧自适应
        'hub': '3fr 1fr', // 首页：左侧内容区 + 右侧 widget
      },
      // 莫兰迪卡片圆角
      borderRadius: {
        'morandi': '24px',
        'soft': '12px',
      },
      // 阴影
      boxShadow: {
        'morandi': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'morandi-sm': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'morandi-lg': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'morandi-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
      },
      // 字体大小
      fontSize: {
        'hero': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        'display': ['36px', { lineHeight: '1.2', fontWeight: '600' }],
        'h1': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'mono': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      // 动画
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
