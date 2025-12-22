<script setup lang="ts">
import type { InboxChatThread } from '@/types/models'
import { useRouter } from 'vue-router'

const props = defineProps<{
  thread: InboxChatThread
}>()

const router = useRouter()

function goToChat() {
  if (props.thread.redirectRoute) {
    router.push(props.thread.redirectRoute)
  } else {
    router.push('/team/hub')
  }
}
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="w-full max-w-2xl bg-white rounded-[32px] border border-slate/10 shadow-morandi-lg p-8 space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <p class="font-mono text-xs text-slate uppercase tracking-[0.3em]">Group Chat</p>
          <h2 class="text-2xl font-semibold text-charcoal mt-2">{{ thread.name }}</h2>
          <p class="text-xs text-slate/70 flex items-center gap-2 mt-1">
            <span class="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            {{ thread.onlineCount }} 位成员在线
          </p>
        </div>
        <button
          class="px-4 py-2 rounded-full border border-slate/20 text-sm text-slate hover:border-charcoal/40"
          @click="goToChat"
        >
          打开聊天室
        </button>
      </header>

      <section class="space-y-3">
        <p class="text-xs text-slate/60">最新消息</p>
        <div class="space-y-3">
          <div
            v-for="message in thread.messages"
            :key="message.id"
            class="rounded-2xl border border-slate/10 px-4 py-3 bg-slate/5"
          >
            <div class="flex items-center justify-between text-xs text-slate/70">
              <span>{{ message.author }}</span>
              <span class="font-mono">{{ message.timestamp }}</span>
            </div>
            <p class="text-sm text-charcoal mt-1">{{ message.content }}</p>
          </div>
        </div>
      </section>

      <footer class="text-xs text-slate/60">
        更详细的内容与回复请前往协作空间聊天室处理。
      </footer>
    </div>
  </div>
</template>
