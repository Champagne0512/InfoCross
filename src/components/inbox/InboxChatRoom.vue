<script setup lang="ts">
import { ref } from 'vue'
import type { InboxChatThread } from '@/types/models'
import { useFrequencyStore } from '@/stores/frequencyStore'
import { Send, Paperclip, MoreHorizontal } from 'lucide-vue-next'

const props = defineProps<{
  thread: InboxChatThread
}>()

const frequencyStore = useFrequencyStore()
const input = ref('')

function sendMessage() {
  if (!input.value.trim()) return
  props.thread.messages.push({
    id: `temp-${Date.now()}`,
    author: '我',
    content: input.value,
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isMine: true,
  })
  input.value = ''
}
</script>

<template>
  <div class="chat-container">
    <!-- 聊天头部 -->
    <header class="chat-header">
      <div class="header-info">
        <h2 class="chat-title">{{ thread.name }}</h2>
        <p class="chat-status">
          <span class="status-dot"></span>
          {{ thread.onlineCount }} 位成员在线
        </p>
      </div>
      <button class="more-btn">
        <MoreHorizontal :size="20" />
      </button>
    </header>

    <!-- 消息列表 -->
    <section class="messages-area">
      <div
        v-for="message in thread.messages"
        :key="message.id"
        class="message-row"
        :class="message.isMine ? 'justify-end' : 'justify-start'"
      >
        <div
          class="message-bubble"
          :class="message.isMine 
            ? (frequencyStore.isFocus ? 'bubble-mine-focus' : 'bubble-mine-vibe')
            : 'bubble-other'"
        >
          <p v-if="!message.isMine" class="sender-name">{{ message.author }}</p>
          <p class="message-text">{{ message.content }}</p>
          <p class="message-time" :class="message.isMine ? 'time-mine' : 'time-other'">
            {{ message.timestamp }}
          </p>
        </div>
      </div>
    </section>

    <!-- 输入区域 -->
    <footer class="input-area">
      <div class="input-wrapper" :class="frequencyStore.isFocus ? 'input-focus' : 'input-vibe'">
        <button class="attach-btn">
          <Paperclip :size="18" />
        </button>
        <input
          v-model="input"
          type="text"
          placeholder="输入消息..."
          class="message-input"
          @keyup.enter="sendMessage"
        />
        <button 
          class="send-btn"
          :class="frequencyStore.isFocus ? 'send-focus' : 'send-vibe'"
          :disabled="!input.trim()"
          @click="sendMessage"
        >
          <Send :size="18" />
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-container {
  @apply flex flex-col h-full;
}

/* 头部 */
.chat-header {
  @apply flex items-center justify-between px-8 py-5 border-b border-slate/10;
}

.header-info {
  @apply space-y-1;
}

.chat-title {
  @apply font-sans text-xl font-semibold text-charcoal;
}

.chat-status {
  @apply flex items-center gap-2 font-sans text-sm text-slate;
}

.status-dot {
  @apply w-2.5 h-2.5 rounded-full bg-emerald-400;
}

.more-btn {
  @apply p-2.5 rounded-full text-slate hover:bg-slate/5 transition-colors;
}

/* 消息区域 */
.messages-area {
  @apply flex-1 overflow-y-auto px-8 py-6 space-y-4;
}

.message-row {
  @apply flex;
}

.message-bubble {
  @apply max-w-[70%] rounded-2xl px-5 py-4;
}

.bubble-mine-focus {
  @apply bg-focus-accent text-white rounded-br-md;
}

.bubble-mine-vibe {
  @apply bg-vibe-accent text-white rounded-br-md;
}

.bubble-other {
  @apply bg-slate/5 text-charcoal rounded-bl-md;
}

.sender-name {
  @apply font-sans text-sm text-slate mb-1.5;
}

.message-text {
  @apply font-sans text-base leading-relaxed;
}

.message-time {
  @apply font-mono text-xs mt-2;
}

.time-mine {
  @apply text-white/60;
}

.time-other {
  @apply text-slate/50;
}

/* 输入区域 */
.input-area {
  @apply px-8 py-5 border-t border-slate/10;
}

.input-wrapper {
  @apply flex items-center gap-4 rounded-full px-5 py-3 border transition-all;
}

.input-focus {
  @apply bg-white border-slate/20 focus-within:border-focus-accent focus-within:ring-2 focus-within:ring-focus-accent/10;
}

.input-vibe {
  @apply bg-white border-slate/20 focus-within:border-vibe-accent focus-within:ring-2 focus-within:ring-vibe-accent/10;
}

.attach-btn {
  @apply p-1.5 text-slate hover:text-charcoal transition-colors;
}

.message-input {
  @apply flex-1 bg-transparent font-sans text-base text-charcoal placeholder:text-slate/50;
  @apply focus:outline-none;
}

.send-btn {
  @apply p-2.5 rounded-full text-white transition-all;
  @apply disabled:opacity-40 disabled:cursor-not-allowed;
}

.send-focus {
  @apply bg-focus-accent hover:bg-focus-accent/90;
}

.send-vibe {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}
</style>
