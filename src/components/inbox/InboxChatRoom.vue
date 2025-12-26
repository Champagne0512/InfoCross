<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import type { InboxChatThread, InboxChatMessage, TeamChatMessage } from '@/types/models'
import { useFrequencyStore } from '@/stores/frequencyStore'
import { fetchTeamChatMessages, sendTeamChatMessage, subscribeTeamChat } from '@/api/teamWorkspace'
import { supabase } from '@/api/client'
import { Send, Loader2 } from 'lucide-vue-next'
import type { RealtimeChannel } from '@supabase/supabase-js'

const props = defineProps<{
  thread: InboxChatThread
}>()

const frequencyStore = useFrequencyStore()

// 状态
const localMessages = ref<InboxChatMessage[]>([])
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const isSending = ref(false)
const currentUserId = ref<string | null>(null)

// 实时订阅 channel
let chatChannel: RealtimeChannel | null = null

// 将 API 消息转换为本地消息格式
function mapToLocalMessage(msg: TeamChatMessage): InboxChatMessage {
  const date = new Date(msg.createdAt)
  return {
    id: String(msg.id),
    author: msg.isOwner ? '我' : msg.senderName,
    isMine: msg.senderId === currentUserId.value,
    content: msg.content,
    timestamp: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }
}

// 加载消息
async function loadMessages() {
  isLoading.value = true
  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId.value = user?.id ?? null
    
    // 如果没有 teamId，直接使用 mock 数据
    if (!props.thread.teamId) {
      localMessages.value = [...props.thread.messages]
      nextTick(scrollToBottom)
      return
    }
    
    const messages = await fetchTeamChatMessages(props.thread.teamId, 100, currentUserId.value ?? undefined)
    
    // 如果数据库没有消息，使用 mock 数据
    if (messages.length === 0) {
      localMessages.value = [...props.thread.messages]
    } else {
      localMessages.value = messages.map(mapToLocalMessage)
    }
    nextTick(scrollToBottom)
  } catch (error) {
    console.error('加载消息失败:', error)
    // 如果加载失败，使用 mock 数据
    localMessages.value = [...props.thread.messages]
    nextTick(scrollToBottom)
  } finally {
    isLoading.value = false
  }
}

// 订阅实时消息
function setupRealtimeSubscription() {
  if (!props.thread.teamId || !currentUserId.value) return
  
  chatChannel = subscribeTeamChat(props.thread.teamId, (msg) => {
    // 避免重复添加自己发送的消息
    if (msg.senderId === currentUserId.value) return
    
    const newMessage = mapToLocalMessage(msg)
    localMessages.value.push(newMessage)
    nextTick(scrollToBottom)
  }, currentUserId.value)
}

// 发送消息
async function sendMessage() {
  const content = inputMessage.value.trim()
  if (!content || isSending.value) return
  
  // 先添加到本地（乐观更新）
  const tempId = `temp-${Date.now()}`
  const tempMessage: InboxChatMessage = {
    id: tempId,
    author: '我',
    isMine: true,
    content,
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }
  localMessages.value.push(tempMessage)
  inputMessage.value = ''
  nextTick(scrollToBottom)
  
  // 发送到服务器
  if (props.thread.teamId) {
    isSending.value = true
    try {
      const sentMsg = await sendTeamChatMessage(props.thread.teamId, content, currentUserId.value ?? undefined)
      // 更新临时消息的 ID
      const idx = localMessages.value.findIndex(m => m.id === tempId)
      if (idx !== -1 && localMessages.value[idx]) {
        localMessages.value[idx].id = String(sentMsg.id)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      // 移除失败的消息
      localMessages.value = localMessages.value.filter(m => m.id !== tempId)
    } finally {
      isSending.value = false
    }
  }
}

// 滚动到底部
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 处理键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 监听 thread 变化
watch(() => props.thread.teamId, async () => {
  // 清理旧订阅
  if (chatChannel) {
    chatChannel.unsubscribe()
    chatChannel = null
  }
  // 重新加载
  await loadMessages()
  setupRealtimeSubscription()
}, { immediate: false })

onMounted(async () => {
  await loadMessages()
  setupRealtimeSubscription()
})

onUnmounted(() => {
  if (chatChannel) {
    chatChannel.unsubscribe()
  }
})
</script>

<template>
  <div class="chat-room-container">
    <!-- 聊天头部 -->
    <header class="chat-header" :class="frequencyStore.isFocus ? 'header-focus' : 'header-vibe'">
      <div class="header-info">
        <p class="header-label">Group Chat</p>
        <h2 class="header-title">{{ thread.name }}</h2>
        <p class="header-status">
          <span class="status-dot" />
          {{ thread.onlineCount }} 位成员在线
        </p>
      </div>
    </header>

    <!-- 消息列表 -->
    <div ref="messagesContainer" class="messages-container">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <Loader2 :size="24" class="animate-spin text-slate/40" />
        <span>加载消息中...</span>
      </div>
      
      <!-- 消息列表 -->
      <div v-else class="messages-list">
        <div v-if="localMessages.length === 0" class="empty-messages">
          <p>暂无消息，发送第一条消息吧</p>
        </div>
        <div
          v-for="message in localMessages"
          :key="message.id"
          class="message-item"
          :class="message.isMine ? 'message-mine' : 'message-other'"
        >
          <div class="message-bubble" :class="[
            message.isMine 
              ? (frequencyStore.isFocus ? 'bubble-mine-focus' : 'bubble-mine-vibe')
              : 'bubble-other'
          ]">
            <div v-if="!message.isMine" class="message-author">{{ message.author }}</div>
            <p class="message-content">{{ message.content }}</p>
            <span class="message-time">{{ message.timestamp }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper" :class="frequencyStore.isFocus ? 'input-focus' : 'input-vibe'">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="输入消息..."
          class="message-input"
          :disabled="isSending"
          @keydown="handleKeydown"
        />
        <button
          class="send-button"
          :class="[
            inputMessage.trim() && !isSending
              ? (frequencyStore.isFocus ? 'send-active-focus' : 'send-active-vibe')
              : 'send-inactive'
          ]"
          :disabled="!inputMessage.trim() || isSending"
          @click="sendMessage"
        >
          <Loader2 v-if="isSending" :size="18" class="animate-spin" />
          <Send v-else :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-room-container {
  @apply h-full flex flex-col;
}

/* 头部样式 */
.chat-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-slate/10;
}

.header-focus {
  @apply bg-focus-bg/30;
}

.header-vibe {
  @apply bg-vibe-bg/30;
}

.header-info {
  @apply flex-1;
}

.header-label {
  @apply font-mono text-xs text-slate uppercase tracking-[0.2em];
}

.header-title {
  @apply text-xl font-semibold text-charcoal mt-1;
}

.header-status {
  @apply text-xs text-slate/70 flex items-center gap-2 mt-1;
}

.status-dot {
  @apply w-1.5 h-1.5 rounded-full bg-[#22C55E];
}

/* 消息列表 */
.messages-container {
  @apply flex-1 overflow-y-auto px-4 py-4;
}

.loading-state {
  @apply h-full flex flex-col items-center justify-center gap-2 text-slate/50 text-sm;
}

.empty-messages {
  @apply h-full flex items-center justify-center text-slate/40 text-sm;
}

.messages-list {
  @apply space-y-3;
}

.message-item {
  @apply flex;
}

.message-mine {
  @apply justify-end;
}

.message-other {
  @apply justify-start;
}

.message-bubble {
  @apply max-w-[75%] rounded-2xl px-4 py-2.5 relative;
}

.bubble-other {
  @apply text-charcoal;
  background-color: rgba(100, 116, 139, 0.08);
  border-bottom-left-radius: 4px;
}

.bubble-mine-focus {
  @apply bg-focus-accent text-white;
  border-bottom-right-radius: 4px;
}

.bubble-mine-vibe {
  @apply bg-vibe-accent text-white;
  border-bottom-right-radius: 4px;
}

.message-author {
  @apply text-xs font-medium text-slate/70 mb-1;
}

.message-content {
  @apply text-sm leading-relaxed;
}

/* 自己消息的内容使用浅色 */
.bubble-mine-focus .message-content,
.bubble-mine-vibe .message-content {
  @apply text-white;
}

.bubble-mine-focus .message-time,
.bubble-mine-vibe .message-time {
  @apply text-white/70;
}

.message-time {
  @apply text-[10px] opacity-60 mt-1 block text-right;
}

/* 输入区域 */
.input-area {
  @apply px-4 py-3 border-t border-slate/10 bg-white/50;
}

.input-wrapper {
  @apply flex items-center gap-2 rounded-full px-4 py-2 border transition-all;
}

.input-focus {
  @apply border-slate/20 focus-within:border-focus-accent/50 focus-within:ring-2 focus-within:ring-focus-accent/20;
}

.input-vibe {
  @apply border-slate/20 focus-within:border-vibe-accent/50 focus-within:ring-2 focus-within:ring-vibe-accent/20;
}

.message-input {
  @apply flex-1 bg-transparent text-sm text-charcoal placeholder:text-slate/40 outline-none;
}

.send-button {
  @apply w-8 h-8 rounded-full flex items-center justify-center transition-all;
}

.send-inactive {
  @apply bg-slate/10 text-slate/40 cursor-not-allowed;
}

.send-active-focus {
  @apply bg-focus-accent text-white hover:bg-focus-accent/90 cursor-pointer;
}

.send-active-vibe {
  @apply bg-vibe-accent text-white hover:bg-vibe-accent/90 cursor-pointer;
}
</style>
