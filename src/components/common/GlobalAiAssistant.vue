<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
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

function toggleAssistant() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight
      }
    })
  }
}

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
    <button class="bh-btn" :class="{ 'bh-active': isOpen }" @click="toggleAssistant">
      <!-- 默认状态 -->
      <div class="bh-state bh-default">
        <svg viewBox="0 0 100 100">
          <defs>
            <radialGradient id="coreGrad">
              <stop offset="0%" stop-color="white" stop-opacity="1"/>
              <stop offset="70%" stop-color="white" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="white" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <!-- 轨道1 -->
          <ellipse class="orbit orbit-1" cx="50" cy="50" rx="30" ry="12" fill="none" stroke="white" stroke-width="0.5"/>
          <!-- 轨道2 -->
          <ellipse class="orbit orbit-2" cx="50" cy="50" rx="30" ry="12" fill="none" stroke="white" stroke-width="0.5"/>
          <!-- 轨道3 -->
          <ellipse class="orbit orbit-3" cx="50" cy="50" rx="30" ry="12" fill="none" stroke="white" stroke-width="0.5"/>
          <!-- 轨道上的光点 -->
          <circle class="orbit-dot dot-1" cx="80" cy="50" r="2.5" fill="white"/>
          <circle class="orbit-dot dot-2" cx="20" cy="50" r="2.5" fill="white"/>
          <circle class="orbit-dot dot-3" cx="50" cy="62" r="2.5" fill="white"/>
          <!-- 中心光晕 -->
          <circle cx="50" cy="50" r="18" fill="url(#coreGrad)"/>
          <!-- 中心核心 -->
          <circle class="core-center" cx="50" cy="50" r="8" fill="white"/>
        </svg>
      </div>
      <!-- 激活状态 -->
      <div class="bh-state bh-activated">
        <svg viewBox="0 0 100 100">
          <defs>
            <linearGradient id="bhGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FFD700"/>
              <stop offset="50%" stop-color="#FF6B35"/>
              <stop offset="100%" stop-color="#FFD700"/>
            </linearGradient>
          </defs>
          <circle class="bh-glow" cx="50" cy="50" r="42"/>
          <ellipse class="bh-disk1" cx="50" cy="50" rx="32" ry="10"/>
          <ellipse class="bh-disk2" cx="50" cy="50" rx="22" ry="7"/>
          <circle class="bh-center" cx="50" cy="50" r="12"/>
          <circle class="bh-horizon" cx="50" cy="50" r="13"/>
        </svg>
      </div>
    </button>
  </div>
</template>

<style scoped>
.ai-assistant { position: fixed; right: 24px; bottom: 24px; z-index: 50; }

/* 悬浮窗 - 绝对定位在按钮上方 */
.panel { 
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px; 
  height: 600px; 
  border-radius: 1.5rem; 
  border: 1px solid rgba(15,23,42,0.2); 
  background: rgba(255,255,255,0.85); 
  backdrop-filter: blur(30px); 
  box-shadow: 0 25px 80px rgba(15,23,42,0.25); 
  display: flex; 
  flex-direction: column; 
  animation: pop 0.4s ease; 
}
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

/* 黑洞按钮样式 */
.bh-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #0a0a0a;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  box-shadow: 0 4px 30px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.bh-btn:hover { 
  transform: scale(1.1); 
  box-shadow: 0 6px 40px rgba(0,0,0,0.8), 0 0 60px rgba(255,255,255,0.2);
}

.bh-state {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s, transform 0.5s;
}
.bh-state svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.bh-default { opacity: 1; transform: scale(1); }
.bh-activated { opacity: 0; transform: scale(0.6) rotate(180deg); }
.bh-active .bh-default { opacity: 0; transform: scale(0.6) rotate(-180deg); }
.bh-active .bh-activated { opacity: 1; transform: scale(1) rotate(0deg); }

/* 中心核心 - 明亮且有脉冲 */
.core-center {
  animation: corePulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 4px white);
  transition: all 0.3s ease;
}
.bh-btn:hover .core-center {
  filter: drop-shadow(0 0 8px white) drop-shadow(0 0 12px rgba(255,255,255,0.6));
  animation: corePulseHover 1s ease-in-out infinite;
}
@keyframes corePulse {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
@keyframes corePulseHover {
  0%, 100% { opacity: 1; transform: scale(1.05); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 轨道 - 三个不同角度旋转 */
.orbit {
  stroke-opacity: 0.3;
  transform-origin: 50px 50px;
  transition: stroke-opacity 0.3s ease;
}
.bh-btn:hover .orbit {
  stroke-opacity: 0.6;
}
.orbit-1 {
  animation: orbitRotate1 8s linear infinite;
}
.orbit-2 {
  animation: orbitRotate2 8s linear infinite;
  transform: rotate(60deg);
}
.orbit-3 {
  animation: orbitRotate3 8s linear infinite;
  transform: rotate(120deg);
}
.bh-btn:hover .orbit-1 {
  animation: orbitRotate1 3s linear infinite;
}
.bh-btn:hover .orbit-2 {
  animation: orbitRotate2 3s linear infinite;
}
.bh-btn:hover .orbit-3 {
  animation: orbitRotate3 3s linear infinite;
}
@keyframes orbitRotate1 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes orbitRotate2 {
  from { transform: rotate(60deg); }
  to { transform: rotate(420deg); }
}
@keyframes orbitRotate3 {
  from { transform: rotate(120deg); }
  to { transform: rotate(480deg); }
}

/* 轨道上的光点 */
.orbit-dot {
  filter: drop-shadow(0 0 2px white);
  transform-origin: 50px 50px;
  transition: filter 0.3s ease;
}
.bh-btn:hover .orbit-dot {
  filter: drop-shadow(0 0 4px white) drop-shadow(0 0 6px rgba(255,255,255,0.8));
}
.dot-1 {
  animation: dotOrbit1 4s linear infinite;
}
.dot-2 {
  animation: dotOrbit2 4s linear infinite;
}
.dot-3 {
  animation: dotOrbit3 4s linear infinite;
}
.bh-btn:hover .dot-1 {
  animation: dotOrbit1 1.5s linear infinite;
}
.bh-btn:hover .dot-2 {
  animation: dotOrbit2 1.5s linear infinite;
}
.bh-btn:hover .dot-3 {
  animation: dotOrbit3 1.5s linear infinite;
}
@keyframes dotOrbit1 {
  from { transform: rotate(0deg) translateX(30px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
}
@keyframes dotOrbit2 {
  from { transform: rotate(120deg) translateX(30px) rotate(-120deg); }
  to { transform: rotate(480deg) translateX(30px) rotate(-480deg); }
}
@keyframes dotOrbit3 {
  from { transform: rotate(240deg) translateX(30px) rotate(-240deg); }
  to { transform: rotate(600deg) translateX(30px) rotate(-600deg); }
}

.bh-glow {
  fill: none;
  stroke: #ff9500;
  stroke-width: 2;
  opacity: 0.4;
  animation: bhGlowPulse 2s ease-in-out infinite;
}
@keyframes bhGlowPulse {
  0%, 100% { opacity: 0.2; stroke-width: 1; }
  50% { opacity: 0.6; stroke-width: 3; }
}

.bh-disk1 {
  fill: none;
  stroke: url(#bhGrad);
  stroke-width: 6;
  transform-origin: center;
  animation: bhSpinCW 3s linear infinite;
}
.bh-disk2 {
  fill: none;
  stroke: url(#bhGrad);
  stroke-width: 3;
  opacity: 0.8;
  transform-origin: center;
  animation: bhSpinCCW 2s linear infinite;
}
@keyframes bhSpinCW {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes bhSpinCCW {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.bh-center { fill: #000; }

.bh-horizon {
  fill: none;
  stroke: #ff6b35;
  stroke-width: 2;
  animation: bhHorizon 1.5s ease-in-out infinite;
}
@keyframes bhHorizon {
  0%, 100% { stroke-opacity: 0.3; }
  50% { stroke-opacity: 1; }
}

.typing { display: inline-flex; gap: 6px; padding: 0 14px; }
.typing span { width: 6px; height: 6px; border-radius: 9999px; background: rgba(15,23,42,0.5); animation: type 1.2s infinite ease-in-out; }
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes pop { 0% { opacity: 0; transform: translateY(12px) scale(0.95); } 60% { opacity: 1; transform: translateY(-4px) scale(1.02); } 100% { transform: translateY(0) scale(1); } }
@keyframes type { 0%, 80%, 100% { opacity: 0.2; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-4px); } }

/* 响应式 - 小屏幕时悬浮窗自适应 */
@media (max-width: 640px) { 
  .ai-assistant { right: 16px; bottom: 16px; }
  .panel { 
    width: calc(100vw - 32px); 
    height: calc(100vh - 120px);
    right: -8px;
  } 
}

/* 当悬浮窗可能超出顶部时，调整位置 */
@media (max-height: 750px) {
  .panel {
    height: calc(100vh - 120px);
    bottom: 80px;
  }
}
</style>
