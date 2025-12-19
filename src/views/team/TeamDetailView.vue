<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, Crown, Users, Calendar, MapPin, 
  MessageCircle, CheckSquare, FileText, Settings,
  Send, Plus, MoreHorizontal, Check, Circle
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useFrequencyStore } from '@/stores/frequencyStore'
import { fetchTeams } from '@/api/team'
import type { Team } from '@/types/models'

type TabType = 'chat' | 'tasks' | 'files' | 'settings'

const route = useRoute()
const router = useRouter()
const { profile } = useAuth()
const frequencyStore = useFrequencyStore()

const team = ref<Team | null>(null)
const loading = ref(true)
const activeTab = ref<TabType>('chat')
const newMessage = ref('')
const newTaskTitle = ref('')
const showNewTaskInput = ref(false)

const userId = computed(() => profile.value?.id ?? '')
const isOwner = computed(() => team.value?.ownerId === userId.value)

// 模拟聊天消息
const messages = ref([
  { id: 1, userId: 'u1', userName: '张三', content: '大家好，我们下周开始第一次线下会议吧', time: '10:30', isOwner: true },
  { id: 2, userId: 'u2', userName: '李四', content: '好的，我周三下午有空', time: '10:32', isOwner: false },
  { id: 3, userId: 'u3', userName: '王五', content: '我也可以，地点定在图书馆怎么样？', time: '10:35', isOwner: false },
  { id: 4, userId: 'u1', userName: '张三', content: '图书馆 B1 讨论室，我去预约', time: '10:38', isOwner: true },
])

// 模拟任务列表
const tasks = ref([
  { id: 1, title: '完成需求文档初稿', assignee: '张三', status: 'done', dueDate: '12-20' },
  { id: 2, title: '设计系统架构图', assignee: '李四', status: 'in-progress', dueDate: '12-22' },
  { id: 3, title: '搭建开发环境', assignee: '王五', status: 'todo', dueDate: '12-25' },
  { id: 4, title: '编写 API 接口文档', assignee: '待分配', status: 'todo', dueDate: '12-28' },
])

// 模拟文件列表
const files = ref([
  { id: 1, name: '项目需求文档 v1.0.pdf', size: '2.3 MB', uploadedBy: '张三', date: '12-18' },
  { id: 2, name: '系统架构设计.pptx', size: '5.1 MB', uploadedBy: '李四', date: '12-19' },
  { id: 3, name: '会议纪要 1220.md', size: '12 KB', uploadedBy: '王五', date: '12-20' },
])

const tabs = [
  { id: 'chat', label: '交流室', icon: MessageCircle },
  { id: 'tasks', label: '任务板', icon: CheckSquare },
  { id: 'files', label: '文件库', icon: FileText },
  { id: 'settings', label: '设置', icon: Settings, ownerOnly: true },
]

const visibleTabs = computed(() => 
  tabs.filter(tab => !tab.ownerOnly || isOwner.value)
)

const taskStats = computed(() => ({
  total: tasks.value.length,
  done: tasks.value.filter(t => t.status === 'done').length,
  inProgress: tasks.value.filter(t => t.status === 'in-progress').length,
  todo: tasks.value.filter(t => t.status === 'todo').length,
}))

onMounted(async () => {
  loading.value = true
  try {
    const allTeams = await fetchTeams()
    const teamId = Number(route.params.id)
    team.value = allTeams.find(t => t.id === teamId) || null
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.push('/team/hub')
}

function sendMessage() {
  if (!newMessage.value.trim()) return
  messages.value.push({
    id: Date.now(),
    userId: userId.value,
    userName: profile.value?.username || '我',
    content: newMessage.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isOwner: isOwner.value,
  })
  newMessage.value = ''
}

function addTask() {
  if (!newTaskTitle.value.trim()) return
  tasks.value.push({
    id: Date.now(),
    title: newTaskTitle.value,
    assignee: '待分配',
    status: 'todo',
    dueDate: '待定',
  })
  newTaskTitle.value = ''
  showNewTaskInput.value = false
}

function toggleTaskStatus(taskId: number) {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    if (task.status === 'todo') task.status = 'in-progress'
    else if (task.status === 'in-progress') task.status = 'done'
    else task.status = 'todo'
  }
}
</script>

<template>
  <div class="team-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-48 bg-slate/10 rounded"></div>
        <div class="h-4 w-96 bg-slate/10 rounded"></div>
      </div>
    </div>

    <!-- 小组不存在 -->
    <div v-else-if="!team" class="empty-state">
      <p class="text-slate mb-4">小组不存在或已被删除</p>
      <button @click="goBack" class="text-focus-accent">返回协作空间</button>
    </div>

    <template v-else>
      <!-- 顶部导航 -->
      <header class="page-header">
        <button @click="goBack" class="back-btn">
          <ArrowLeft :size="20" />
          <span>返回</span>
        </button>
        
        <div class="header-info">
          <div class="flex items-center gap-3">
            <div 
              class="team-avatar"
              :class="frequencyStore.isFocus ? 'avatar-focus' : 'avatar-vibe'"
            >
              {{ team.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-h2 font-sans font-bold text-charcoal">{{ team.name }}</h1>
                <span 
                  v-if="isOwner" 
                  class="owner-badge"
                >
                  <Crown :size="12" />
                  创建者
                </span>
              </div>
              <div class="flex items-center gap-4 mt-1 text-sm text-slate">
                <span class="flex items-center gap-1">
                  <Users :size="14" />
                  {{ team.currentMembers }}/{{ team.maxMembers }} 人
                </span>
                <span class="flex items-center gap-1">
                  <MapPin :size="14" />
                  {{ team.college }}
                </span>
                <span class="flex items-center gap-1">
                  <Calendar :size="14" />
                  {{ team.createdAt.slice(0, 10) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 标签页导航 -->
      <nav class="tab-nav">
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ 'tab-active': activeTab === tab.id }"
          @click="activeTab = tab.id as TabType"
        >
          <component :is="tab.icon" :size="18" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <!-- 内容区域 -->
      <main class="content-area">
        <!-- 交流室 -->
        <div v-if="activeTab === 'chat'" class="chat-panel">
          <div class="chat-messages">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-item"
              :class="{ 'message-mine': msg.userId === userId }"
            >
              <div class="message-avatar">
                {{ msg.userName.charAt(0) }}
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-name">{{ msg.userName }}</span>
                  <span v-if="msg.isOwner" class="message-owner-tag">队长</span>
                  <span class="message-time">{{ msg.time }}</span>
                </div>
                <p class="message-text">{{ msg.content }}</p>
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <input
              v-model="newMessage"
              type="text"
              placeholder="输入消息..."
              class="input-field"
              @keyup.enter="sendMessage"
            />
            <button 
              @click="sendMessage" 
              class="send-btn"
              :class="frequencyStore.isFocus ? 'btn-focus' : 'btn-vibe'"
            >
              <Send :size="18" />
            </button>
          </div>
        </div>

        <!-- 任务板 -->
        <div v-if="activeTab === 'tasks'" class="tasks-panel">
          <!-- 任务统计 -->
          <div class="task-stats">
            <div class="stat-card">
              <span class="stat-value">{{ taskStats.total }}</span>
              <span class="stat-label">总任务</span>
            </div>
            <div class="stat-card stat-done">
              <span class="stat-value">{{ taskStats.done }}</span>
              <span class="stat-label">已完成</span>
            </div>
            <div class="stat-card stat-progress">
              <span class="stat-value">{{ taskStats.inProgress }}</span>
              <span class="stat-label">进行中</span>
            </div>
            <div class="stat-card stat-todo">
              <span class="stat-value">{{ taskStats.todo }}</span>
              <span class="stat-label">待开始</span>
            </div>
          </div>

          <!-- 添加任务 -->
          <div v-if="isOwner" class="add-task-section">
            <div v-if="showNewTaskInput" class="new-task-input">
              <input
                v-model="newTaskTitle"
                type="text"
                placeholder="输入任务标题..."
                class="input-field"
                @keyup.enter="addTask"
              />
              <button @click="addTask" class="add-btn">添加</button>
              <button @click="showNewTaskInput = false" class="cancel-btn">取消</button>
            </div>
            <button v-else @click="showNewTaskInput = true" class="new-task-btn">
              <Plus :size="18" />
              添加新任务
            </button>
          </div>

          <!-- 任务列表 -->
          <div class="task-list">
            <div
              v-for="task in tasks"
              :key="task.id"
              class="task-item"
              :class="`task-${task.status}`"
            >
              <button 
                class="task-status-btn"
                @click="toggleTaskStatus(task.id)"
              >
                <Check v-if="task.status === 'done'" :size="16" />
                <Circle v-else :size="16" :class="{ 'half-fill': task.status === 'in-progress' }" />
              </button>
              <div class="task-content">
                <p class="task-title" :class="{ 'task-done-title': task.status === 'done' }">
                  {{ task.title }}
                </p>
                <div class="task-meta">
                  <span>{{ task.assignee }}</span>
                  <span>截止: {{ task.dueDate }}</span>
                </div>
              </div>
              <button class="task-more-btn">
                <MoreHorizontal :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- 文件库 -->
        <div v-if="activeTab === 'files'" class="files-panel">
          <div class="files-header">
            <p class="font-mono text-xs text-slate">共 {{ files.length }} 个文件</p>
            <button v-if="isOwner" class="upload-btn">
              <Plus :size="16" />
              上传文件
            </button>
          </div>
          
          <div class="file-list">
            <div v-for="file in files" :key="file.id" class="file-item">
              <div class="file-icon">
                <FileText :size="24" />
              </div>
              <div class="file-info">
                <p class="file-name">{{ file.name }}</p>
                <p class="file-meta">{{ file.size }} · {{ file.uploadedBy }} · {{ file.date }}</p>
              </div>
              <button class="file-download-btn">下载</button>
            </div>
          </div>
        </div>

        <!-- 设置（仅创建者可见） -->
        <div v-if="activeTab === 'settings' && isOwner" class="settings-panel">
          <div class="settings-section">
            <h3 class="section-title">小组信息</h3>
            <div class="settings-form">
              <div class="form-group">
                <label>小组名称</label>
                <input type="text" :value="team.name" class="input-field" />
              </div>
              <div class="form-group">
                <label>小组描述</label>
                <textarea :value="team.description" class="input-field" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>最大人数</label>
                <input type="number" :value="team.maxMembers" class="input-field" />
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3 class="section-title">成员管理</h3>
            <div class="member-list">
              <div v-for="member in team.members" :key="member.id" class="member-item">
                <div class="member-avatar">{{ member.name.charAt(0) }}</div>
                <div class="member-info">
                  <p class="member-name">{{ member.name }}</p>
                  <p class="member-role">{{ member.id === team.ownerId ? '创建者' : '成员' }}</p>
                </div>
                <button v-if="member.id !== team.ownerId" class="remove-btn">移除</button>
              </div>
            </div>
          </div>

          <div class="settings-section danger-zone">
            <h3 class="section-title">危险操作</h3>
            <button class="danger-btn">解散小组</button>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.team-detail-page {
  @apply min-h-screen;
}

.loading-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-20;
}

/* 页面头部 */
.page-header {
  @apply flex items-center gap-6 mb-6;
}

.back-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg;
  @apply text-slate hover:text-charcoal hover:bg-slate/5;
  @apply transition-all duration-200;
}

.header-info {
  @apply flex-1;
}

.team-avatar {
  @apply w-12 h-12 rounded-xl flex items-center justify-center;
  @apply font-sans font-bold text-white text-lg;
}

.avatar-focus {
  @apply bg-gradient-to-br from-focus-primary to-focus-accent;
}

.avatar-vibe {
  @apply bg-gradient-to-br from-vibe-primary to-vibe-accent;
}

.owner-badge {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full;
  @apply bg-gradient-to-r from-amber-400 to-orange-400;
  @apply text-white text-xs font-medium;
}

/* 标签页导航 */
.tab-nav {
  @apply flex gap-1 p-1 rounded-xl bg-slate/5 mb-6;
}

.tab-btn {
  @apply flex items-center gap-2 px-4 py-2.5 rounded-lg;
  @apply font-sans text-sm text-slate;
  @apply transition-all duration-200;
}

.tab-btn:hover {
  @apply text-charcoal bg-white/50;
}

.tab-active {
  @apply bg-white text-charcoal shadow-sm;
}

/* 内容区域 */
.content-area {
  @apply rounded-2xl bg-white border border-slate/10 overflow-hidden;
  min-height: 500px;
}

/* 交流室 */
.chat-panel {
  @apply flex flex-col h-[600px];
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-6 space-y-4;
}

.message-item {
  @apply flex gap-3;
}

.message-mine {
  @apply flex-row-reverse;
}

.message-avatar {
  @apply w-8 h-8 rounded-full bg-slate/10 flex items-center justify-center;
  @apply font-sans text-sm font-medium text-slate;
}

.message-content {
  @apply max-w-[70%];
}

.message-header {
  @apply flex items-center gap-2 mb-1;
}

.message-name {
  @apply font-sans text-sm font-medium text-charcoal;
}

.message-owner-tag {
  @apply px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700;
}

.message-time {
  @apply font-mono text-xs text-slate;
}

.message-text {
  @apply px-4 py-2.5 rounded-2xl bg-slate/5;
  @apply font-sans text-sm text-charcoal;
}

.message-mine .message-text {
  @apply bg-focus-primary/10;
}

.chat-input {
  @apply flex gap-3 p-4 border-t border-slate/10;
}

.input-field {
  @apply flex-1 px-4 py-2.5 rounded-xl border border-slate/20;
  @apply font-sans text-sm text-charcoal;
  @apply focus:outline-none focus:border-focus-primary;
}

.send-btn {
  @apply p-3 rounded-xl text-white;
  @apply transition-all duration-200 hover:scale-105;
}

.btn-focus {
  @apply bg-focus-accent;
}

.btn-vibe {
  @apply bg-vibe-accent;
}

/* 任务板 */
.tasks-panel {
  @apply p-6;
}

.task-stats {
  @apply grid grid-cols-4 gap-4 mb-6;
}

.stat-card {
  @apply p-4 rounded-xl bg-slate/5 text-center;
}

.stat-value {
  @apply block font-mono text-2xl font-bold text-charcoal;
}

.stat-label {
  @apply font-sans text-xs text-slate;
}

.stat-done { @apply bg-emerald-50; }
.stat-done .stat-value { @apply text-emerald-600; }

.stat-progress { @apply bg-amber-50; }
.stat-progress .stat-value { @apply text-amber-600; }

.stat-todo { @apply bg-slate/5; }

.add-task-section {
  @apply mb-6;
}

.new-task-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg;
  @apply border border-dashed border-slate/30 text-slate;
  @apply hover:border-focus-primary hover:text-focus-accent;
  @apply transition-all duration-200;
}

.new-task-input {
  @apply flex gap-2;
}

.add-btn {
  @apply px-4 py-2 rounded-lg bg-focus-accent text-white text-sm;
}

.cancel-btn {
  @apply px-4 py-2 rounded-lg bg-slate/10 text-slate text-sm;
}

.task-list {
  @apply space-y-2;
}

.task-item {
  @apply flex items-center gap-3 p-4 rounded-xl;
  @apply border border-slate/10 bg-white;
  @apply transition-all duration-200 hover:shadow-sm;
}

.task-done {
  @apply bg-emerald-50/50 border-emerald-100;
}

.task-in-progress {
  @apply border-l-4 border-l-amber-400;
}

.task-status-btn {
  @apply w-6 h-6 rounded-full flex items-center justify-center;
  @apply text-slate hover:text-focus-accent;
  @apply transition-colors duration-200;
}

.task-done .task-status-btn {
  @apply text-emerald-500;
}

.half-fill {
  @apply text-amber-500;
}

.task-content {
  @apply flex-1;
}

.task-title {
  @apply font-sans text-sm font-medium text-charcoal;
}

.task-done-title {
  @apply line-through text-slate;
}

.task-meta {
  @apply flex gap-3 mt-1 font-mono text-xs text-slate;
}

.task-more-btn {
  @apply p-1 rounded text-slate/40 hover:text-slate;
}

/* 文件库 */
.files-panel {
  @apply p-6;
}

.files-header {
  @apply flex items-center justify-between mb-6;
}

.upload-btn {
  @apply flex items-center gap-1 px-3 py-1.5 rounded-lg;
  @apply bg-focus-accent text-white text-sm;
}

.file-list {
  @apply space-y-2;
}

.file-item {
  @apply flex items-center gap-4 p-4 rounded-xl;
  @apply border border-slate/10 hover:bg-slate/5;
  @apply transition-all duration-200;
}

.file-icon {
  @apply w-10 h-10 rounded-lg bg-slate/10 flex items-center justify-center text-slate;
}

.file-info {
  @apply flex-1;
}

.file-name {
  @apply font-sans text-sm font-medium text-charcoal;
}

.file-meta {
  @apply font-mono text-xs text-slate mt-0.5;
}

.file-download-btn {
  @apply px-3 py-1 rounded-lg text-sm text-focus-accent hover:bg-focus-primary/10;
}

/* 设置 */
.settings-panel {
  @apply p-6 space-y-8;
}

.settings-section {
  @apply pb-6 border-b border-slate/10;
}

.section-title {
  @apply font-sans font-semibold text-charcoal mb-4;
}

.settings-form {
  @apply space-y-4;
}

.form-group {
  @apply space-y-2;
}

.form-group label {
  @apply block font-sans text-sm text-slate;
}

.form-group textarea {
  @apply resize-none;
}

.member-list {
  @apply space-y-2;
}

.member-item {
  @apply flex items-center gap-3 p-3 rounded-lg hover:bg-slate/5;
}

.member-avatar {
  @apply w-8 h-8 rounded-full bg-focus-primary/20 flex items-center justify-center;
  @apply font-sans text-sm font-medium text-focus-accent;
}

.member-info {
  @apply flex-1;
}

.member-name {
  @apply font-sans text-sm font-medium text-charcoal;
}

.member-role {
  @apply font-mono text-xs text-slate;
}

.remove-btn {
  @apply px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50;
}

.danger-zone {
  @apply border-red-100;
}

.danger-btn {
  @apply px-4 py-2 rounded-lg bg-red-500 text-white text-sm;
  @apply hover:bg-red-600 transition-colors;
}
</style>
