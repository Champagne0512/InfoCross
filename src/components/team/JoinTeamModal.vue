<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { Team, TeamMember } from '@/types/models'

const props = defineProps<{
  open: boolean
  team: Team | null
  mode: 'focus' | 'vibe'
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: JoinPayload]
}>()

interface JoinPayload {
  teamId: number
  role: string
  message: string
}

const { profile } = useAuth()

const form = reactive({
  role: '',
  message: '',
})

const aiLoading = ref(false)

const leader = computed<TeamMember | null>(() => {
  if (!props.team) return null
  const preferred = props.team.members.find(
    (member) =>
      member.role?.toLowerCase().includes('发起') ||
      member.role?.includes('主理') ||
      member.id === props.team?.ownerId,
  )
  return preferred ?? props.team.members[0] ?? null
})

const roleOptions = computed(() => {
  if (!props.team) return []
  const fromSkills = props.team.requiredSkills ?? []
  const vibeRoles = props.mode === 'vibe' ? ['召集', '陪伴', '记录', '后勤'] : []
  const unique = Array.from(new Set([...fromSkills, ...vibeRoles]))
  return unique.slice(0, 6)
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.role = roleOptions.value[0] ?? ''
      form.message = ''
      aiLoading.value = false
    }
  },
)

function closeModal() {
  emit('close')
}

function selectRole(role: string) {
  form.role = role
}

async function handleAiFill() {
  aiLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 400))
  const username = profile.value?.username ?? '我'
  const teamDesc = props.team?.description ?? '这个项目'
  const hook = props.mode === 'focus'
    ? '我擅长把多学科的想法变成落地方案'
    : '我希望带来轻松可信赖的陪伴'
  form.message = `${username} 想以「${form.role || '协作伙伴'}」身份加入，${hook}。最近在 ${teamDesc.slice(0, 32)} 中积累的经验，能为团队补上缺失的一环。`
  aiLoading.value = false
}

function handleSubmit() {
  if (!props.team) return
  emit('submit', {
    teamId: props.team.id,
    role: form.role,
    message: form.message,
  })
}

const modeClass = computed(() =>
  props.mode === 'focus'
    ? 'from-white/90 via-cream to-focus-primary/5'
    : 'from-white/90 via-cream to-vibe-primary/10',
)
</script>

<template>
  <transition name="join-glass">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" @click="closeModal"></div>
      <div
        class="relative z-10 w-full max-w-lg rounded-3xl bg-gradient-to-br p-8 text-charcoal shadow-2xl"
        :class="modeClass"
      >
        <header class="flex items-center gap-4 mb-6">
          <div
            class="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center text-xl font-semibold"
            :class="props.mode === 'focus' ? 'text-focus-accent' : 'text-vibe-accent'"
          >
            {{ leader?.name?.charAt(0) || '隊' }}
          </div>
          <div>
            <p class="text-caption uppercase tracking-[0.3em] text-slate">team</p>
            <h2 class="text-h2 font-semibold">{{ team?.name }}</h2>
            <p class="text-caption text-slate">和 {{ leader?.name || '队长' }} 聊聊你的加入意愿</p>
          </div>
        </header>

        <section class="space-y-4 mb-6">
          <p class="text-caption text-slate">选择一个你想扮演的角色</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="role in roleOptions"
              :key="role"
              type="button"
              class="px-4 py-2 rounded-full text-sm"
              :class="form.role === role
                ? (props.mode === 'focus' ? 'bg-focus-primary text-white' : 'bg-vibe-accent text-white')
                : 'bg-white/80 text-charcoal'"
              @click="selectRole(role)
              "
            >
              {{ role }}
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-full text-sm border border-dashed border-slate/40 text-slate"
              @click="form.role = ''"
            >
              还在探索
            </button>
          </div>
        </section>

        <section class="space-y-3 mb-8">
          <div class="flex items-center justify-between">
            <p class="text-caption text-slate">给队长的一段话</p>
            <button
              class="text-sm font-semibold"
              :class="props.mode === 'focus' ? 'text-focus-accent' : 'text-vibe-accent'"
              @click="handleAiFill"
            >
              {{ aiLoading ? 'AI 正在写…' : 'AI 帮我写' }}
            </button>
          </div>
          <div class="relative">
            <textarea
              v-model="form.message"
              rows="4"
              class="w-full rounded-2xl bg-white/80 p-4 text-body text-charcoal placeholder-slate/50 outline-none shadow-lg"
              placeholder="例如：我能提供跨院数据可视化支持，方便与研究组对接..."
            />
            <div
              class="pointer-events-none absolute inset-0 rounded-2xl border border-white/50 shadow-inner"
            ></div>
          </div>
          <p class="text-xs text-slate">AI 会参考你的 InfoCross 档案，可在发送前微调。</p>
        </section>

        <button
          class="w-full rounded-2xl py-4 text-lg font-semibold text-white"
          :class="props.mode === 'focus' ? 'bg-charcoal' : 'bg-vibe-accent'"
          @click="handleSubmit"
        >
          发送破壁申请
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.join-glass-enter-active,
.join-glass-leave-active {
  transition: opacity 0.3s ease;
}
.join-glass-enter-from,
.join-glass-leave-to {
  opacity: 0;
}
</style>
