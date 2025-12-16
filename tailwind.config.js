/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 莫兰迪色盘 - 柔和高级灰调
      colors: {
        // 背景层 - 温暖的纸纹米色
        cream: '#F9F7F4',  // 主背景，比纯白更温暖的米纸色
        mist: '#F2F0ED',   // 深一点的背景，用于分割区域
        
        // 文字色
        charcoal: '#374151',  // 主标题炭灰色
        slate: '#6B7280',     // 正文板岩灰
        
        // 莫兰迪功能色 - 低饱和度，带灰调
        morandi: {
          green: '#A6B9A8',   // 鼠尾草绿 - 运动/生活
          blue: '#93A8AC',    // 雾霾蓝 - 科研/学术
          clay: '#D9A69F',    // 脏粉/陶土 - 娱乐/社交
          lavender: '#B4A8BF', // 灰紫 - AI/科技
        },
        
        // 卡片背景色 - 莫兰迪色系，20-30%透明度，与背景形成柔和对比
        card: {
          base: 'rgba(255, 255, 255, 0.85)',  // 半透明白，通用卡片
          blue: 'rgba(147, 168, 172, 0.25)',   // 柔和雾霾蓝 - 学术类
          green: 'rgba(166, 185, 168, 0.25)',  // 柔和鼠尾草绿 - 生活类  
          clay: 'rgba(217, 166, 159, 0.25)',   // 柔和脏粉 - 社交类
          lavender: 'rgba(180, 168, 191, 0.3)', // 柔和灰紫 - AI/个人相关
          mist: 'rgba(228, 225, 221, 0.7)',    // 柔和迷雾灰 - 中性卡片
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
