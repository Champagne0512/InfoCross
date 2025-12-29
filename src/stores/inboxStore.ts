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
import { fetchUserTeams } from '@/api/team'
import { fetchTeamChatMessages, fetchTeamApplicationQueue } from '@/api/teamWorkspace'
import { fetchInterestChatConversations, fetchInterestChatWithUser } from '@/api/teamInterestChat'
import { supabase } from '@/api/client'

export const useInboxStore = defineStore('inbox', () => {
  // 是否已加载
  const isLoaded = ref(false)
  const isLoading = ref(false)

  const previews = ref<InboxPreview[]>([
    {
      id: 'application-001',
      category: 'applications',
      title: '张三申请加入 AI 工作坊',
      preview: '附言：我善于 Prompt 设计，可以补足团队',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      unread: true,
      icon: 'file',
    },
    {
      id: 'application-002',
      category: 'applications',
      title: '李明申请加入数据分析组',
      preview: '熟悉 Python 和 SQL，有实习经验',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      unread: true,
      icon: 'file',
    },
    {
      id: 'application-003',
      category: 'applications',
      title: '王芳申请加入设计团队',
      preview: '擅长 UI/UX 设计，作品集已附上',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      unread: false,
      icon: 'file',
    },
    {
      id: 'application-004',
      category: 'applications',
      title: '赵强申请加入后端开发组',
      preview: '熟悉 Java 和 Spring Boot',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      unread: false,
      icon: 'file',
    },
    {
      id: 'application-005',
      category: 'applications',
      title: '陈雪申请加入产品组',
      preview: '有两年产品经理实习经验',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      unread: false,
      icon: 'file',
    },
    {
      id: 'activity-001',
      category: 'activity',
      title: '刘婷点赞了你的 Signal 情报',
      preview: '《图书馆冷气维修进度》',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      unread: false,
      icon: 'heart',
    },
    {
      id: 'activity-002',
      category: 'activity',
      title: '王伟评论了你的帖子',
      preview: '这个观点很有见地！',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      unread: true,
      icon: 'heart',
    },
    {
      id: 'activity-003',
      category: 'activity',
      title: '你的文章被推荐到首页',
      preview: '《如何高效学习编程》',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      unread: false,
      icon: 'heart',
    },
    {
      id: 'activity-004',
      category: 'activity',
      title: '小红收藏了你的攻略',
      preview: '《校园美食地图》',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      unread: false,
      icon: 'heart',
    },
    {
      id: 'activity-005',
      category: 'activity',
      title: '你获得了新成就',
      preview: '连续签到 7 天',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      unread: false,
      icon: 'heart',
    },
    {
      id: 'system-001',
      category: 'system',
      title: '系统更新完成',
      preview: 'InfoCross v1.4 提升了论坛搜索体验',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      unread: false,
      icon: 'bell',
    },
    {
      id: 'system-002',
      category: 'system',
      title: '安全提醒',
      preview: '检测到新设备登录，请确认是否本人操作',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      unread: true,
      icon: 'bell',
    },
    {
      id: 'system-003',
      category: 'system',
      title: '活动通知',
      preview: '校园编程马拉松即将开始报名',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      unread: false,
      icon: 'bell',
    },
    {
      id: 'system-004',
      category: 'system',
      title: '账户提醒',
      preview: '您的会员即将到期，续费享 8 折优惠',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      unread: false,
      icon: 'bell',
    },
    {
      id: 'system-005',
      category: 'system',
      title: '维护通知',
      preview: '系统将于周日凌晨进行例行维护',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      unread: false,
      icon: 'bell',
    },
  ])

  // 动态加载的聊天线程
  const chatThreads = ref<Record<string, InboxChatThread>>({})
  
  // 动态加载的申请详情
  const dynamicApplicationDetails = ref<Record<string, InboxApplicationDetail>>({})

  // 从数据库加载用户的小组聊天和申请
  async function loadUserChats() {
    if (isLoading.value) return
    isLoading.value = true
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        isLoading.value = false
        return
      }
      
      const teams = await fetchUserTeams()
      
      // 移除旧的聊天预览和申请预览
      previews.value = previews.value.filter(p => p.category !== 'groups' && p.category !== 'directs' && !p.id.startsWith('app-real-'))
      
      // 为每个小组创建聊天预览和线程
      for (const team of teams) {
        const chatId = `chat-team-${team.id}`
        
        // 获取最新消息作为预览
        let previewText = '暂无消息'
        let lastTimestamp = team.createdAt
        const messages = await fetchTeamChatMessages(team.id, 10, user.id)
        
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1]
          if (lastMsg) {
            previewText = `${lastMsg.senderName}：${lastMsg.content}`
            lastTimestamp = lastMsg.createdAt
          }
        }
        
        // 添加预览
        previews.value.push({
          id: chatId,
          category: 'groups',
          title: team.name,
          preview: previewText,
          timestamp: lastTimestamp,
          unread: false,
          avatarUrl: undefined,
        })
        
        // 添加聊天线程
        chatThreads.value[chatId] = {
          id: chatId,
          teamId: team.id,
          name: team.name,
          onlineCount: team.currentMembers,
          redirectRoute: `/team/hub?team=${team.id}`,
          messages: messages.map(msg => ({
            id: String(msg.id),
            author: msg.senderId === user.id ? '我' : msg.senderName,
            isMine: msg.senderId === user.id,
            content: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          })),
        }
        
        // 如果用户是队长，加载该小组的申请
        if (team.ownerId === user.id) {
          try {
            const applications = await fetchTeamApplicationQueue(team.id)
            for (const app of applications) {
              if (app.status !== 'pending') continue // 只显示待处理的申请
              
              const appId = `app-real-${app.id}`
              
              // 添加申请预览
              previews.value.push({
                id: appId,
                category: 'applications',
                title: `${app.applicantName || '用户'} 申请加入 ${team.name}`,
                preview: app.message || '无附言',
                timestamp: app.createdAt,
                unread: true,
                icon: 'file',
              })
              
              // 添加申请详情
              dynamicApplicationDetails.value[appId] = {
                id: appId,
                projectName: team.name,
                role: app.preferredRole || '成员',
                applicant: {
                  name: app.applicantName || '用户',
                  college: app.applicantCollege || '未知学院',
                  avatarUrl: undefined,
                  skills: [],
                },
                matchScore: 0.8,
                message: app.message || '期待加入团队',
                applicationId: app.id, // 保存真实的申请 ID 用于审批
                teamId: team.id,
              }
            }
          } catch (e) {
            console.error('加载小组申请失败:', e)
          }
        }
      }
      
      // 按时间排序预览
      previews.value.sort((a, b) => {
        if (a.category !== b.category) return 0
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
      
      // 加载私聊会话（临时聊天）
      try {
        const interestConversations = await fetchInterestChatConversations()
        for (const conv of interestConversations) {
          // 统一格式：interest-{teamId}-{partnerId}
          const dmId = `interest-${conv.teamId}-${conv.partnerId}`
          
          // 添加私聊预览
          previews.value.push({
            id: dmId,
            category: 'directs',
            title: conv.isOwner ? `${conv.partnerName} - ${conv.teamName}` : conv.teamName,
            preview: conv.lastMessage,
            timestamp: conv.lastMessageAt,
            unread: false,
            avatarUrl: conv.partnerAvatar,
          })
          
          // 加载私聊消息
          const messages = await fetchInterestChatWithUser(conv.teamId, conv.partnerId)
          chatThreads.value[dmId] = {
            id: dmId,
            teamId: conv.teamId,
            name: conv.isOwner ? `${conv.partnerName} - ${conv.teamName}` : conv.teamName,
            onlineCount: 1,
            messages: messages.map(msg => ({
              id: String(msg.id),
              author: msg.senderId === user.id ? '我' : msg.senderName,
              isMine: msg.senderId === user.id,
              content: msg.content,
              timestamp: new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            })),
          }
        }
      } catch (e) {
        console.error('加载私聊失败:', e)
      }
      
      isLoaded.value = true
    } catch (error) {
      console.error('加载用户聊天失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const applicationDetails: Record<string, InboxApplicationDetail> = {
    'application-001': {
      id: 'application-001',
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
    'application-002': {
      id: 'application-002',
      projectName: '数据分析项目',
      role: '数据分析师',
      applicant: {
        name: '李明',
        college: '统计学院',
        avatarUrl: '/avatars/applicant-li.png',
        skills: ['Python', 'SQL', 'Tableau'],
      },
      matchScore: 0.85,
      message: '有丰富的数据分析实习经验，熟悉各类分析工具。',
    },
    'application-003': {
      id: 'application-003',
      projectName: '产品设计团队',
      role: 'UI/UX 设计师',
      applicant: {
        name: '王芳',
        college: '艺术学院',
        avatarUrl: '/avatars/applicant-wang.png',
        skills: ['Figma', 'Sketch', '用户研究'],
      },
      matchScore: 0.92,
      message: '热爱设计，作品集已附上，期待加入团队。',
    },
    'application-004': {
      id: 'application-004',
      projectName: '后端开发组',
      role: '后端工程师',
      applicant: {
        name: '赵强',
        college: '软件学院',
        avatarUrl: '/avatars/applicant-zhao.png',
        skills: ['Java', 'Spring Boot', 'MySQL'],
      },
      matchScore: 0.88,
      message: '熟悉后端开发全流程，有多个项目经验。',
    },
    'application-005': {
      id: 'application-005',
      projectName: '产品运营组',
      role: '产品经理',
      applicant: {
        name: '陈雪',
        college: '管理学院',
        avatarUrl: '/avatars/applicant-chen.png',
        skills: ['产品规划', '数据分析', '用户运营'],
      },
      matchScore: 0.87,
      message: '有两年产品经理实习经验，擅长用户需求分析。',
    },
  }

  const activityDetails: Record<string, InboxActivityDetail> = {
    'activity-001': {
      id: 'activity-001',
      title: '刘婷点赞了你的情报',
      origin: {
        title: '图书馆冷气维修进度',
        excerpt: '第二教学楼 4 层空调已恢复，预计周三完成余下区域...',
      },
      participants: ['刘婷', '王伟', '匿名用户'],
      comment: '终于等到这个消息了！',
    },
    'activity-002': {
      id: 'activity-002',
      title: '王伟评论了你的帖子',
      origin: {
        title: '关于校园网速度的讨论',
        excerpt: '最近校园网速度明显提升了...',
      },
      participants: ['王伟'],
      comment: '这个观点很有见地！',
    },
    'activity-003': {
      id: 'activity-003',
      title: '你的文章被推荐到首页',
      origin: {
        title: '如何高效学习编程',
        excerpt: '分享一些我在学习编程过程中的心得体会...',
      },
      participants: ['系统推荐'],
    },
    'activity-004': {
      id: 'activity-004',
      title: '小红收藏了你的攻略',
      origin: {
        title: '校园美食地图',
        excerpt: '整理了校园周边最好吃的餐厅...',
      },
      participants: ['小红', '小明', '小华'],
    },
    'activity-005': {
      id: 'activity-005',
      title: '你获得了新成就',
      origin: {
        title: '连续签到 7 天',
        excerpt: '恭喜你完成了连续签到挑战！',
      },
      participants: [],
    },
  }

  const systemDetails: Record<string, InboxSystemDetail> = {
    'system-001': {
      id: 'system-001',
      title: '系统更新完成',
      body: 'InfoCross v1.4 提升了论坛搜索体验，并修复了 Signal 推送偶尔延迟的问题。',
    },
    'system-002': {
      id: 'system-002',
      title: '安全提醒',
      body: '检测到新设备登录您的账户。如果这不是您本人的操作，请立即修改密码并联系客服。',
    },
    'system-003': {
      id: 'system-003',
      title: '活动通知',
      body: '校园编程马拉松即将开始报名！本次活动将于下月举行，奖品丰厚，欢迎参加。',
    },
    'system-004': {
      id: 'system-004',
      title: '账户提醒',
      body: '您的会员即将到期，现在续费可享 8 折优惠。点击查看详情。',
    },
    'system-005': {
      id: 'system-005',
      title: '维护通知',
      body: '系统将于本周日凌晨 2:00-4:00 进行例行维护，届时服务可能暂时不可用。',
    },
  }

  const activeCategory = ref<InboxCategory>('groups')
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
    if (preview.category === 'groups' || preview.category === 'directs') {
      return chatThreads.value[preview.id]
    }
    if (preview.category === 'applications') {
      // 优先返回动态加载的真实申请
      if (dynamicApplicationDetails.value[preview.id]) {
        return dynamicApplicationDetails.value[preview.id]
      }
      return applicationDetails[preview.id]
    }
    if (preview.category === 'activity') {
      return activityDetails[preview.id]
    }
    return systemDetails[preview.id]
  })

  // 移除已处理的申请
  function removeApplication(id: string) {
    previews.value = previews.value.filter(p => p.id !== id)
    if (dynamicApplicationDetails.value[id]) {
      delete dynamicApplicationDetails.value[id]
    }
    // 选择下一个申请
    const nextApp = previews.value.find(p => p.category === 'applications')
    if (nextApp) {
      selectedId.value = nextApp.id
    }
  }

  return {
    previews,
    filteredPreviews,
    activeCategory,
    selectedId,
    selectedPreview,
    currentDetail,
    isLoading,
    isLoaded,
    loadUserChats,
    unreadCount,
    selectCategory,
    selectItem,
    markAsRead,
    removeApplication,
  }
})
