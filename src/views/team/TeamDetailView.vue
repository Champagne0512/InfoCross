<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Crown,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  CheckSquare,
  FileText,
  Settings,
  Send,
  Plus,
  MoreHorizontal,
  Check,
  Circle,
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useFrequencyStore } from '@/stores/frequencyStore'
import { fetchTeamById, updateTeamInfo, deleteTeam, setTeamMemberAdmin, leaveTeam } from '@/api/team'
import {
  fetchTeamChatMessages,
  sendTeamChatMessage,
  subscribeTeamChat,
  fetchTeamTasks,
  createTeamTask,
  updateTeamTaskStatus,
  fetchTeamFiles,
  uploadTeamFile,
  assignMembersToTask,
  updateTaskAssignmentStatus,
  fetchTeamApplicationQueue,
  respondTeamApplication,
} from '@/api/teamWorkspace'
import type { Team, TeamApplication, TeamChatMessage, TeamTask, TeamFile } from '@/types/models'
import type { RealtimeChannel } from '@supabase/supabase-js'

type TabType = 'chat' | 'tasks' | 'files' | 'settings'

const route = useRoute()
const router = useRouter()
const { profile } = useAuth()
const frequencyStore = useFrequencyStore()

const team = ref<Team | null>(null)
const loading = ref(true)
const chatLoading = ref(true)
const tasksLoading = ref(true)
const filesLoading = ref(true)
const uploadingFile = ref(false)
const uploadError = ref('')
const activeTab = ref<TabType>('chat')
const newMessage = ref('')
const newTaskTitle = ref('')
const showNewTaskInput = ref(false)
const newTaskAssignees = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
let chatChannel: RealtimeChannel | null = null

const userId = computed(() => profile.value?.id ?? '')
const isOwner = computed(() => team.value?.ownerId === userId.value)
const currentMember = computed(() => team.value?.members.find((member) => member.id === userId.value))
const isAdmin = computed(() => Boolean(currentMember.value?.isAdmin))
const canManageTeam = computed(() => isOwner.value || isAdmin.value)
const canManageTasks = computed(() => canManageTeam.value)
const canUploadFiles = computed(() => canManageTeam.value)
const canAssignAdmin = computed(() => isOwner.value)
const canLeaveTeam = computed(() => Boolean(currentMember.value) && !isOwner.value)

const messages = ref<TeamChatMessage[]>([])
const tasks = ref<TeamTask[]>([])
const files = ref<TeamFile[]>([])
const applicationQueue = ref<TeamApplication[]>([])
const applicationQueueLoading = ref(false)
const applicationQueueError = ref('')
const applicationActionLoading = ref<Record<number, boolean>>({})
const editForm = reactive({
  name: '',
  description: '',
  maxMembers: 0,
  tagsText: '',
  college: '',
})
const savingSettings = ref(false)
const settingsMessage = ref('')
const settingsError = ref('')
const disbandConfirm = ref(false)
const disbandLoading = ref(false)
const disbandError = ref('')
const leavingTeam = ref(false)
const leaveError = ref('')
const memberRoleLoading = ref<Record<string, boolean>>({})
const assignmentEditor = ref<{ taskId: number; selected: Set<string> } | null>(null)
const assignmentSaving = ref(false)

const tabs = [
  { id: 'chat', label: '交流室', icon: MessageCircle },
  { id: 'tasks', label: '任务板', icon: CheckSquare },
  { id: 'files', label: '文件库', icon: FileText },
  { id: 'settings', label: '设置', icon: Settings },
]

const visibleTabs = computed(() => tabs)

const taskStats = computed(() => ({
  total: tasks.value.length,
  done: tasks.value.filter((t) => t.status === 'done').length,
  inProgress: tasks.value.filter((t) => t.status === 'in-progress').length,
  todo: tasks.value.filter((t) => t.status === 'todo').length,
}))

const formattedMessages = computed(() =>
  messages.value.map((msg) => ({
    ...msg,
    time: new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  })),
)

function formatDate(value?: string) {
  if (!value) return '待定'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')}`
}

function formatFileSize(size?: number) {
  if (!size) return '未知大小'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function syncEditForm() {
  if (!team.value) return
  editForm.name = team.value.name
  editForm.description = team.value.description || ''
  editForm.maxMembers = team.value.maxMembers
  editForm.tagsText = team.value.tags?.join(', ') ?? ''
  editForm.college = team.value.college || ''
}

async function loadTeamDetail() {
  loading.value = true
  try {
    const teamId = Number(route.params.id)
    if (!teamId) {
      team.value = null
      return
    }
    team.value = await fetchTeamById(teamId)
    syncEditForm()
    if (team.value) {
      await Promise.all([loadChat(teamId), loadTasks(teamId), loadFiles(teamId)])
    } else {
      messages.value = []
      tasks.value = []
      files.value = []
    }
  } catch (error) {
    console.error('加载队伍详情失败', error)
  } finally {
    loading.value = false
  }
}

function subscribeChat(teamId: number) {
  if (chatChannel) {
    void chatChannel.unsubscribe()
  }
  chatChannel = subscribeTeamChat(
    teamId,
    (msg) => {
      if (messages.value.some((m) => m.id === msg.id)) return
      messages.value = [...messages.value, msg]
    },
    team.value?.ownerId,
  )
}

async function loadChat(teamId: number) {
  chatLoading.value = true
  try {
    messages.value = await fetchTeamChatMessages(teamId, 200, team.value?.ownerId)
    subscribeChat(teamId)
  } catch (error) {
    console.error('加载聊天记录失败', error)
    messages.value = []
  } finally {
    chatLoading.value = false
  }
}

async function loadTasks(teamId: number) {
  tasksLoading.value = true
  try {
    tasks.value = await fetchTeamTasks(teamId)
  } catch (error) {
    console.error('加载任务失败', error)
    tasks.value = []
  } finally {
    tasksLoading.value = false
  }
}

async function loadFiles(teamId: number) {
  filesLoading.value = true
  try {
    files.value = await fetchTeamFiles(teamId)
  } catch (error) {
    console.error('加载文件失败', error)
    files.value = []
  } finally {
    filesLoading.value = false
  }
}

async function loadApplicationQueue(targetTeamId?: number) {
  const teamId = targetTeamId ?? team.value?.id
  if (!teamId || !canManageTeam.value) {
    applicationQueue.value = []
    return
  }
  applicationQueueLoading.value = true
  applicationQueueError.value = ''
  try {
    const applications = await fetchTeamApplicationQueue(teamId)
    applicationQueue.value = applications.filter((app) => app.status === 'pending')
  } catch (error) {
    applicationQueueError.value = (error as Error).message || '加载申请失败'
    applicationQueue.value = []
  } finally {
    applicationQueueLoading.value = false
  }
}

function goBack() {
  router.push('/team/hub')
}

function toggleNewTaskAssignee(memberId: string) {
  if (newTaskAssignees.value.includes(memberId)) {
    newTaskAssignees.value = newTaskAssignees.value.filter((id) => id !== memberId)
  } else {
    newTaskAssignees.value = [...newTaskAssignees.value, memberId]
  }
}

function openAssignmentEditor(task: TeamTask) {
  assignmentEditor.value = {
    taskId: task.id,
    selected: new Set(task.assignees.map((assignee) => assignee.memberId)),
  }
}

function toggleAssignmentSelection(memberId: string) {
  if (!assignmentEditor.value) return
  const { selected } = assignmentEditor.value
  if (selected.has(memberId)) {
    selected.delete(memberId)
  } else {
    selected.add(memberId)
  }
  assignmentEditor.value = { ...assignmentEditor.value, selected: new Set(selected) }
}

async function saveAssignmentEditor() {
  if (!assignmentEditor.value) return
  assignmentSaving.value = true
  try {
    const memberIds = Array.from(assignmentEditor.value.selected)
    const updatedAssignees = await assignMembersToTask(assignmentEditor.value.taskId, memberIds)
    tasks.value = tasks.value.map((task) =>
      task.id === assignmentEditor.value?.taskId ? { ...task, assignees: updatedAssignees } : task,
    )
    assignmentEditor.value = null
  } catch (error) {
    console.error('更新任务分配失败', error)
  } finally {
    assignmentSaving.value = false
  }
}

const assignmentActionLoading = ref<Record<string, boolean>>({})

async function submitAssignment(taskId: number) {
  if (!team.value || !userId.value) return
  assignmentActionLoading.value = { ...assignmentActionLoading.value, [`${taskId}-${userId.value}`]: true }
  try {
    await updateTaskAssignmentStatus(taskId, userId.value, 'submitted')
    tasks.value = tasks.value.map((task) =>
      task.id === taskId
        ? {
            ...task,
            assignees: task.assignees.map((assignee) =>
              assignee.memberId === userId.value ? { ...assignee, status: 'submitted' } : assignee,
            ),
          }
        : task,
    )
  } catch (error) {
    console.error('提交任务失败', error)
  } finally {
    assignmentActionLoading.value = { ...assignmentActionLoading.value, [`${taskId}-${userId.value}`]: false }
  }
}

async function confirmAssignment(taskId: number, memberId: string) {
  assignmentActionLoading.value = { ...assignmentActionLoading.value, [`${taskId}-${memberId}`]: true }
  try {
    await updateTaskAssignmentStatus(taskId, memberId, 'done')
    tasks.value = tasks.value.map((task) =>
      task.id === taskId
        ? {
            ...task,
            assignees: task.assignees.map((assignee) =>
              assignee.memberId === memberId ? { ...assignee, status: 'done' } : assignee,
            ),
          }
        : task,
    )
    const target = tasks.value.find((task) => task.id === taskId)
    if (target && target.assignees.length && target.assignees.every((assignee) => assignee.status === 'done')) {
      tasks.value = tasks.value.map((task) => (task.id === taskId ? { ...task, status: 'done' } : task))
    }
  } catch (error) {
    console.error('确认任务失败', error)
  } finally {
    assignmentActionLoading.value = { ...assignmentActionLoading.value, [`${taskId}-${memberId}`]: false }
  }
}

async function sendMessage() {
  if (!team.value || !newMessage.value.trim()) return
  const content = newMessage.value.trim()
  newMessage.value = ''
  try {
    const saved = await sendTeamChatMessage(team.value.id, content, team.value.ownerId)
    if (!messages.value.some((m) => m.id === saved.id)) {
      messages.value = [...messages.value, saved]
    }
  } catch (error) {
    console.error('发送消息失败', error)
    newMessage.value = content
  }
}

async function addTask() {
  if (!team.value || !newTaskTitle.value.trim() || !canManageTasks.value) return
  try {
    const task = await createTeamTask(team.value.id, newTaskTitle.value.trim(), newTaskAssignees.value)
    tasks.value = [...tasks.value, task]
    newTaskTitle.value = ''
    newTaskAssignees.value = []
    showNewTaskInput.value = false
  } catch (error) {
    console.error('创建任务失败', error)
  }
}

async function toggleTaskStatus(taskId: number) {
  if (!canManageTasks.value) return
  const task = tasks.value.find((t) => t.id === taskId)
  if (!task) return
  const statusCycle: Record<'todo' | 'in-progress' | 'done', 'todo' | 'in-progress' | 'done'> = {
    todo: 'in-progress',
    'in-progress': 'done',
    done: 'todo',
  }
  const nextStatus = statusCycle[task.status]
  try {
    const updated = await updateTeamTaskStatus(taskId, nextStatus)
    tasks.value = tasks.value.map((t) => (t.id === taskId ? updated : t))
  } catch (error) {
    console.error('更新任务状态失败', error)
  }
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!team.value || !target.files?.length || !canUploadFiles.value) return
  const file = target.files[0]!
  uploadingFile.value = true
  uploadError.value = ''
  try {
    const uploaded = await uploadTeamFile(team.value.id, file)
    files.value = [uploaded, ...files.value]
  } catch (error) {
    uploadError.value = (error as Error).message || '上传失败'
    console.error('上传文件失败', error)
  } finally {
    uploadingFile.value = false
    target.value = ''
  }
}

function openFile(url: string) {
  window.open(url, '_blank')
}

async function handleSaveSettings() {
  if (!team.value || !canManageTeam.value) return
  savingSettings.value = true
  settingsMessage.value = ''
  settingsError.value = ''
  try {
    const parsedTags = editForm.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    const updated = await updateTeamInfo(team.value.id, {
      name: editForm.name.trim() || team.value.name,
      description: editForm.description.trim(),
      maxMembers: Number(editForm.maxMembers) || team.value.maxMembers,
      tags: parsedTags,
      college: editForm.college.trim() || team.value.college,
    })
    team.value = updated
    syncEditForm()
    settingsMessage.value = '设置已保存'
    setTimeout(() => {
      settingsMessage.value = ''
    }, 3000)
  } catch (error) {
    settingsError.value = (error as Error).message || '保存失败'
  } finally {
    savingSettings.value = false
  }
}

async function toggleMemberAdmin(memberId: string, value: boolean) {
  if (!team.value || !canAssignAdmin.value) return
  memberRoleLoading.value = { ...memberRoleLoading.value, [memberId]: true }
  try {
    await setTeamMemberAdmin(team.value.id, memberId, value)
    team.value = {
      ...team.value,
      members: team.value.members.map((member) =>
        member.id === memberId ? { ...member, isAdmin: value } : member,
      ),
    }
  } catch (error) {
    console.error('更新管理员失败', error)
  } finally {
    memberRoleLoading.value = { ...memberRoleLoading.value, [memberId]: false }
  }
}

async function handleDisbandTeam() {
  if (!team.value || !isOwner.value) return
  disbandLoading.value = true
  disbandError.value = ''
  try {
    await deleteTeam(team.value.id)
    router.push('/team/hub')
  } catch (error) {
    disbandError.value = (error as Error).message || '解散失败'
  } finally {
    disbandLoading.value = false
  }
}

async function handleLeaveTeam() {
  if (!team.value || !canLeaveTeam.value) return
  const confirmed = window.confirm('确认退出该小组吗？退出后需重新申请才能加入。')
  if (!confirmed) return
  leavingTeam.value = true
  leaveError.value = ''
  try {
    await leaveTeam(team.value.id)
    router.push('/team/hub')
  } catch (error) {
    leaveError.value = (error as Error).message || '退出失败，请稍后再试'
  } finally {
    leavingTeam.value = false
  }
}

async function handleApplicationDecision(applicationId: number, decision: 'approved' | 'rejected') {
  applicationActionLoading.value = { ...applicationActionLoading.value, [applicationId]: true }
  applicationQueueError.value = ''
  try {
    await respondTeamApplication(applicationId, decision)
    await loadApplicationQueue()
    if (decision === 'approved') {
      await loadTeamDetail()
    }
  } catch (error) {
    applicationQueueError.value = (error as Error).message || '处理申请失败'
  } finally {
    applicationActionLoading.value = { ...applicationActionLoading.value, [applicationId]: false }
  }
}

function onAdminToggle(memberId: string, event: Event) {
  const target = event.target as HTMLInputElement | null
  if (!target) return
  toggleMemberAdmin(memberId, target.checked)
}

onMounted(loadTeamDetail)

watch(
  () => route.params.id,
  () => {
    loadTeamDetail()
  },
)

watch(
  () => [team.value?.id, canManageTeam.value],
  async ([teamId, canManage]) => {
    if (!teamId || !canManage) {
      applicationQueue.value = []
      applicationQueueError.value = ''
      return
    }
    await loadApplicationQueue(Number(teamId))
  },
  { immediate: true },
)

onUnmounted(() => {
  if (chatChannel) {
    void chatChannel.unsubscribe()
  }
})
</script>

<template>
  <div class="team-detail-page">
    <div v-if="loading" class="loading-state">
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-48 bg-slate/10 rounded"></div>
        <div class="h-4 w-96 bg-slate/10 rounded"></div>
      </div>
    </div>

    <div v-else-if="!team" class="empty-state">
      <p class="text-slate mb-4">小组不存在或已被删除</p>
      <button @click="goBack" class="text-focus-accent">返回协作空间</button>
    </div>

    <template v-else>
      <header class="page-header">
        <button @click="goBack" class="back-btn">
          <ArrowLeft :size="20" />
          <span>返回</span>
        </button>

        <div class="header-info">
          <div class="flex items-center gap-3">
            <div class="team-avatar" :class="frequencyStore.isFocus ? 'avatar-focus' : 'avatar-vibe'">
              {{ team.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-h2 font-sans font-bold text-charcoal">{{ team.name }}</h1>
                <span v-if="isOwner" class="owner-badge">
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

      <main class="content-area">
        <div v-if="activeTab === 'chat'" class="chat-panel">
          <div v-if="chatLoading" class="chat-loading">加载中...</div>
          <div v-else class="chat-messages">
            <p v-if="!messages.length" class="chat-empty">暂无消息，开始第一条讨论吧</p>
            <div
              v-for="msg in formattedMessages"
              :key="msg.id"
              class="message-item"
              :class="{ 'message-mine': msg.senderId === userId }"
            >
              <div class="message-avatar">
                {{ msg.senderName.charAt(0) }}
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-name">{{ msg.senderName }}</span>
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
              :disabled="!newMessage.trim()"
            >
              <Send :size="18" />
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'tasks'" class="tasks-panel">
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

          <div v-if="canManageTasks" class="add-task-section">
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
            <div v-if="showNewTaskInput" class="assignee-select">
              <p class="assignee-select-title">分配给成员：</p>
              <div class="assignee-grid">
                <label
                  v-for="member in (team?.members || [])"
                  :key="member.id"
                  class="assignee-option"
                >
                  <input
                    type="checkbox"
                    :value="member.id"
                    :checked="newTaskAssignees.includes(member.id)"
                    @change="toggleNewTaskAssignee(member.id)"
                  />
                  <span>{{ member.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="tasksLoading" class="task-list text-slate">加载中...</div>
          <div v-else class="task-list">
            <template v-for="task in tasks" :key="task.id">
              <div class="task-item" :class="`task-${task.status}`">
                <button class="task-status-btn" @click="toggleTaskStatus(task.id)" :disabled="!canManageTasks">
                  <Check v-if="task.status === 'done'" :size="16" />
                  <Circle v-else :size="16" :class="{ 'half-fill': task.status === 'in-progress' }" />
                </button>
                <div class="task-content">
                <p class="task-title" :class="{ 'task-done-title': task.status === 'done' }">
                  {{ task.title }}
                </p>
                <div class="task-meta">
                  <span>截止：{{ formatDate(task.dueDate) }}</span>
                </div>
                <div class="assignee-chips">
                  <span v-if="!task.assignees.length" class="chip muted">暂未分配</span>
                  <span
                    v-for="assignee in task.assignees"
                    :key="assignee.memberId"
                    class="chip"
                    :class="{
                      'chip-pending': assignee.status === 'pending',
                      'chip-progress': assignee.status === 'in-progress',
                      'chip-submitted': assignee.status === 'submitted',
                      'chip-done': assignee.status === 'done',
                    }"
                  >
                    {{ assignee.name }} ·
                    {{ assignee.status === 'pending'
                      ? '未开始'
                      : assignee.status === 'in-progress'
                        ? '进行中'
                        : assignee.status === 'submitted'
                          ? '待确认'
                          : '已完成' }}
                  </span>
                </div>
                <div class="assignee-actions" v-if="task.assignees.length">
                  <button
                    v-if="task.assignees.some((assignee) => assignee.memberId === userId)
                      && task.assignees.find((a) => a.memberId === userId)?.status !== 'done'
                      && task.assignees.find((a) => a.memberId === userId)?.status !== 'submitted'
                    "
                    class="assignee-btn"
                    :disabled="assignmentActionLoading[`${task.id}-${userId}`]"
                    @click="submitAssignment(task.id)"
                  >
                    {{ assignmentActionLoading[`${task.id}-${userId}`] ? '提交中...' : '提交完成' }}
                  </button>
                  <button
                    v-if="canManageTasks && task.assignees.some((assignee) => assignee.status === 'submitted')"
                    class="assignee-btn"
                    @click="openAssignmentEditor(task)"
                  >
                    管理分配
                  </button>
                </div>
              </div>
                <div class="task-actions">
                  <button
                    v-if="canManageTasks"
                    class="task-more-btn"
                    @click="openAssignmentEditor(task)"
                  >
                    <MoreHorizontal :size="16" />
                  </button>
                </div>
              </div>
              <div
                v-if="assignmentEditor && assignmentEditor.taskId === task.id"
                class="assignment-editor"
              >
                <p class="text-xs text-slate mb-2">勾选需要参与本任务的成员</p>
                <div class="assignee-grid">
                  <label
                  v-for="member in (team?.members || [])"
                    :key="member.id"
                    class="assignee-option"
                  >
                    <input
                      type="checkbox"
                    :checked="assignmentEditor && assignmentEditor.selected.has(member.id)"
                    @change="toggleAssignmentSelection(member.id)"
                  />
                  <span>{{ member.name }}</span>
                </label>
                </div>
                <div class="assignment-editor-actions">
                  <button class="add-btn" :disabled="assignmentSaving" @click="saveAssignmentEditor">
                    {{ assignmentSaving ? '保存中...' : '保存分配' }}
                  </button>
                  <button class="cancel-btn" @click="assignmentEditor = null">取消</button>
                </div>
                <div class="assignment-review" v-if="canManageTasks">
                  <p class="text-xs text-slate">提交的成员：</p>
                  <div class="assignment-review-list">
                    <div
                      v-for="assignee in task.assignees.filter((assignee) => assignee.status === 'submitted')"
                      :key="assignee.memberId"
                      class="assignment-review-item"
                    >
                      <span>{{ assignee.name }} 请求完成</span>
                      <button
                      class="assignee-btn"
                      :disabled="assignmentActionLoading[`${task.id}-${assignee.memberId}`]"
                      @click="confirmAssignment(task.id, assignee.memberId)"
                    >
                      {{ assignmentActionLoading[`${task.id}-${assignee.memberId}`] ? '确认中...' : '确认完成' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <p v-if="!tasks.length" class="text-sm text-slate text-center py-6">暂无任务记录</p>
          </div>
        </div>

        <div v-if="activeTab === 'files'" class="files-panel">
          <div class="files-header">
            <div>
              <p class="font-mono text-xs text-slate tracking-wider">FILE ARCHIVE</p>
              <h3 class="text-h3 font-sans font-semibold text-charcoal">团队文件</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate">共 {{ files.length }} 个</span>
              <button
                v-if="canUploadFiles"
                class="upload-btn"
                :class="frequencyStore.isFocus ? 'btn-focus' : 'btn-vibe'"
                @click="triggerFileSelect"
                :disabled="uploadingFile"
              >
                <Plus :size="16" />
                {{ uploadingFile ? '上传中...' : '上传文件' }}
              </button>
              <input ref="fileInputRef" type="file" class="hidden" @change="handleFileChange" />
            </div>
          </div>

          <div v-if="uploadError" class="text-red-500 text-sm mb-2">{{ uploadError }}</div>
          <div v-if="filesLoading" class="text-sm text-slate py-6">加载中...</div>
          <div v-else class="file-list">
            <div v-for="file in files" :key="file.id" class="file-item">
              <div class="file-icon">
                <FileText :size="24" />
              </div>
              <div class="file-info">
                <p class="file-name">
                  <a :href="file.fileUrl" target="_blank" rel="noreferrer" class="hover:underline">
                    {{ file.fileName }}
                  </a>
                </p>
                <p class="file-meta">
                  {{ formatFileSize(file.fileSize) }} · 上传者：{{ file.uploaderName || file.uploadedBy }} ·
                  {{ new Date(file.createdAt).toLocaleDateString() }}
                </p>
              </div>
              <button class="file-download-btn" @click="openFile(file.fileUrl)">查看</button>
            </div>
            <p v-if="!files.length" class="text-sm text-slate text-center py-6">暂无文件</p>
          </div>
        </div>

        <div v-if="activeTab === 'settings'" class="settings-panel">
          <div class="settings-grid">
            <section class="settings-card">
              <div class="settings-card-header">
                <div>
                  <h3 class="section-title">基础信息</h3>
                  <p class="section-desc">更新小组名称、简介、人数与标签</p>
                </div>
                <span v-if="!canManageTeam" class="readonly-chip">仅管理员可编辑</span>
              </div>
              <div class="settings-form">
                <div class="form-group">
                  <label>小组名称</label>
                  <input v-model="editForm.name" type="text" class="input-field" :disabled="!canManageTeam" />
                </div>
                <div class="form-group">
                  <label>小组描述</label>
                  <textarea
                    v-model="editForm.description"
                    class="input-field"
                    rows="3"
                    :disabled="!canManageTeam"
                  ></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>最大人数</label>
                    <input
                      v-model.number="editForm.maxMembers"
                      type="number"
                      min="1"
                      class="input-field"
                      :disabled="!canManageTeam"
                    />
                  </div>
                  <div class="form-group">
                    <label>所属学院</label>
                    <input v-model="editForm.college" type="text" class="input-field" :disabled="!canManageTeam" />
                  </div>
                </div>
                <div class="form-group">
                  <label>标签（逗号分隔）</label>
                  <input v-model="editForm.tagsText" type="text" class="input-field" :disabled="!canManageTeam" />
                </div>
              </div>
              <div class="settings-actions">
                <div class="settings-feedback">
                  <p v-if="settingsMessage" class="success-text">{{ settingsMessage }}</p>
                  <p v-if="settingsError" class="error-text">{{ settingsError }}</p>
                </div>
                <button class="save-btn" :disabled="!canManageTeam || savingSettings" @click="handleSaveSettings">
                  {{ savingSettings ? '保存中...' : '保存更改' }}
                </button>
              </div>
            </section>

            <section class="settings-card">
              <div class="settings-card-header">
                <div>
                  <h3 class="section-title">成员权限</h3>
                  <p class="section-desc">查看成员身份，队长可授予管理员</p>
                </div>
                <span v-if="canAssignAdmin" class="hint-chip">点击切换管理员</span>
              </div>
              <div class="member-list">
                <div v-for="member in team.members" :key="member.id" class="member-item">
                  <div class="member-avatar">{{ member.name.charAt(0) }}</div>
                  <div class="member-info">
                    <p class="member-name">{{ member.name }}</p>
                    <p class="member-role">{{ member.id === team.ownerId ? '队长' : '成员' }}</p>
                  </div>
                  <div class="member-tags">
                    <span v-if="member.id === team.ownerId" class="role-chip">队长</span>
                    <span v-else-if="member.isAdmin" class="role-chip">管理员</span>
                  </div>
                  <label
                    v-if="canAssignAdmin && member.id !== team.ownerId"
                    class="admin-toggle"
                  >
                    <input
                      type="checkbox"
                      :checked="member.isAdmin"
                      :disabled="memberRoleLoading[member.id]"
                      @change="onAdminToggle(member.id, $event)"
                    />
                    <span>{{ member.isAdmin ? '取消管理员' : '设为管理员' }}</span>
                  </label>
                </div>
                <p v-if="!team.members.length" class="text-sm text-slate text-center py-4">尚无成员</p>
              </div>
            </section>

            <section v-if="canManageTeam" class="settings-card">
              <div class="settings-card-header">
                <div>
                  <h3 class="section-title">加入申请</h3>
                  <p class="section-desc">审批待加入成员，确保团队质量</p>
                </div>
                <span class="hint-chip">审核</span>
              </div>
              <p v-if="applicationQueueError" class="error-text mb-2">{{ applicationQueueError }}</p>
              <div v-if="applicationQueueLoading" class="space-y-3">
                <div v-for="index in 3" :key="index" class="approval-skeleton"></div>
              </div>
              <div v-else>
                <p v-if="!applicationQueue.length" class="text-sm text-slate text-center py-6">
                  暂无待审核申请，新申请会出现在这里，也会同步到消息中心。
                </p>
                <div v-else class="space-y-3">
                  <div v-for="application in applicationQueue" :key="application.id" class="application-approval-card">
                    <div class="approval-info">
                      <p class="font-sans font-medium text-charcoal">
                        {{ application.applicantName || '未命名成员' }}
                        <span class="text-xs text-slate ml-2">
                          {{ application.applicantCollege || '未填写学院' }}
                        </span>
                      </p>
                      <p v-if="application.preferredRole" class="text-xs text-slate mt-1">
                        意向角色：{{ application.preferredRole }}
                      </p>
                      <p class="text-sm text-slate mt-1">
                        {{ application.message || '对方未附加额外说明' }}
                      </p>
                      <p class="text-xs text-slate/70 mt-1">提交于 {{ application.createdAt.slice(0, 16).replace('T', ' ') }}</p>
                    </div>
                    <div class="approval-actions">
                      <button
                        class="cancel-btn"
                        :disabled="applicationActionLoading[application.id]"
                        @click="handleApplicationDecision(application.id, 'rejected')"
                      >
                        {{ applicationActionLoading[application.id] ? '处理中...' : '拒绝' }}
                      </button>
                      <button
                        class="add-btn"
                        :disabled="applicationActionLoading[application.id]"
                        @click="handleApplicationDecision(application.id, 'approved')"
                      >
                        {{ applicationActionLoading[application.id] ? '处理中...' : '同意' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="settings-card danger-card">
              <div class="settings-card-header">
                <div>
                  <h3 class="section-title">危险操作</h3>
                  <p class="section-desc">退出或解散后，协作数据可能被清除</p>
                </div>
              </div>
              <p v-if="disbandError" class="error-text mb-2">{{ disbandError }}</p>
              <p v-if="leaveError" class="error-text mb-2">{{ leaveError }}</p>
              <div v-if="isOwner" class="danger-actions">
                <button
                  v-if="!disbandConfirm"
                  class="danger-btn"
                  @click="disbandConfirm = true"
                >
                  解散小组
                </button>
                <div v-else class="confirm-row">
                  <span class="text-sm text-slate">确认解散？该操作不可恢复。</span>
                  <div class="flex gap-2">
                    <button
                      class="danger-btn"
                      @click="handleDisbandTeam"
                      :disabled="disbandLoading"
                    >
                      {{ disbandLoading ? '执行中...' : '确认解散' }}
                    </button>
                    <button class="cancel-btn" @click="disbandConfirm = false">取消</button>
                  </div>
                </div>
              </div>
              <div v-else-if="canLeaveTeam" class="danger-actions">
                <span class="text-sm text-slate">不想继续参与？你可以自行退出小组。</span>
                <button
                  class="danger-btn"
                  @click="handleLeaveTeam"
                  :disabled="leavingTeam"
                >
                  {{ leavingTeam ? '退出中...' : '退出小组' }}
                </button>
              </div>
              <p v-else class="text-xs text-slate">仅队长可以解散小组。</p>
            </section>
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

.page-header {
  @apply flex items-center gap-6 mb-6;
}

.back-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg text-slate hover:text-charcoal hover:bg-slate/5 transition-all duration-200;
}

.header-info {
  @apply flex-1;
}

.team-avatar {
  @apply w-12 h-12 rounded-xl flex items-center justify-center font-sans font-bold text-white text-lg;
}

.avatar-focus {
  @apply bg-gradient-to-br from-focus-primary to-focus-accent;
}

.avatar-vibe {
  @apply bg-gradient-to-br from-vibe-primary to-vibe-accent;
}

.owner-badge {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-medium;
}

.tab-nav {
  @apply flex gap-1 p-1 rounded-xl bg-slate/5 mb-6;
}

.tab-btn {
  @apply flex items-center gap-2 px-4 py-2.5 rounded-lg font-sans text-sm text-slate transition-all duration-200;
}

.tab-btn:hover {
  @apply text-charcoal bg-white/50;
}

.tab-active {
  @apply bg-white text-charcoal shadow-sm;
}

.content-area {
  @apply rounded-2xl bg-white border border-slate/10 overflow-hidden min-h-[500px];
}

.chat-panel {
  @apply flex flex-col h-[600px];
}

.chat-loading,
.chat-empty {
  @apply text-sm text-slate text-center py-6;
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
  @apply w-8 h-8 rounded-full bg-slate/10 flex items-center justify-center font-sans text-sm font-medium text-slate;
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
  @apply px-4 py-2.5 rounded-2xl bg-slate/5 font-sans text-sm text-charcoal;
}

.message-mine .message-text {
  @apply bg-focus-primary/10;
}

.chat-input {
  @apply flex gap-3 p-4 border-t border-slate/10;
}

.input-field {
  @apply flex-1 px-4 py-2.5 rounded-xl border border-slate/20 font-sans text-sm text-charcoal focus:outline-none focus:border-focus-primary;
}

.send-btn {
  @apply p-3 rounded-xl text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100;
}

.btn-focus {
  @apply bg-focus-accent;
}

.btn-vibe {
  @apply bg-vibe-accent;
}

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

.stat-done {
  @apply bg-emerald-50;
}

.stat-done .stat-value {
  @apply text-emerald-600;
}

.stat-progress {
  @apply bg-amber-50;
}

.stat-progress .stat-value {
  @apply text-amber-600;
}

.stat-todo {
  @apply bg-slate/5;
}

.add-task-section {
  @apply mb-6;
}

.new-task-btn {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate/30 text-slate hover:border-focus-primary hover:text-focus-accent transition-all duration-200;
}

.new-task-input {
  @apply flex gap-2;
}

.assignee-select {
  @apply mt-4 space-y-2;
}

.assignee-select-title {
  @apply text-xs text-slate;
}

.assignee-grid {
  @apply grid gap-2 grid-cols-2 md:grid-cols-3;
}

.assignee-option {
  @apply flex items-center gap-2 text-sm text-slate;
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
  @apply flex items-center gap-3 p-4 rounded-xl border border-slate/10 bg-white transition-all duration-200 hover:shadow-sm;
}

.task-done {
  @apply bg-emerald-50/50 border-emerald-100;
}

.task-in-progress {
  @apply border-l-4 border-l-amber-400;
}

.task-status-btn {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-slate hover:text-focus-accent transition-colors duration-200;
}

.task-status-btn:disabled {
  @apply opacity-40 cursor-not-allowed hover:text-slate;
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

.assignee-chips {
  @apply flex flex-wrap gap-2 mt-2;
}

.chip {
  @apply px-2 py-0.5 rounded-full text-xs font-mono bg-slate/10 text-slate;
}

.chip.muted {
  @apply bg-slate/5 text-slate;
}

.chip-pending {
  @apply bg-slate/10 text-slate;
}

.chip-progress {
  @apply bg-amber-50 text-amber-600;
}

.chip-submitted {
  @apply bg-morandi-lavender/20 text-morandi-lavender;
}

.chip-done {
  @apply bg-emerald-50 text-emerald-600;
}

.assignee-actions {
  @apply flex flex-wrap gap-2 mt-2;
}

.assignee-btn {
  @apply px-3 py-1 rounded-lg text-xs bg-focus-primary/10 text-focus-accent hover:bg-focus-primary/20;
}

.assignment-editor {
  @apply mt-3 rounded-xl border border-dashed border-slate/20 bg-slate/5 p-4 space-y-3;
}

.assignment-editor-actions {
  @apply flex items-center gap-2;
}

.assignment-review-list {
  @apply space-y-2;
}

.assignment-review-item {
  @apply flex items-center justify-between text-xs text-slate;
}

.task-more-btn {
  @apply p-1 rounded text-slate/40 hover:text-slate;
}

.files-panel {
  @apply p-6;
}

.files-header {
  @apply flex items-center justify-between mb-6;
}

.upload-btn {
  @apply flex items-center gap-1 px-3 py-1.5 rounded-lg bg-focus-accent text-white text-sm;
}

.file-list {
  @apply space-y-2;
}

.file-item {
  @apply flex items-center gap-4 p-4 rounded-xl border border-slate/10 hover:bg-slate/5 transition-all duration-200;
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

.settings-panel {
  @apply p-6;
}

.settings-grid {
  @apply grid gap-6 xl:grid-cols-2;
}

.settings-card {
  @apply rounded-2xl border border-slate/10 bg-white p-6 flex flex-col gap-4 shadow-sm;
}

.danger-card {
  @apply border-red-100 bg-red-50/40;
}

.settings-card-header {
  @apply flex items-start justify-between gap-4;
}

.section-title {
  @apply font-sans font-semibold text-charcoal text-lg;
}

.section-desc {
  @apply text-sm text-slate mt-1;
}

.readonly-chip {
  @apply px-2 py-0.5 rounded-full text-xs bg-slate/10 text-slate;
}

.hint-chip {
  @apply px-2 py-0.5 rounded-full text-xs bg-focus-primary/10 text-focus-accent;
}

.settings-form {
  @apply space-y-4;
}

.form-row {
  @apply grid gap-4 md:grid-cols-2;
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

.settings-actions {
  @apply flex flex-col md:flex-row md:items-center md:justify-between gap-3;
}

.settings-feedback {
  @apply flex flex-col gap-1 text-sm;
}

.success-text {
  @apply text-emerald-600;
}

.error-text {
  @apply text-red-500;
}

.save-btn {
  @apply px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-colors duration-200 bg-focus-accent;
}

.save-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.member-list {
  @apply space-y-3;
}

.member-item {
  @apply flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate/10 bg-slate/5;
}

.approval-skeleton {
  @apply h-20 rounded-2xl bg-slate/10 animate-pulse;
}

.application-approval-card {
  @apply flex flex-wrap gap-4 p-4 rounded-2xl border border-slate/10 bg-white shadow-sm items-start;
}

.approval-info {
  @apply flex-1 min-w-[200px];
}

.approval-actions {
  @apply flex flex-col gap-2 min-w-[120px];
}

.member-avatar {
  @apply w-9 h-9 rounded-full bg-focus-primary/20 flex items-center justify-center font-sans text-sm font-semibold text-focus-accent;
}

.member-info {
  @apply flex-1 min-w-[140px];
}

.member-name {
  @apply font-sans text-sm font-medium text-charcoal;
}

.member-role {
  @apply font-mono text-xs text-slate;
}

.member-tags {
  @apply flex items-center gap-2 text-xs;
}

.role-chip {
  @apply px-2 py-0.5 rounded-full bg-slate/10 text-slate;
}

.admin-toggle {
  @apply inline-flex items-center gap-2 text-xs text-slate;
}

.admin-toggle input {
  @apply h-4 w-4 accent-focus-primary;
}

.danger-actions {
  @apply flex flex-col gap-3;
}

.danger-btn {
  @apply px-4 py-2 rounded-lg bg-red-500 text-white text-sm shadow-sm hover:bg-red-600 transition-colors;
}

.confirm-row {
  @apply flex flex-col gap-3;
}
</style>
