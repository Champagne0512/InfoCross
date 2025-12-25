<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Compass } from 'lucide-vue-next'
import { supabase } from '@/api/client'

type Role = 'user' | 'assistant'
interface ChatMessage { role: Role; content: string }

const router = useRouter()
const STORAGE_KEY = 'infocross-ai-assistant-store'
const EDGE_FUNCTION_NAME = 'global-ai-assistant'
const ALIYUN_API_KEY = import.meta.env.VITE_ALIYUN_API_KEY || ''

const SYSTEM_PROMPT = `# 角色设定
你是 InfoCross 平台的智能领航员 CrossBot。你专业、热情、简洁，是用户探索跨学科协作世界的最佳向导。

# 平台介绍
InfoCross 是一个面向高校学生的跨学科协作平台，帮助用户寻找志同道合的队友、参与学术讨论、组建项目团队。

# 网站地图 (Site Map)
1. /home (首页) - 查看全校最新动态、AI 个性化推荐、今日热点
2. /team (发现协作) - Focus 模式找科研项目/比赛队友，Vibe 模式即时约伴
3. /team/hub (协作空间) - 管理我创建/加入的小组，查看申请记录
4. /forum (全谱论坛) - Signal 模式快资讯，Depth 模式深度长文
5. /publish (发布中心) - 发起协作项目或活动招募
6. /inbox (消息中心) - 处理入队申请、查看私信
7. /profile (个人中心) - 数字 ID、能力雷达图、勋章
8. /bookmarks (我的收藏) - 收藏的文章和团队

# 跳转协议 [核心规则]
当用户意图涉及页面跳转时，在回复末尾追加：[NAV:路由路径]

示例：
- "我想找人组队" -> "去发现协作页面看看吧。[NAV:/team]"
- "怎么看申请记录" -> "在协作空间查看。[NAV:/team/hub]"
- "想发帖吐槽" -> "去论坛畅所欲言。[NAV:/forum]"
- "InfoCross是什么" -> "这是跨学科协作平台..." (无跳转，不加标记)

# 回复准则
1. 语气温暖友好，像热心学长学姐
2. 简洁有力，不啰嗦
3. 只在明确导航意图时添加 [NAV:] 标记
4. 不使用 emoji`

const isOpen = ref(false)
const isLoading = ref(false)
const inputValue = ref('')
const messages = ref<ChatMessage[]>([])
const messageListRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) messages.value = parsed
    } catch (e) { console.error('Failed to parse history', e) }
  }
})

watch(messages, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  nextTick(() => { if (messageListRef.value) messageListRef.value.scrollTop = messageListRef.value.scrollHeight })
}, { deep: true })

function toggleAssistant() { isOpen.value = !isOpen.value }

async function sendMessage() {
  const content = inputValue.value.trim()
  if (!content || isLoading.value) return
  messages.value = [...messages.value, { role: 'user', content }]
  inputValue.value = ''
  isLoading.value = true
  try {
    const reply = await requestReply()
    handleReply(String(reply))
  } catch (e) {
    console.error(e)
    handleReply('我暂时无法连接，稍后再试。')
  } finally { isLoading.value = false }
}

async function requestReply() {
  try {
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: { systemPrompt: SYSTEM_PROMPT, history: messages.value }
    })
    if (error) throw error
    if (data?.reply) return data.reply
    throw new Error('No reply')
  } catch (e) {
    console.warn('Edge function failed, trying DashScope', e)
    return requestDashScope()
  }
}

async function requestDashScope() {
  if (!ALIYUN_API_KEY) throw new Error('No API key')
  const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ALIYUN_API_KEY}` },
    body: JSON.stringify({
      model: 'qwen-plus',
      input: { messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.value.map(m => ({ role: m.role, content: m.content }))] },
      parameters: { temperature: 0.6, result_format: 'message' }
    })
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data?.output?.choices?.[0]?.message?.content ?? data?.output?.text ?? '好的'
}

function handleReply(raw: string) {
  const navMatch = raw.match(/\[NAV:(.*?)\]/)
  const clean = raw.replace(/\[NAV:.*?\]/g, '').trim()
  messages.value = [...messages.value, { role: 'assistant', content: clean }]
  if (navMatch?.[1]) {
    const path = navMatch[1].trim()
    setTimeout(() => router.push(path), 500)
  }
}

function handleKeydown(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }
function clearHistory() { messages.value = []; localStorage.removeItem(STORAGE_KEY) }
</script>

<template>
  <div class="ai-assistant">
    <transition name="fade">
      <div v-if="isOpen" class="panel">
        <div class="header">
          <div>
            <p class="label">CrossBot</p>
            <p class="sub">InfoCross 智能领航员</p>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="messages.length" class="clear-btn" @click="clearHistory" title="清空">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
            <button class="close-btn" @click="toggleAssistant">×</button>
          </div>
        </div>
        <div ref="messageListRef" class="messages">
          <p v-if="!messages.length" class="placeholder">你好，我是 CrossBot！试试问我"我想找人组队"</p>
          <div v-for="(msg, i) in messages" :key="i" :class="['bubble', msg.role === 'assistant' ? 'ai' : 'user']">{{ msg.content }}</div>
          <div v-if="isLoading" class="typing"><span/><span/><span/></div>
        </div>
        <div class="input-area">
          <textarea v-model="inputValue" rows="1" placeholder="输入问题..." @keydown="handleKeydown"/>
          <button :disabled="!inputValue.trim() || isLoading" @click="sendMessage">发送</button>
        </div>
      </div>
    </transition>
    <button class="fab" :class="{ open: isOpen }" @click="toggleAssistant">
      <Compass class="w-6 h-6 text-white"/>
      <span class="glow"/>
    </button>
  </div>
</template>

<style scoped>
.ai-assistant { position: fixed; right: 24px; bottom: 24px; z-index: 50; }
.panel { width: 380px; height: 600px; margin-bottom: 16px; border-radius: 1.5rem; border: 1px solid rgba(15,23,42,0.2); background: rgba(255,255,255,0.85); backdrop-filter: blur(30px); box-shadow: 0 25px 80px rgba(15,23,42,0.25); display: flex; flex-direction: column; animation: pop 0.4s ease; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid rgba(15,23,42,0.08); }
.label { font-family: 'DM Mono', monospace; font-size: 0.875rem; font-weight: 600; letter-spacing: 0.1em; color: #0f172a; }
.sub { margin-top: 4px; font-size: 0.8rem; color: #64748b; }
.clear-btn { border: none; background: transparent; color: #94a3b8; width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.clear-btn:hover { background: rgba(15,23,42,0.08); color: #0f172a; }
.close-btn { border: none; background: rgba(15,23,42,0.08); color: #0f172a; width: 32px; height: 32px; border-radius: 9999px; font-size: 1rem; cursor: pointer; transition: transform 0.3s; }
.close-btn:hover { transform: rotate(90deg); }
.messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.placeholder { text-align: center; color: #94a3b8; font-size: 0.9rem; line-height: 1.6; padding: 20px; }
.bubble { max-width: 90%; padding: 12px 14px; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; }
.bubble.ai { align-self: flex-start; background: rgba(148,163,184,0.2); color: #0f172a; }
.bubble.user { align-self: flex-end; background: #0f172a; color: #fff; }
.input-area { padding: 16px 20px 20px; border-top: 1px solid rgba(15,23,42,0.08); display: flex; gap: 12px; }
.input-area textarea { flex: 1; border: none; border-radius: 9999px; background: rgba(148,163,184,0.15); padding: 10px 16px; resize: none; font-size: 0.95rem; color: #0f172a; }
.input-area textarea:focus { outline: 2px solid rgba(15,23,42,0.25); }
.input-area button { background: #0f172a; color: white; padding: 10px 18px; border-radius: 9999px; border: none; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.input-area button:disabled { opacity: 0.4; cursor: not-allowed; }
.fab { width: 64px; height: 64px; border-radius: 9999px; background: linear-gradient(145deg, #0f172a, #1f2937); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 20px 35px rgba(15,23,42,0.35); position: relative; transition: transform 0.25s, box-shadow 0.25s; }
.fab:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 24px 45px rgba(15,23,42,0.5); }
.fab.open { transform: scale(0.95); }
.glow { position: absolute; inset: 0; border-radius: 9999px; background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.35), transparent 70%); animation: pulse 2.6s ease-in-out infinite; pointer-events: none; }
.typing { display: inline-flex; gap: 6px; padding: 0 14px; }
.typing span { width: 6px; height: 6px; border-radius: 9999px; background: rgba(15,23,42,0.5); animation: type 1.2s infinite ease-in-out; }
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes pop { 0% { opacity: 0; transform: translateY(12px) scale(0.95); } 60% { opacity: 1; transform: translateY(-4px) scale(1.02); } 100% { transform: translateY(0) scale(1); } }
@keyframes pulse { 0%, 100% { transform: scale(0.9); opacity: 0.6; } 50% { transform: scale(1); opacity: 1; } }
@keyframes type { 0%, 80%, 100% { opacity: 0.2; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-4px); } }
@media (max-width: 640px) { .panel { width: calc(100vw - 32px); height: calc(100vh - 120px); } .ai-assistant { right: 16px; bottom: 16px; } }
</style>
