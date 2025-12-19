import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  InboxCategory,
  InboxPreview,
  InboxChatThread,
  InboxApplicationDetail,
  InboxActivityDetail,
  InboxSystemDetail,
} from '@/types/models'

export const useInboxStore = defineStore('inbox', () => {
  const previews = ref<InboxPreview[]>([
    {
      id: 'chat-001',
      category: 'chats',
      title: 'RAG Demo 小组',
      preview: '李四：今晚 9 点同步，记得准备 Demo',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      unread: true,
      avatarUrl: '/avatars/team-rag.png',
    },
    {
      id: 'application-002',
      category: 'applications',
      title: '张三申请加入 AI 工作坊',
      preview: '附言：我善于 Prompt 设计，可以补足团队',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      unread: true,
      icon: 'file',
    },
    {
      id: 'activity-003',
      category: 'activity',
      title: '刘婷点赞了你的 Signal 情报',
      preview: '《图书馆冷气维修进度》',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      unread: false,
      icon: 'heart',
    },
    {
      id: 'system-004',
      category: 'system',
      title: '系统更新完成',
      preview: 'InfoCross v1.4 提升了论坛搜索体验',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      unread: false,
      icon: 'bell',
    },
  ])

  const chatThreads: Record<string, InboxChatThread> = {
    'chat-001': {
      id: 'chat-001',
      name: 'RAG Demo 小组',
      onlineCount: 5,
      messages: [
        { id: 'm1', author: '李四', isMine: false, content: '今晚 9 点同步，记得准备 Demo', timestamp: '20:10' },
        { id: 'm2', author: '我', isMine: true, content: '收到，我负责展示推荐排序部分', timestamp: '20:12' },
        { id: 'm3', author: '陈可', isMine: false, content: '我刚更新了 UI，见 Figma 第三页', timestamp: '20:13' },
      ],
    },
  }

  const applicationDetails: Record<string, InboxApplicationDetail> = {
    'application-002': {
      id: 'application-002',
      projectName: 'AI Labor 工作坊',
      role: '可视化工程师',
      applicant: {
        name: '张三',
        college: '计算机学院',
        avatarUrl: '/avatars/applicant-zhang.png',
        skills: ['Prompt', 'Python', '设计系统'],
      },
      matchScore: 0.9,
      message: '我擅长把多学科的想法落地，期待和你们一起做出惊喜。',
    },
  }

  const activityDetails: Record<string, InboxActivityDetail> = {
    'activity-003': {
      id: 'activity-003',
      title: '刘婷点赞了你的情报',
      origin: {
        title: '图书馆冷气维修进度',
        excerpt: '第二教学楼 4 层空调已恢复，预计周三完成余下区域...',
      },
      participants: ['刘婷', '王伟', '匿名用户'],
      comment: '终于等到这个消息了！',
    },
  }

  const systemDetails: Record<string, InboxSystemDetail> = {
    'system-004': {
      id: 'system-004',
      title: '系统更新完成',
      body: 'InfoCross v1.4 提升了论坛搜索体验，并修复了 Signal 推送偶尔延迟的问题。',
    },
  }

  const activeCategory = ref<InboxCategory>('chats')
  const selectedId = ref(previews.value[0]?.id ?? '')

  const filteredPreviews = computed(() =>
    previews.value.filter((item) => item.category === activeCategory.value),
  )

  const selectedPreview = computed(() =>
    previews.value.find((item) => item.id === selectedId.value) ?? null,
  )

  function selectCategory(category: InboxCategory) {
    activeCategory.value = category
    const firstItem = previews.value.find((item) => item.category === category)
    if (firstItem) {
      selectedId.value = firstItem.id
    }
  }

  function selectItem(id: string) {
    selectedId.value = id
    markAsRead(id)
  }

  function markAsRead(id: string) {
    previews.value = previews.value.map((item) =>
      item.id === id ? { ...item, unread: false } : item,
    )
  }

  const unreadCount = computed(() => previews.value.filter((item) => item.unread).length)

  const currentDetail = computed(() => {
    const preview = selectedPreview.value
    if (!preview) return null
    if (preview.category === 'chats') {
      return chatThreads[preview.id]
    }
    if (preview.category === 'applications') {
      return applicationDetails[preview.id]
    }
    if (preview.category === 'activity') {
      return activityDetails[preview.id]
    }
    return systemDetails[preview.id]
  })

  return {
    previews,
    filteredPreviews,
    activeCategory,
    selectedId,
    selectedPreview,
    currentDetail,
    unreadCount,
    selectCategory,
    selectItem,
    markAsRead,
  }
})
