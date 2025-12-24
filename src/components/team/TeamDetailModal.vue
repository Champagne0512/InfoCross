<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Team, TeamChatMessage } from '@/types/models'
import { fetchTeamChatMessages, sendTeamChatMessage } from '@/api/teamWorkspace'
import TagBadge from '@/components/business/TagBadge.vue'
import AppButton from '@/components/common/AppButton.vue'

const props = defineProps<{
  open: boolean
  team: Team | null
  mode: 'focus' | 'vibe'
  currentUserId?: string
}>()

const emit = defineEmits<{ close: [] }>()

const messages = ref<TeamChatMessage[]>([])
const loadingMessages = ref(false)
const sending = ref(false)
const messageInput = ref('')
const errorText = ref('')

const ownerName = computed(() => {
  if (!props.team) return '队长'
  const owner = props.team.members.find((member) => member.id === props.team?.ownerId)
  return owner?.name ?? '队长'
})

const filteredMessages = computed(() => {
  if (!props.team) return []
  const ownerId = props.team.ownerId
  const currentId = props.currentUserId
  if (!ownerId && !currentId) return messages.value
  return messages.value.filter((msg) => {
    if (ownerId && msg.senderId === ownerId) return true
    if (currentId && msg.senderId === currentId) return true
    return false
  })
})

async function loadMessages() {
  if (!props.team) return
  loadingMessages.value = true
  errorText.value = ''
  try {
    messages.value = await fetchTeamChatMessages(props.team.id, 30, props.currentUserId)
  } catch (error) {
    console.error('加载团队聊天失败', error)
    errorText.value = '暂时无法加载聊天记录，请稍后重试'
    messages.value = []
  } finally {
    loadingMessages.value = false
  }
}

async function handleSend() {
  if (!props.team || !props.currentUserId) {
    errorText.value = '请先登录再发送消息'
    return
  }
  const content = messageInput.value.trim()
  if (!content || sending.value) return
  sending.value = true
  errorText.value = ''
  try {
    const sent = await sendTeamChatMessage(props.team.id, content, props.currentUserId)
    messages.value = [...messages.value, sent]
    messageInput.value = ''
  } catch (error) {
    console.error('发送聊天失败', error)
    errorText.value = '发送失败，可能需要先加入小组或稍后再试'
  } finally {
    sending.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      loadMessages()
    }
  }
)

watch(
  () => props.team?.id,
  () => {
    if (props.open) {
      loadMessages()
    }
  }
)
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="open && team" class="team-detail-overlay" @click.self="emit('close')">
        <div class="team-detail-panel" :class="mode === 'focus' ? 'panel-focus' : 'panel-vibe'">
          <button class="close-btn" @click="emit('close')">×</button>
          <div class="panel-content">
            <section class="team-meta">
              <p class="team-mode">{{ mode === 'focus' ? 'DEEP FOCUS' : 'VIBE MODE' }}</p>
              <h2 class="team-title">{{ team.name }}</h2>
              <p class="team-desc">{{ team.description }}</p>
              <div class="team-tags">
                <TagBadge v-for="tag in team.tags || []" :key="tag" :label="tag" />
              </div>
              <div class="team-stats">
                <span>{{ team.currentMembers }}/{{ team.maxMembers }} 人</span>
                <span>{{ team.college }}</span>
                <span v-if="team.deadline">截止：{{ team.deadline }}</span>
              </div>
              <div v-if="team.requiredSkills?.length" class="skill-gap">
                <p>需要技能</p>
                <div class="flex flex-wrap gap-2">
                  <TagBadge v-for="skill in team.requiredSkills" :key="skill" :label="skill" accent />
                </div>
              </div>
            </section>
            <section class="team-chat">
              <div class="chat-header">
                <div>
                  <p class="chat-label">与 {{ ownerName }} 对话</p>
                  <p class="chat-hint">在这里介绍你能提供的技能或问题，队长会收到消息</p>
                </div>
              </div>
              <div class="chat-messages">
                <div v-if="loadingMessages" class="chat-loading">加载消息中...</div>
                <div v-else>
                  <p v-if="filteredMessages.length === 0" class="chat-empty">还没有历史对话，根据上方提示发出你的第一条沟通，队长会尽快回复。</p>
                  <div v-else class="chat-thread">
                    <div
                      v-for="message in filteredMessages"
                      :key="message.id"
                      class="chat-bubble"
                      :class="message.senderId === currentUserId ? 'mine' : 'owner'"
                    >
                      <p class="chat-author">{{ message.senderId === currentUserId ? '我' : ownerName }}</p>
                      <p class="chat-content">{{ message.content }}</p>
                      <span class="chat-time">{{ new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="chat-input">
                <textarea
                  v-model="messageInput"
                  :disabled="sending"
                  rows="3"
                  placeholder="介绍你自己、想加入的方向或需要解答的问题..."
                />
                <AppButton class="send-btn" :disabled="sending" :loading="sending" @click="handleSend">
                  发送
                </AppButton>
                <p v-if="errorText" class="chat-error">{{ errorText }}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.team-detail-overlay {
  @apply fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center px-4;
}

.team-detail-panel {
  @apply w-full max-w-5xl rounded-3xl shadow-morandi bg-white relative overflow-hidden;
  max-height: 90vh;
}

.panel-focus {
  @apply border border-focus-primary/30;
}

.panel-vibe {
  @apply border border-vibe-primary/30;
}

.close-btn {
  @apply absolute top-4 right-4 text-2xl text-slate hover:text-charcoal transition;
}

.panel-content {
  @apply grid gap-6 lg:grid-cols-[1.2fr_1fr] p-8;
}

.team-meta {
  @apply space-y-4;
}

.team-mode {
  @apply font-mono text-xs tracking-[0.3em] text-slate;
}

.team-title {
  @apply text-4xl font-sans font-semibold text-charcoal;
}

.team-desc {
  @apply text-slate leading-relaxed;
}

.team-tags {
  @apply flex flex-wrap gap-2;
}

.team-stats {
  @apply flex flex-wrap gap-4 font-mono text-sm text-slate;
}

.skill-gap {
  @apply rounded-2xl border border-dashed p-4 bg-white/70;
}

.team-chat {
  @apply rounded-2xl border bg-white/80 p-5 flex flex-col gap-4 h-full;
}

.panel-focus .team-chat {
  @apply border-focus-primary/30;
}

.panel-vibe .team-chat {
  @apply border-vibe-primary/30;
}

.chat-header {
  @apply flex items-center justify-between;
}

.chat-label {
  @apply font-sans font-semibold text-charcoal;
}

.chat-hint {
  @apply text-xs text-slate;
}


.chat-messages {
  @apply flex-1 overflow-y-auto pr-1;
}

.chat-thread {
  @apply space-y-3;
}

.chat-bubble {
  @apply rounded-2xl px-4 py-3 bg-slate/10;
}

.chat-bubble.mine {
  @apply bg-focus-primary/20 text-charcoal;
}

.chat-bubble.owner {
  @apply bg-white border border-slate/10;
}

.chat-author {
  @apply text-xs font-semibold text-slate mb-1;
}

.chat-content {
  @apply text-sm text-charcoal leading-relaxed;
}

.chat-time {
  @apply text-[10px] text-slate/70;
}

.chat-loading {
  @apply text-sm text-slate text-center;
}

.chat-empty {
  @apply text-center text-slate/70 text-sm;
}

.chat-input {
  @apply flex flex-col gap-2;
}

.chat-input textarea {
  @apply rounded-2xl border border-slate/20 p-3 text-sm font-sans outline-none focus:border-slate;
}

.send-btn {
  @apply self-end;
}

.chat-error {
  @apply text-xs text-red-500;
}
</style>
