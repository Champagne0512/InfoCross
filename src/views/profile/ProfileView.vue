<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ActionGrid from '@/components/profile/ActionGrid.vue'
import ProfileEditForm from '@/components/profile/ProfileEditForm.vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { User, Sparkles } from 'lucide-vue-next'

const { t } = useI18n()
const { profile, logout } = useAuth()
const router = useRouter()

const isEditModalOpen = ref(false)
const isLoaded = ref(false)

onMounted(() => {
  // 延迟加载动画
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

function openEditModal() {
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function handleAction(action: string) {
  switch (action) {
    case 'history':
      router.push('/profile/history')
      break
    case 'bookmarks':
      router.push('/bookmarks')
      break
    case 'forum':
      router.push('/profile/posts')
      break
    case 'security':
      router.push('/settings')
      break
  }
}

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <div v-if="profile" class="profile-page">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="floating-particle particle-1"></div>
      <div class="floating-particle particle-2"></div>
      <div class="floating-particle particle-3"></div>
      <div class="floating-particle particle-4"></div>
      <div class="floating-particle particle-5"></div>
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>

    <!-- 主要内容 -->
    <div class="relative z-10">
      <!-- 顶部：个人资料卡 -->
      <div 
        class="profile-header-container"
        :class="{ 'loaded': isLoaded }"
      >
        <ProfileHeader 
          :profile="profile" 
          @edit="openEditModal"
          @logout="handleLogout"
        />
      </div>
      
      <!-- 主体：功能磁贴区 -->
      <div 
        class="action-grid-container"
        :class="{ 'loaded': isLoaded }"
      >
        <ActionGrid @action="handleAction" />
      </div>
    </div>

    <!-- ✨ 底部宽屏动效：跨界心流 -->
    <div class="footer-wave-container">
      <!-- 渐变遮罩：让波浪顶部渐变消失 -->
      <div class="wave-gradient-mask"></div>
      
      <!-- 波浪容器 SVG -->
      <svg class="wave-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 320">
        <!-- 波浪 1 (慢速，莫兰迪蓝) -->
        <g class="animate-wave-slow">
          <path fill="rgba(147, 168, 172, 0.2)" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </g>
        
        <!-- 波浪 2 (中速，莫兰迪粉) -->
        <g class="animate-wave-medium">
          <path fill="rgba(217, 166, 159, 0.2)" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </g>
        
        <!-- 装饰：漂浮的连接点 -->
        <circle cx="10%" cy="60%" r="3" class="wave-node animate-float-1" />
        <circle cx="25%" cy="70%" r="2" class="wave-node animate-float-2" />
        <circle cx="60%" cy="50%" r="4" class="wave-node-accent-blue animate-float-3" />
        <circle cx="85%" cy="65%" r="3" class="wave-node-accent-pink animate-float-1" />
      </svg>
    </div>
  </div>

  <!-- 未登录状态 -->
  <div v-else class="not-logged-in">
    <div class="background-animation">
      <div class="floating-particle particle-1"></div>
      <div class="floating-particle particle-2"></div>
      <div class="gradient-orb orb-1"></div>
    </div>
    
    <div class="relative z-10 min-h-screen flex items-center justify-center">
      <div class="text-center login-prompt" :class="{ 'loaded': isLoaded }">
        <div class="login-icon-container">
          <div class="login-icon-bg"></div>
          <User :size="32" class="text-slate relative z-10" />
          <div class="icon-pulse"></div>
        </div>
        <h2 class="text-h2 font-sans font-bold text-charcoal mb-3">{{ t('profile.notLoggedIn') }}</h2>
        <p class="text-body font-sans text-slate mb-8">{{ t('profile.notLoggedInDesc') }}</p>
        <button 
          @click="$router.push('/auth')"
          class="login-cta-btn"
        >
          <div class="btn-shimmer"></div>
          <Sparkles :size="16" class="mr-2" />
          {{ t('profile.goLogin') }}
        </button>
      </div>
    </div>
  </div>

  <!-- 编辑模态框 -->
  <Transition name="modal">
    <div 
      v-if="isEditModalOpen && profile" 
      class="modal-overlay"
      @click="closeEditModal"
    >
      <div 
        class="modal-content"
        @click.stop
      >
        <ProfileEditForm 
          :profile="profile"
          @close="closeEditModal"
          @updated="closeEditModal"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 页面基础样式 */
.profile-page,
.not-logged-in {
  @apply min-h-screen relative overflow-hidden;
}

/* 动态背景 */
.background-animation {
  @apply fixed inset-0 pointer-events-none;
  z-index: 0;
}

.floating-particle {
  @apply absolute rounded-full opacity-20;
  background: linear-gradient(135deg, rgba(147, 168, 172, 0.3), rgba(217, 166, 159, 0.3));
}

.particle-1 {
  @apply w-2 h-2 top-20 left-10;
  animation: float 6s ease-in-out infinite;
}

.particle-2 {
  @apply w-3 h-3 top-1/3 right-20;
  animation: float 8s ease-in-out infinite 1s;
}

.particle-3 {
  @apply w-1.5 h-1.5 top-2/3 left-1/4;
  animation: float 7s ease-in-out infinite 2s;
}

.particle-4 {
  @apply w-2.5 h-2.5 bottom-32 right-1/3;
  animation: float 9s ease-in-out infinite 0.5s;
}

.particle-5 {
  @apply w-1 h-1 bottom-20 left-1/2;
  animation: float 5s ease-in-out infinite 1.5s;
}

.gradient-orb {
  @apply absolute rounded-full opacity-10;
  filter: blur(40px);
}

.orb-1 {
  @apply w-96 h-96 top-10 -left-20;
  background: radial-gradient(circle, rgba(147, 168, 172, 0.4) 0%, transparent 70%);
  animation: pulse-slow 12s ease-in-out infinite;
}

.orb-2 {
  @apply w-80 h-80 bottom-10 -right-20;
  background: radial-gradient(circle, rgba(217, 166, 159, 0.4) 0%, transparent 70%);
  animation: pulse-slow 15s ease-in-out infinite 3s;
}

/* 渐进式加载动画 */
.profile-header-container,
.action-grid-container,
.login-prompt {
  @apply opacity-0 translate-y-8;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-header-container.loaded {
  @apply opacity-100 translate-y-0;
  transition-delay: 0.2s;
}

.action-grid-container.loaded {
  @apply opacity-100 translate-y-0;
  transition-delay: 0.4s;
}

.login-prompt.loaded {
  @apply opacity-100 translate-y-0;
  transition-delay: 0.3s;
}

/* 未登录状态增强 */
.login-icon-container {
  @apply relative w-16 h-16 rounded-full bg-slate/10 flex items-center justify-center mx-auto mb-6;
  @apply overflow-hidden;
}

.login-icon-bg {
  @apply absolute inset-0 bg-gradient-to-br from-morandi-blue/20 to-morandi-lavender/20;
  @apply opacity-0 transition-opacity duration-500;
}

.login-icon-container:hover .login-icon-bg {
  @apply opacity-100;
}

.icon-pulse {
  @apply absolute inset-0 rounded-full border-2 border-morandi-blue/30;
  animation: pulse-ring 2s ease-out infinite;
}

.login-cta-btn {
  @apply relative px-8 py-4 rounded-soft bg-morandi-lavender text-white font-sans font-medium;
  @apply transition-all duration-300 hover:bg-morandi-lavender/90 hover:shadow-xl;
  @apply flex items-center justify-center overflow-hidden;
  @apply hover:-translate-y-1 hover:scale-105;
}

.btn-shimmer {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent;
  @apply -translate-x-full transition-transform duration-1000;
}

.login-cta-btn:hover .btn-shimmer {
  @apply translate-x-full;
}

/* 模态框增强 */
.modal-overlay {
  @apply fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-cream rounded-morandi shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto;
  @apply transform transition-all duration-300;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  @apply opacity-0;
}

.modal-enter-from .modal-content {
  @apply scale-95 translate-y-4;
}

.modal-leave-to {
  @apply opacity-0;
}

.modal-leave-to .modal-content {
  @apply scale-95 translate-y-4;
}

/* 动画定义 */
@keyframes float {
  0%, 100% { 
    transform: translateY(0px) translateX(0px) rotate(0deg); 
  }
  25% { 
    transform: translateY(-10px) translateX(5px) rotate(90deg); 
  }
  50% { 
    transform: translateY(-5px) translateX(-5px) rotate(180deg); 
  }
  75% { 
    transform: translateY(-15px) translateX(3px) rotate(270deg); 
  }
}

@keyframes pulse-slow {
  0%, 100% { 
    transform: scale(1) rotate(0deg); 
    opacity: 0.1; 
  }
  50% { 
    transform: scale(1.1) rotate(180deg); 
    opacity: 0.2; 
  }
}

@keyframes pulse-ring {
  0% { 
    transform: scale(1); 
    opacity: 0.3; 
  }
  100% { 
    transform: scale(1.5); 
    opacity: 0; 
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .orb-1,
  .orb-2 {
    @apply w-64 h-64;
  }
  
  .particle-1,
  .particle-2,
  .particle-3,
  .particle-4,
  .particle-5 {
    @apply opacity-10;
  }
  
  .footer-wave-container {
    @apply h-40;
  }
}

/* ✨ 底部波浪动效样式 */
.footer-wave-container {
  @apply absolute left-0 w-full pointer-events-none overflow-hidden;
  bottom: 80px;
  height: 320px;
  z-index: 0;
  opacity: 0.65;
}

.wave-gradient-mask {
  @apply absolute top-0 left-0 w-full h-1/2 z-10;
  background: linear-gradient(to bottom, #F9F7F4 0%, transparent 100%);
}

.wave-svg {
  @apply w-full h-full;
}

.wave-node {
  fill: #B8BFC4;
}

.wave-node-accent-blue {
  fill: #93A8AC;
  opacity: 0.6;
}

.wave-node-accent-pink {
  fill: #D9A69F;
  opacity: 0.6;
}

/* 波浪流动动画 - 只上下浮动，避免左右移动导致边缘问题 */
@keyframes wave-flow {
  0% { transform: scaleY(1) translateY(0); }
  50% { transform: scaleY(1.08) translateY(-8px); }
  100% { transform: scaleY(1) translateY(0); }
}

.animate-wave-slow {
  animation: wave-flow 6s ease-in-out infinite;
  transform-origin: bottom;
}

.animate-wave-medium {
  animation: wave-flow 4s ease-in-out infinite reverse;
  transform-origin: bottom;
}

/* 漂浮点动画 - 更明显 */
@keyframes float-particle {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-25px); opacity: 1; }
}

.animate-float-1 { animation: float-particle 3s ease-in-out infinite; }
.animate-float-2 { animation: float-particle 4s ease-in-out infinite; animation-delay: 0.5s; }
.animate-float-3 { animation: float-particle 3.5s ease-in-out infinite; animation-delay: 1s; }
</style>
