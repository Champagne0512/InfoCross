<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { 
  fetchAdminStats, 
  fetchAdminApplications, 
  fetchAdminUsers,
  fetchAdminTeams,
  fetchAdminForumPosts,
  approveApplication,
  rejectApplication,
  toggleUserAdmin,
  deleteForumPost
} from '@/api/admin'
import type { 
  AdminStats, 
  AdminApplicationItem, 
  AdminUserItem, 
  AdminTeamItem, 
  AdminForumItem 
} from '@/api/admin'
import AppButton from '@/components/common/AppButton.vue'
import { 
  ShieldCheck, Database, Users, RefreshCw, Lock,
  LayoutDashboard, FileText, UserCog, FolderKanban, MessageSquare,
  Check, X, Trash2, Crown
} from 'lucide-vue-next'

const userStore = useUserStore()
const isLoaded = ref(false)

// 标签页
type TabKey = 'overview' | 'users' | 'teams' | 'applications' | 'forum'
const activeTab = ref<TabKey>('overview')

const tabs = [
  { key: 'overview' as TabKey, label: '总览', icon: LayoutDashboard },
  { key: 'users' as TabKey, label: '用户管理', icon: UserCog },
  { key: 'teams' as TabKey, label: '小组管理', icon: FolderKanban },
  { key: 'applications' as TabKey, label: '申请审批', icon: FileText },
  { key: 'forum' as TabKey, label: '论坛内容', icon: MessageSquare },
]

onMounted(() => {
  setTimeout(() => isLoaded.value = true, 100)
})

// 登录相关
const email = ref('')
const password = ref('')
const loginLoading = ref(false)
const loginError = ref('')

// 数据状态
const stats = ref<AdminStats | null>(null)
const applications = ref<AdminApplicationItem[]>([])
const users = ref<AdminUserItem[]>([])
const teams = ref<AdminTeamItem[]>([])
const forumPosts = ref<AdminForumItem[]>([])
const dataLoading = ref(false)
const dataError = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    loginError.value = '请输入邮箱和密码'
    return
  }
  loginLoading.value = true
  loginError.value = ''
  try {
    await userStore.login(email.value, password.value)
    if (!userStore.isAdmin) {
      loginError.value = '此账号未开通管理员权限'
      await userStore.logout()
    }
  } catch (error: any) {
    loginError.value = error?.message ?? '登录失败'
  } finally {
    loginLoading.value = false
  }
}

async function handleLogout() {
  await userStore.logout()
  stats.value = null
  applications.value = []
  users.value = []
  teams.value = []
  forumPosts.value = []
}

async function loadAllData() {
  if (!userStore.isAdmin) return
  dataLoading.value = true
  dataError.value = ''
  try {
    const [statsData, appsData, usersData, teamsData, forumData] = await Promise.all([
      fetchAdminStats(),
      fetchAdminApplications(),
      fetchAdminUsers(),
      fetchAdminTeams(),
      fetchAdminForumPosts(),
    ])
    stats.value = statsData
    applications.value = appsData
    users.value = usersData
    teams.value = teamsData
    forumPosts.value = forumData
  } catch (error: any) {
    console.error('[admin] load failed', error)
    dataError.value = error?.message ?? '加载数据失败'
  } finally {
    dataLoading.value = false
  }
}

watch(() => userStore.isAdmin, (value) => {
  if (value) loadAllData()
}, { immediate: true })

// 操作函数
async function handleApprove(app: AdminApplicationItem) {
  try {
    await approveApplication(app.id)
    app.status = 'approved'
  } catch (e) {
    console.error(e)
  }
}

async function handleReject(app: AdminApplicationItem) {
  try {
    await rejectApplication(app.id)
    app.status = 'rejected'
  } catch (e) {
    console.error(e)
  }
}

async function handleToggleAdmin(user: AdminUserItem) {
  try {
    await toggleUserAdmin(user.id, !user.isAdmin)
    user.isAdmin = !user.isAdmin
  } catch (e) {
    console.error(e)
  }
}

async function handleDeletePost(post: AdminForumItem) {
  if (!confirm('确定删除这条帖子吗？')) return
  try {
    await deleteForumPost(post.id)
    forumPosts.value = forumPosts.value.filter(p => p.id !== post.id)
  } catch (e) {
    console.error(e)
  }
}

// 统计卡片
const statCards = computed(() => [
  { label: '总用户数', value: stats.value?.totalUsers ?? 0, icon: Users, color: 'text-vibe-accent', bg: 'bg-vibe-primary/10' },
  { label: '活跃小组', value: stats.value?.activeTeams ?? 0, icon: FolderKanban, color: 'text-focus-accent', bg: 'bg-focus-primary/10' },
  { label: '论坛帖子', value: stats.value?.totalForumPosts ?? 0, icon: MessageSquare, color: 'text-morandi-blue', bg: 'bg-morandi-blue/10' },
  { label: '待审申请', value: stats.value?.pendingApplications ?? 0, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
  { label: '资讯总量', value: stats.value?.totalArticles ?? 0, icon: Database, color: 'text-morandi-green', bg: 'bg-morandi-green/10' },
])

const pendingApps = computed(() => applications.value.filter(a => a.status === 'pending'))

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN', { 
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
  })
}
</script>

<template>
  <div class="admin-container">
    <!-- 头部 -->
    <header class="page-header" :class="{ 'loaded': isLoaded }">
      <div class="header-content">
        <div class="flex items-center justify-center gap-3 mb-2">
          <div class="shield-icon"><ShieldCheck :size="24" /></div>
          <p class="header-subtitle">ADMIN CONSOLE</p>
        </div>
        <h1 class="header-title">
          <span class="title-text">管理后台</span>
          <span class="title-underline"></span>
        </h1>
        <p class="header-desc">统一监控平台内容流、招募热度与用户增长</p>
      </div>
    </header>

    <!-- 未登录 -->
    <div v-if="!userStore.isAdmin" class="login-section section-animate" :class="{ 'loaded': isLoaded }">
      <div class="login-card">
        <div class="login-icon"><Lock :size="32" /></div>
        <h2 class="login-title">管理员身份验证</h2>
        <p class="login-desc">使用被授予权限的账号登录</p>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="email" type="email" placeholder="admin@infocross.edu" @keydown.enter="handleLogin" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="••••••••" @keydown.enter="handleLogin" />
        </div>
        <p v-if="loginError" class="error-text">{{ loginError }}</p>
        <AppButton class="w-full" :loading="loginLoading" @click="handleLogin">进入控制台</AppButton>
      </div>
    </div>

    <!-- 已登录 - 仪表盘 -->
    <div v-else class="dashboard section-animate" :class="{ 'loaded': isLoaded }">
      <!-- 顶部操作栏 -->
      <div class="top-bar">
        <div class="welcome">
          <p class="welcome-label">欢迎回来</p>
          <p class="welcome-name">{{ userStore.profile?.username }}</p>
        </div>
        <div class="top-actions">
          <AppButton variant="ghost" :loading="dataLoading" @click="loadAllData">
            <RefreshCw :size="16" /> 刷新
          </AppButton>
          <AppButton variant="secondary" @click="handleLogout">退出</AppButton>
        </div>
      </div>

      <!-- 标签页导航 -->
      <nav class="tab-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-btn"
          :class="{ 'tab-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" :size="16" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <p v-if="dataError" class="error-banner">{{ dataError }}</p>

      <!-- 总览 -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="stat-grid">
          <div v-for="card in statCards" :key="card.label" class="stat-card">
            <div class="stat-icon" :class="[card.bg, card.color]">
              <component :is="card.icon" :size="20" />
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ card.value }}</p>
              <p class="stat-label">{{ card.label }}</p>
            </div>
          </div>
        </div>

        <!-- 快速预览 -->
        <div class="preview-grid">
          <div class="preview-card">
            <h3 class="preview-title">待审批申请 ({{ pendingApps.length }})</h3>
            <div v-if="pendingApps.length === 0" class="empty-mini">暂无待审批</div>
            <ul v-else class="preview-list">
              <li v-for="app in pendingApps.slice(0, 5)" :key="app.id" class="preview-item">
                <span class="preview-name">{{ app.applicantName }}</span>
                <span class="preview-detail">申请加入 {{ app.teamName }}</span>
              </li>
            </ul>
            <button v-if="pendingApps.length > 0" class="view-all-btn" @click="activeTab = 'applications'">
              查看全部 →
            </button>
          </div>

          <div class="preview-card">
            <h3 class="preview-title">最新用户 ({{ users.length }})</h3>
            <div v-if="users.length === 0" class="empty-mini">暂无用户</div>
            <ul v-else class="preview-list">
              <li v-for="user in users.slice(0, 5)" :key="user.id" class="preview-item">
                <span class="preview-name">{{ user.username }}</span>
                <span class="preview-detail">{{ user.college || '未填写学院' }}</span>
              </li>
            </ul>
            <button v-if="users.length > 0" class="view-all-btn" @click="activeTab = 'users'">
              查看全部 →
            </button>
          </div>
        </div>
      </div>

      <!-- 用户管理 -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>邮箱</th>
                <th>学院</th>
                <th>专业</th>
                <th>注册时间</th>
                <th>管理员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="font-medium">{{ user.username }}</td>
                <td class="text-slate">{{ user.email }}</td>
                <td>{{ user.college || '-' }}</td>
                <td>{{ user.major || '-' }}</td>
                <td class="text-slate text-sm">{{ formatDate(user.createdAt) }}</td>
                <td>
                  <span v-if="user.isAdmin" class="badge badge-admin">管理员</span>
                  <span v-else class="badge badge-user">普通用户</span>
                </td>
                <td>
                  <button 
                    class="action-btn"
                    :class="user.isAdmin ? 'btn-danger' : 'btn-primary'"
                    @click="handleToggleAdmin(user)"
                  >
                    <Crown :size="14" />
                    {{ user.isAdmin ? '取消管理员' : '设为管理员' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 小组管理 -->
      <div v-if="activeTab === 'teams'" class="tab-content">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>小组名称</th>
                <th>模式</th>
                <th>状态</th>
                <th>成员数</th>
                <th>创建者</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in teams" :key="team.id">
                <td class="font-medium">{{ team.name }}</td>
                <td>
                  <span class="badge" :class="team.mode === 'focus' ? 'badge-focus' : 'badge-vibe'">
                    {{ team.mode.toUpperCase() }}
                  </span>
                </td>
                <td>{{ team.status }}</td>
                <td>{{ team.memberCount }}</td>
                <td>{{ team.creatorName }}</td>
                <td class="text-slate text-sm">{{ formatDate(team.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 申请审批 -->
      <div v-if="activeTab === 'applications'" class="tab-content">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>申请人</th>
                <th>学院</th>
                <th>目标小组</th>
                <th>模式</th>
                <th>申请留言</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in applications" :key="app.id">
                <td class="font-medium">{{ app.applicantName }}</td>
                <td>{{ app.applicantCollege || '-' }}</td>
                <td>{{ app.teamName }}</td>
                <td>
                  <span class="badge" :class="app.mode === 'focus' ? 'badge-focus' : 'badge-vibe'">
                    {{ app.mode.toUpperCase() }}
                  </span>
                </td>
                <td class="text-slate text-sm max-w-[200px] truncate">{{ app.message || '-' }}</td>
                <td>
                  <span class="badge" :class="{
                    'badge-pending': app.status === 'pending',
                    'badge-approved': app.status === 'approved',
                    'badge-rejected': app.status === 'rejected'
                  }">
                    {{ app.status === 'pending' ? '待审批' : app.status === 'approved' ? '已通过' : '已拒绝' }}
                  </span>
                </td>
                <td class="text-slate text-sm">{{ formatDate(app.createdAt) }}</td>
                <td>
                  <div v-if="app.status === 'pending'" class="flex gap-2">
                    <button class="action-btn btn-success" @click="handleApprove(app)">
                      <Check :size="14" /> 通过
                    </button>
                    <button class="action-btn btn-danger" @click="handleReject(app)">
                      <X :size="14" /> 拒绝
                    </button>
                  </div>
                  <span v-else class="text-slate text-sm">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 论坛内容 -->
      <div v-if="activeTab === 'forum'" class="tab-content">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>标题/内容</th>
                <th>作者</th>
                <th>点赞</th>
                <th>评论</th>
                <th>发布时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in forumPosts" :key="post.id">
                <td>
                  <span class="badge" :class="post.type === 'signal' ? 'badge-signal' : 'badge-depth'">
                    {{ post.type === 'signal' ? 'Signal' : 'Depth' }}
                  </span>
                </td>
                <td class="max-w-[300px]">
                  <p v-if="post.title" class="font-medium truncate">{{ post.title }}</p>
                  <p class="text-slate text-sm truncate">{{ post.contentText }}</p>
                </td>
                <td>{{ post.authorName }}</td>
                <td>{{ post.likeCount }}</td>
                <td>{{ post.commentCount }}</td>
                <td class="text-slate text-sm">{{ formatDate(post.createdAt) }}</td>
                <td>
                  <button class="action-btn btn-danger" @click="handleDeletePost(post)">
                    <Trash2 :size="14" /> 删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.admin-container {
  min-height: 100vh;
  background: #F9F7F4;
  padding-bottom: 4rem;
}

/* 头部 */
.page-header {
  text-align: center;
  padding: 3rem 1.5rem 2rem;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.6s ease;
}
.page-header.loaded {
  opacity: 1;
  transform: translateY(0);
}
.header-content {
  max-width: 600px;
  margin: 0 auto;
}
.shield-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b9dc3 0%, #a8b5c9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.header-subtitle {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: #8b9dc3;
  font-weight: 600;
}
.header-title {
  position: relative;
  display: inline-block;
  margin-top: 0.75rem;
}
.title-text {
  font-size: 2rem;
  font-weight: 700;
  color: #4a5568;
  letter-spacing: 0.05em;
}
.title-underline {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #8b9dc3, #c9b8a8);
  border-radius: 2px;
}
.header-desc {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #718096;
}

/* 动画 */
.section-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.2s;
}
.section-animate.loaded {
  opacity: 1;
  transform: translateY(0);
}

/* 登录卡片 */
.login-section {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}
.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
.login-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #e8e4df 0%, #d9d2c9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}
.login-title {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}
.login-desc {
  text-align: center;
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}
.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e0dc;
  border-radius: 10px;
  font-size: 0.9rem;
  background: #faf9f7;
  transition: all 0.2s;
}
.form-group input:focus {
  outline: none;
  border-color: #8b9dc3;
  background: white;
}
.error-text {
  color: #e57373;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  text-align: center;
}

/* 仪表盘 */
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.welcome-label {
  font-size: 0.75rem;
  color: #9ca3af;
}
.welcome-name {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
}
.top-actions {
  display: flex;
  gap: 0.75rem;
}

/* 标签页导航 */
.tab-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.tab-btn:hover {
  background: #f5f3f0;
  color: #4a5568;
}
.tab-btn.tab-active {
  background: linear-gradient(135deg, #8b9dc3 0%, #a8b5c9 100%);
  color: white;
}

.error-banner {
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* 标签页内容 */
.tab-content {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 统计卡片 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4a5568;
}
.stat-label {
  font-size: 0.8rem;
  color: #9ca3af;
}

/* 预览卡片 */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
.preview-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.preview-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0ebe4;
}
.empty-mini {
  text-align: center;
  padding: 1.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}
.preview-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f5f3f0;
}
.preview-item:last-child {
  border-bottom: none;
}
.preview-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
}
.preview-detail {
  font-size: 0.75rem;
  color: #9ca3af;
}
.view-all-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.6rem;
  background: #f5f3f0;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}
.view-all-btn:hover {
  background: #e8e4df;
  color: #4a5568;
}

/* 数据表格 */
.data-table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.data-table th {
  text-align: left;
  padding: 1rem;
  background: #f8f6f3;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e8e4df;
}
.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f5f3f0;
  color: #4a5568;
}
.data-table tbody tr:hover {
  background: #faf9f7;
}
.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* 徽章 */
.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge-admin {
  background: linear-gradient(135deg, #8b9dc3 0%, #a8b5c9 100%);
  color: white;
}
.badge-user {
  background: #f0ebe4;
  color: #6b7280;
}
.badge-focus {
  background: linear-gradient(135deg, #a8b5c9 0%, #8b9dc3 100%);
  color: white;
}
.badge-vibe {
  background: linear-gradient(135deg, #c9b8a8 0%, #b8a898 100%);
  color: white;
}
.badge-pending {
  background: #fef3c7;
  color: #d97706;
}
.badge-approved {
  background: #d1fae5;
  color: #059669;
}
.badge-rejected {
  background: #fee2e2;
  color: #dc2626;
}
.badge-signal {
  background: #e0f2fe;
  color: #0284c7;
}
.badge-depth {
  background: #f3e8ff;
  color: #9333ea;
}

/* 操作按钮 */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: #e8e4df;
  color: #4a5568;
}
.btn-primary:hover {
  background: #d9d2c9;
}
.btn-success {
  background: #d1fae5;
  color: #059669;
}
.btn-success:hover {
  background: #a7f3d0;
}
.btn-danger {
  background: #fee2e2;
  color: #dc2626;
}
.btn-danger:hover {
  background: #fecaca;
}

/* 辅助类 */
.text-slate {
  color: #718096;
}
.font-medium {
  font-weight: 500;
}
.text-sm {
  font-size: 0.8rem;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.flex {
  display: flex;
}
.gap-2 {
  gap: 0.5rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem 1.5rem;
  }
  .title-text {
    font-size: 1.5rem;
  }
  .dashboard {
    padding: 0 1rem;
  }
  .top-bar {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  .tab-nav {
    padding: 0.25rem;
  }
  .tab-btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .data-table-wrapper {
    overflow-x: auto;
  }
  .data-table {
    min-width: 700px;
  }
}
</style>
