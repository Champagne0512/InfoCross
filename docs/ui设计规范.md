InfoCross 设计规范: "Academic Nebula" (学术星云)
1. 核心视觉理念
风格定义： 不再是枯燥的“黑底白字”。我们将背景设定为深邃的宇宙色，前景使用半透明的磨砂玻璃卡片，配合高饱和度的流光渐变作为点缀。
关键词： 深度 (Depth)、半透明 (Translucent)、辉光 (Glow)、杂志感 (Editorial)。
拒绝： 纯黑 (#000000)、纯白 (#FFFFFF)、默认字体 (Arial/Times)、枯燥的实心色块。
2. 字体系统 (Typography) - 视觉灵魂
一定要引入特殊的 Web Fonts，这是摆脱“土气”的关键。推荐使用 Fontshare (免费高质量) 或 Google Fonts。
2.1 字体选择
标题 (Headings) - 用于视觉冲击:
字体名: Clash Display (Variable)
来源: Fontshare (免费)
特点: 极其现代、笔画有独特的切角，看起来非常昂贵、高级。
应用: 页面大标题、卡片标题、数字。
正文 (Body) - 用于舒适阅读:
字体名: Plus Jakarta Sans 或 Outfit
来源: Google Fonts
特点: 几何感强，圆润流畅，比 Inter 更有性格。
应用: 文章简介、按钮文字、菜单。
数据/标签 (Data) - 用于科技感:
字体名: JetBrains Mono 或 Space Mono
来源: Google Fonts
特点: 等宽字体，自带一种“代码”、“档案”的精密感。
应用: 时间、作者、AI 标签、统计数字。
2.2 排版层级 CSS 示例
code
CSS
/* 引入字体 (在 index.html 或 CSS 中) */
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');

.font-display { font-family: 'Clash Display', sans-serif; }
.font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

/* 巨型标题样式 */
.text-hero {
  font-family: 'Clash Display', sans-serif;
  font-weight: 700;
  letter-spacing: 0.02em; /* 稍微宽一点 */
  line-height: 1.1;
}
3. 配色体系 (Color Palette) - 拒绝死黑死白
这套配色灵感来源于深空星云。背景是深邃的蓝紫色，前景是发光的玻璃。
3.1 背景层 (The Void)
不要用纯黑。使用带有冷色调的深蓝灰。
Deep Space (深空底色): #0B0F19 (接近黑，但泛着蓝紫)
Mesh Gradient (背景光斑): 在 #0B0F19 的基础上，在页面左上角和右下角放置两个巨大的、极其模糊的彩色光球：
光球 A: #4F46E5 (Indigo)
光球 B: #EC4899 (Pink)
CSS: filter: blur(120px); opacity: 0.2;
3.2 玻璃层 (The Glass)
卡片和容器不使用实色背景，而是半透明。
Glass Surface (玻璃卡片):
背景: rgba(255, 255, 255, 0.03)
边框: 1px solid rgba(255, 255, 255, 0.08)
模糊: backdrop-filter: blur(16px)
效果: 隐约透出背后的星云光斑，极具层次感。
3.3 激活色 (The Energy)
用于按钮、高亮、AI 标签。
Neon Lavender (霓虹薰衣草): #A855F7 (主色，神秘感)
Electric Cyan (电光青): #22D3EE (辅色，科技感)
Signal Orange (信号橙): #F97316 (点缀，警示/重要)
3.4 文字色
Primary Text: #F1F5F9 (近白，不刺眼)
Secondary Text: #94A3B8 (蓝灰，用于摘要)
4. 布局与结构设计 (Layout & UI Structure)
结合你之前的需求，我们采用 Bento Grid (便当盒) 布局，利用高密度的信息展示来提升专业感。
4.1 全局框架
导航栏 (Nav): 悬浮在顶部的玻璃条，左右留有间距（不贴边），像一个胶囊。
背景: 必须加上一层极淡的 Noise Texture (噪点纹理)，让画面有电影胶片的质感，消除“廉价的数码感”。
4.2 首页：控制台风格 (Dashboard Style)
布局逻辑： 左侧导航 (20%) + 中间瀑布流 (55%) + 右侧情报局 (25%)。
Hero 区域 (页头):
不再是居中大标题。左侧是巨大的问候语 "Hello, Explorer."，右侧是一个动态滚动的数据磁贴（显示：今日入库 42 条 | 跨学科指数 89%）。
文章卡片 (Glass Card):
样式： 玻璃态背景。
图片处理： 图片默认是黑白/低饱和度的，鼠标悬停 (Hover) 时瞬间变回全彩，并轻微放大。这种交互非常高级。
标签： 使用 JetBrains Mono 字体，半透明胶囊背景，边框发光。
右侧情报局:
放置 "AI Insight" 小组件。背景使用流动的 #A855F7 渐变色（低透明度），里面显示“今日破壁建议”。
4.3 文章详情页：沉浸式分栏
左侧 (正文):
标题: 巨大的 Clash Display 字体，字号 56px。
元数据栏: 标题下方有一条虚线，分割出作者、时间、阅读时长。
重点高亮: AI 提取的句子，背景色为 rgba(34, 211, 238, 0.2) (青色高亮)。
右侧 (AI 侧边栏):
固定悬浮 (Sticky)。
包含 "Summary" (AI 摘要) 和 "Connect" (相关学科)。
设计成“HUD (抬头显示器)”风格，细线条边框，充满科技感。
5. 动效设计 (Motion & Interaction) - 恰到好处
不要用那种会让浏览器卡顿的复杂动画，只做微交互。
5.1 页面入场 (Entry)
效果: 页面加载时，内容块不要一起出来。使用 Staggered Fade Up (交错上浮)。
逻辑: 导航栏先出 -> Hero 标题上浮 -> 卡片依次上浮。
5.2 鼠标悬停 (Hover Effects) - 高级感的来源
卡片悬停:
背景稍微变亮 (opacity 增加)。
边框发光 (box-shadow 变为该卡片分类的主题色)。
CSS: transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
按钮悬停:
不要简单的变色。按钮背景是流动的渐变，悬停时渐变角度旋转，或者光泽扫过。
5.3 滚动视差 (Parallax)
背景中的两个彩色光球，随着鼠标移动或页面滚动，进行极其缓慢的位移。这会让页面看起来是“活”的。
6. 前端实现指南 (Tailwind Config)
直接把这个配置复制到你的 tailwind.config.js，立刻获得上述风格。
code
JavaScript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // 配置好的特殊字体
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // 深空背景
        void: '#0B0F19',
        // 玻璃白
        glass: 'rgba(255, 255, 255, 0.05)',
        // 激活色
        neon: {
          purple: '#A855F7',
          cyan: '#22D3EE',
          orange: '#F97316'
        }
      },
      backgroundImage: {
        // 核心流光渐变
        'gradient-aurora': 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
      },
      boxShadow: {
        // 霓虹发光阴影
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.5)',
        'glow-cyan': '0 0 20px -5px rgba(34, 211, 238, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
7. 给 UI 设计的最终建议 (Checklist)
字体下载: 马上去 Fontshare 下载 Clash Display，去 Google Fonts 下载 Plus Jakarta Sans 和 JetBrains Mono。
图片处理: 找一些高质量的 Unsplash 图片，在 CSS 里加 filter: grayscale(100%)，Hover 时 filter: grayscale(0)。这个效果非常酷。
噪点背景: 找一张半透明的 Noise 图片覆盖在 body 上，叠加模式设为 overlay，这是去除廉价感的秘诀。
间距: 保持疏密有致。文字之间要紧凑（Tight），但卡片之间要宽敞（Relaxed）。