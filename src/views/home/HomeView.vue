<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import { useRouter } from 'vue-router'
import { 
  Search, LayoutDashboard, Activity
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useFrequencyStore } from '@/stores/frequencyStore'

const router = useRouter()
const frequencyStore = useFrequencyStore()
const { t } = useI18n()
const { profile } = useAuth()

const searchQuery = ref('')
const isLoaded = ref(false)
const searchFocused = ref(false)
const hoveredCard = ref<number | null>(null)
const currentPlaceholderIndex = ref(0)
const displayPlaceholder = ref('')
const isTyping = ref(true)
const charIndex = ref(0)

// 页面配置
const displayName = computed(() => profile.value?.username || 'Explorer')

const heroConfig = computed(() => {
  if (frequencyStore.isFocus) {
    return {
      mainTitle: '打破壁垒，连接无限可能',
      subTitle: `${t('home.greeting.focus')}, ${displayName.value}`,
      desc: t('home.desc.focus'),
    }
  }
  return {
    mainTitle: '打破壁垒，连接无限可能',
    subTitle: `${t('home.greeting.vibe')}, ${displayName.value}`,
    desc: t('home.desc.vibe'),
  }
})

// 打字机效果搜索提示词
const placeholderTexts = [
  "尝试搜索：第十届互联网+...",
  "尝试搜索：缺少 UI 设计师的队伍...",
  "尝试搜索：如何跨专业考研...",
  "尝试搜索：寻找会剪辑视频的队友...",
  "尝试搜索：计算机学院保研讲座..."
]

// 打字机效果
function typeWriter() {
  const currentText = placeholderTexts[currentPlaceholderIndex.value]
  
  if (isTyping.value) {
    // 正在输入
    if (charIndex.value < currentText.length) {
      displayPlaceholder.value = currentText.substring(0, charIndex.value + 1)
      charIndex.value++
      setTimeout(typeWriter, 80)
    } else {
      // 输入完成，等待2秒后删除
      isTyping.value = false
      setTimeout(typeWriter, 2000)
    }
  } else {
    // 正在删除
    if (charIndex.value > 0) {
      displayPlaceholder.value = currentText.substring(0, charIndex.value - 1)
      charIndex.value--
      setTimeout(typeWriter, 40)
    } else {
      // 删除完成，切换到下一个文本
      isTyping.value = true
      currentPlaceholderIndex.value = (currentPlaceholderIndex.value + 1) % placeholderTexts.length
      setTimeout(typeWriter, 500)
    }
  }
}

// 启动打字机效果
onMounted(() => {
  typeWriter()
  // 触发加载动画
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

const pageConfig = computed(() => {
  if (frequencyStore.isFocus) {
    return {
      searchPlaceholder: displayPlaceholder.value || t('home.searchPlaceholder.focus'),
    }
  }
  return {
    searchPlaceholder: displayPlaceholder.value || t('home.searchPlaceholder.vibe'),
  }
})

// 手风琴导航模块配置
const navigationModules = [
  {
    id: 1,
    title: '寻觅',
    subtitle: '寻找志同道合的队友',
    description: '打破学科壁垒，发现跨学科合作机会',
    route: '/team',
    bgColor: '#F8FAFC',
    icon: Search
  },
  {
    id: 2,
    title: '协作',
    subtitle: '项目管理与进度同步',
    description: '高效管理团队项目，实时掌握进展',
    route: '/collab',
    bgColor: '#F8FAFC',
    icon: LayoutDashboard
  },
  {
    id: 3,
    title: '论坛',
    subtitle: '校园生活与情报分享',
    description: '获取最新校园资讯，参与深度讨论',
    route: '/forum',
    bgColor: '#F8FAFC',
    icon: Activity
  }
]

function handleSearch() {
  if (!searchQuery.value.trim()) return
  console.log('搜索:', searchQuery.value)
}

// 智能快捷胶囊标签数据
const smartChips = [
  { id: 1, label: '本周热榜', color: 'bg-clay/10 text-clay border-clay/20', query: '本周热榜' },
  { id: 2, label: '竞赛组队', color: 'bg-morandi-blue/10 text-morandi-blue border-morandi-blue/20', query: '竞赛组队' },
  { id: 3, label: '寻找搭子', color: 'bg-morandi-green/10 text-morandi-green border-morandi-green/20', query: '寻找搭子' },
  { id: 4, label: '学术讲座', color: 'bg-morandi-lavender/10 text-morandi-lavender border-morandi-lavender/20', query: '学术讲座' }
]

function handleChipClick(chip: { query: string }) {
  searchQuery.value = chip.query
  // 可以在这里添加搜索逻辑
  handleSearch()
}

function navigateTo(path: string) {
  router.push(path)
}

function handleCardHover(cardId: number) {
  hoveredCard.value = cardId
}

function handleCardLeave() {
  hoveredCard.value = null
}


</script>

<template>
  <div class="home-page">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="floating-particle particle-1"></div>
      <div class="floating-particle particle-2"></div>
      <div class="floating-particle particle-3"></div>
      <div class="gradient-orb orb-1" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
      <div class="gradient-orb orb-2" :class="frequencyStore.isFocus ? 'orb-focus' : 'orb-vibe'"></div>
    </div>

    <!-- Hero 区域 -->
    <section class="hero-section mb-20" :class="{ 'loaded': isLoaded }">
      <div class="hero-content">
        <!-- 顶层问候 -->
        <div class="hero-eyebrow">
          <span class="eyebrow-text">Hello, {{ displayName }}</span>
        </div>
        
        <!-- 主标题 -->
        <h1 class="hero-main-title font-sans font-bold text-gray-800">
          {{ heroConfig.mainTitle }}
        </h1>
        
        <!-- 搜索栏 -->
        <div class="search-wrapper" :class="{ 'search-active': searchFocused }">
          <div class="search-glow" :class="frequencyStore.isFocus ? 'glow-focus' : 'glow-vibe'"></div>
          <div class="search-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="pageConfig.searchPlaceholder"
            class="search-input"
            :class="frequencyStore.isFocus ? 'search-focus' : 'search-vibe'"
            @keyup.enter="handleSearch"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- 智能快捷胶囊标签 -->
        <div class="smart-chips-container">
          <div class="smart-chips">
            <button
              v-for="chip in smartChips"
              :key="chip.id"
              class="smart-chip"
              :class="chip.color"
              @click="handleChipClick(chip)"
            >
              <span class="chip-label font-sans">{{ chip.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 交互式手风琴导航区 -->
    <section class="accordion-section section-animate" :class="{ 'loaded': isLoaded }" style="--delay: 0.2s">
      <div class="accordion-container">
        <div
          v-for="module in navigationModules"
          :key="module.id"
          class="accordion-card"
          :class="{ 'expanded': hoveredCard === module.id }"
          :style="{ 
            backgroundColor: module.bgColor,
            flex: hoveredCard === module.id ? 3 : 1
          }"
          @mouseenter="handleCardHover(module.id)"
          @mouseleave="handleCardLeave"
          @click="navigateTo(module.route)"
        >
          <!-- 背景装饰图标 -->
          <div class="card-background-icon">
            <component :is="module.icon" :size="160" />
          </div>
          
          <!-- 卡片内容 -->
          <div class="card-content">
            <!-- 文字内容 -->
            <div class="text-section">
              <h3 class="module-title">{{ module.title }}</h3>
              <p class="module-subtitle">{{ module.subtitle }}</p>
              
              <!-- 展开时显示的内容 -->
              <div class="expanded-content" :class="{ 'show': hoveredCard === module.id }">
                <p class="module-description">{{ module.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  @apply space-y-8 relative;
}

/* 动态背景 */
.background-animation {
  @apply fixed inset-0 pointer-events-none overflow-hidden;
  z-index: 0;
}

.floating-particle {
  @apply absolute rounded-full opacity-15;
  background: linear-gradient(135deg, rgba(147, 168, 172, 0.4), rgba(217, 166, 159, 0.4));
}

.particle-1 {
  @apply w-2 h-2 top-32 left-20;
  animation: float 8s ease-in-out infinite;
}

.particle-2 {
  @apply w-3 h-3 top-1/2 right-32;
  animation: float 10s ease-in-out infinite 2s;
}

.particle-3 {
  @apply w-1.5 h-1.5 bottom-40 left-1/3;
  animation: float 7s ease-in-out infinite 1s;
}

.gradient-orb {
  @apply absolute rounded-full opacity-10;
  filter: blur(60px);
}

.orb-1 {
  @apply w-80 h-80 -top-20 -left-20;
  animation: pulse-slow 15s ease-in-out infinite;
}

.orb-2 {
  @apply w-64 h-64 bottom-20 -right-20;
  animation: pulse-slow 12s ease-in-out infinite 3s;
}

.orb-focus {
  background: radial-gradient(circle, rgba(147, 168, 172, 0.5) 0%, transparent 70%);
}

.orb-vibe {
  background: radial-gradient(circle, rgba(217, 166, 159, 0.5) 0%, transparent 70%);
}

/* Hero 区域 */
.hero-section {
  @apply py-8 lg:py-10 relative z-10;
  @apply opacity-0 translate-y-6;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-section.loaded {
  @apply opacity-100 translate-y-0;
}

.hero-content {
  @apply max-w-xl text-center mx-auto;
}

/* 顶层问候 */
.hero-eyebrow {
  @apply mb-4;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.1s;
}

.hero-section.loaded .hero-eyebrow {
  @apply opacity-100 translate-y-0;
}

.eyebrow-text {
  @apply text-sm font-mono text-gray-400 uppercase tracking-widest;
}

/* 主标题 */
.hero-main-title {
  @apply text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-8;
  @apply opacity-0 translate-y-6;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
  white-space: nowrap;
}

.hero-section.loaded .hero-main-title {
  @apply opacity-100 translate-y-0;
}

/* 搜索栏 */
.search-wrapper {
  @apply relative max-w-lg mx-auto mt-10;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.4s;
}

/* 搜索栏 */
.search-wrapper {
  @apply relative max-w-lg mx-auto mt-10;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.4s;
}

.hero-section.loaded .search-wrapper {
  @apply opacity-100 translate-y-0;
}

.search-glow {
  @apply absolute -inset-1 rounded-full opacity-0 transition-opacity duration-300;
  filter: blur(8px);
}

.search-active .search-glow {
  @apply opacity-100;
}

.glow-focus {
  background: rgba(147, 168, 172, 0.3);
}

.glow-vibe {
  background: rgba(217, 166, 159, 0.3);
}

.search-icon {
  @apply absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate;
  @apply transition-colors duration-300;
}

.search-active .search-icon {
  @apply text-charcoal;
}

.search-input {
  @apply relative w-full pl-12 pr-10 py-3 rounded-full border bg-white/80 backdrop-blur-sm;
  @apply font-sans text-body text-charcoal placeholder:text-slate/60;
  @apply transition-all duration-300 focus:outline-none focus:ring-2;
  @apply shadow-xl shadow-gray-200/50;
}

.search-focus {
  @apply border-slate/20 focus:border-focus-primary focus:ring-focus-primary/20;
}

.search-vibe {
  @apply border-vibe-primary/20 focus:border-vibe-primary focus:ring-vibe-primary/20;
}

.search-active .search-input {
  @apply shadow-lg;
}

.search-clear {
  @apply absolute inset-y-0 right-4 flex items-center text-slate hover:text-charcoal transition-colors;
}

/* 智能快捷胶囊标签 */
.smart-chips-container {
  @apply max-w-2xl mx-auto mt-4;
  @apply opacity-0 translate-y-4;
  transition: all 0.6s ease-out 0.5s;
}

.hero-section.loaded .smart-chips-container {
  @apply opacity-100 translate-y-0;
}

.smart-chips {
  @apply flex flex-wrap justify-center gap-2;
}

.smart-chip {
  @apply inline-flex items-center px-3 py-1.5 rounded-full;
  @apply transition-all duration-300 ease-in-out;
  @apply hover:shadow-sm hover:scale-105;
}

.smart-chip:hover {
  @apply bg-white shadow-md;
}

.chip-label {
  @apply text-sm font-medium;
}

/* 手风琴导航区 */
.accordion-section {
  @apply py-8 relative z-10;
}

.accordion-container {
  @apply flex w-full h-[400px] rounded-2xl overflow-hidden;
  @apply shadow-xl border border-slate/10;
  @apply bg-white;
}

.accordion-card {
  @apply relative flex-1 cursor-pointer transition-all duration-500 ease-in-out;
  @apply flex items-center justify-center p-6;
  @apply overflow-hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.accordion-card:last-child {
  @apply border-r-0;
}

.accordion-card:hover {
  @apply shadow-xl;
}

/* 背景装饰图标 */
.card-background-icon {
  @apply absolute inset-0 flex items-center justify-center;
  @apply pointer-events-none;
}

.card-background-icon svg {
  @apply transition-transform duration-700 ease-in-out;
  @apply opacity-15;
  color: currentColor;
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.accordion-card:hover .card-background-icon svg {
  transform: translate(-50%, -50%) scale(1.02);
  @apply opacity-20;
}

/* 为所有卡片设置统一的图标颜色 */
.card-background-icon svg {
  color: #64748B; /* Slate 500 */
}

/* 卡片内容 */
.card-content {
  @apply relative z-10 flex flex-col items-center justify-end;
  @apply text-center space-y-3;
  @apply transition-all duration-500 ease-in-out;
  width: 100%;
  height: 100%;
  padding-top: 3rem;
  padding-bottom: 2rem;
  transform: translateY(20px);
}

.accordion-card.expanded .card-content {
  @apply items-center text-center;
  padding-top: 5rem;
  padding-bottom: 2rem;
  transform: translateY(0);
}



/* 文字区域 */
.text-section {
  @apply space-y-2 flex flex-col;
}

.module-title {
  @apply text-2xl font-bold text-charcoal font-sans;
  @apply transition-all duration-300 ease-in-out;
}

.module-subtitle {
  @apply text-sm text-slate/60 font-sans leading-relaxed;
  @apply transition-all duration-300 ease-in-out;
  max-width: 220px;
}

.accordion-card:hover .module-title {
  @apply text-3xl;
}

.accordion-card:hover .module-subtitle {
  @apply text-slate/70;
}

/* 展开内容 */
.expanded-content {
  @apply space-y-4 opacity-0 transform translate-y-4;
  @apply transition-all duration-500 ease-in-out;
  @apply pointer-events-none mt-12;
}

.expanded-content.show {
  @apply opacity-100 translate-y-0 pointer-events-auto;
}

.module-description {
  @apply text-sm text-slate/70 leading-relaxed font-sans;
  @apply max-w-xs;
}

/* 区块动画 */
.section-animate {
  @apply opacity-0 translate-y-8;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--delay, 0s);
}

.section-animate.loaded {
  @apply opacity-100 translate-y-0;
}

/* 动画定义 */
@keyframes float {
  0%, 100% { 
    transform: translateY(0px) translateX(0px); 
  }
  25% { 
    transform: translateY(-15px) translateX(5px); 
  }
  50% { 
    transform: translateY(-8px) translateX(-5px); 
  }
  75% { 
    transform: translateY(-20px) translateX(3px); 
  }
}

@keyframes pulse-slow {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.1; 
  }
  50% { 
    transform: scale(1.15); 
    opacity: 0.15; 
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .orb-1,
  .orb-2 {
    @apply w-48 h-48;
  }
  
  .floating-particle {
    @apply opacity-10;
  }

  .accordion-container {
    @apply flex-col h-auto rounded-2xl;
  }

  .accordion-card {
    @apply border-r-0 border-b border-slate/10 p-6;
    min-height: 160px;
  }

  .accordion-card:last-child {
    @apply border-b-0;
  }

  .accordion-card:hover,
  .accordion-card.expanded {
    flex: 1;
  }

  .card-content {
    @apply flex-row items-center justify-between;
  }

  .accordion-card.expanded .card-content {
    @apply flex-col items-start text-left;
  }
}
</style>