import type { FrequencyMode } from '@/stores/frequencyStore'

export interface GeneratedContent {
  title: string
  description: string
  tags: string[]
  category?: string
  location?: string
  skills?: string[]
  suggestedDeadline?: string
  suggestedEventTime?: string
}

export interface GenerateContentParams {
  theme: string
  mode: FrequencyMode
  isTeam?: boolean
}

/**

 * 调用AI生成项目/活动内容

 */

export async function generateContent(params: GenerateContentParams): Promise<GeneratedContent> {

  try {

    // 先尝试调用Edge Function

    const { supabase } = await import('./client')

    

    const { data, error } = await supabase.functions.invoke('generate-content', {

      body: params,

    })



    if (error) {

      console.warn('Edge Function调用失败，使用模拟数据:', error)

      return await generateContentDirectWithAPI(params)

    }



    return data as GeneratedContent

  } catch (error) {

    console.error('AI生成内容失败，使用模拟数据:', error)

    return await generateContentDirectWithAPI(params)

  }

}

/**
 * 使用增强的模拟数据生成内容
 */
async function generateContentDirectWithAPI(params: GenerateContentParams): Promise<GeneratedContent> {
  console.log('使用本地AI模拟生成内容（Edge Function部署后将使用真实AI）')
  return generateMockContent(params)
}

/**
 * 直接调用阿里云DashScope API生成内容
 */
export async function generateContentDirect(params: GenerateContentParams): Promise<GeneratedContent> {
  const { theme, mode, isTeam } = params
  
  try {
    // 这里需要调用实际的AI API
    // 由于前端无法直接调用阿里云API（需要密钥），我们需要通过后端服务
    // 这里先返回模拟数据，后续需要实现后端API
    return generateMockContent(params)
  } catch (error) {
    console.error('AI生成失败:', error)
    throw new Error('AI生成失败，请稍后重试')
  }
}

/**
 * 生成模拟内容（根据主题生成个性化内容）
 */
function generateMockContent(params: GenerateContentParams): GeneratedContent {
  const { theme, mode, isTeam } = params
  
  // 根据主题智能选择分类和地点
  const getCategoryAndLocation = () => {
    const lowerTheme = theme.toLowerCase()
    
    if (isTeam) {
      if (mode === 'focus') {
        if (lowerTheme.includes('ai') || lowerTheme.includes('人工智能') || lowerTheme.includes('机器学习')) {
          return { category: 'research', location: 'AI实验室', skills: ['Python编程', '机器学习', '数据分析'] }
        }
        if (lowerTheme.includes('比赛') || lowerTheme.includes('竞赛') || lowerTheme.includes('hackathon')) {
          return { category: 'competition', location: '创新工场', skills: ['算法设计', '团队协作', '压力管理'] }
        }
        if (lowerTheme.includes('项目') || lowerTheme.includes('开发') || lowerTheme.includes('编程')) {
          return { category: 'project', location: '技术中心', skills: ['前端开发', '后端开发', '项目管理'] }
        }
        return { category: 'study', location: '图书馆研讨室', skills: ['学习能力', '沟通能力', '时间管理'] }
      } else {
        if (lowerTheme.includes('运动') || lowerTheme.includes('体育') || lowerTheme.includes('健身')) {
          return { category: 'sports', location: '体育馆', skills: ['团队精神', '运动能力'] }
        }
        if (lowerTheme.includes('游戏') || lowerTheme.includes('开黑') || lowerTheme.includes('电竞')) {
          return { category: 'gaming', location: '电竞社活动室', skills: ['游戏策略', '团队配合'] }
        }
        if (lowerTheme.includes('吃饭') || lowerTheme.includes('约饭') || lowerTheme.includes('美食')) {
          return { category: 'meal', location: '二食堂', skills: ['社交能力', '美食鉴赏'] }
        }
        return { category: 'study', location: '校园咖啡厅', skills: ['兴趣热情', '时间投入'] }
      }
    } else {
      if (mode === 'focus') {
        if (lowerTheme.includes('讲座') || lowerTheme.includes('分享') || lowerTheme.includes('研讨')) {
          return { category: 'lecture', location: '学术报告厅' }
        }
        if (lowerTheme.includes('比赛') || lowerTheme.includes('竞赛')) {
          return { category: 'competition', location: '比赛场地' }
        }
        if (lowerTheme.includes('研究') || lowerTheme.includes('学术')) {
          return { category: 'research', location: '科研楼' }
        }
        return { category: 'notice', location: '学生事务中心' }
      } else {
        if (lowerTheme.includes('运动') || lowerTheme.includes('体育')) {
          return { category: 'sports', location: '运动场' }
        }
        if (lowerTheme.includes('游戏') || lowerTheme.includes('开黑')) {
          return { category: 'gaming', location: '电竞室' }
        }
        if (lowerTheme.includes('吃饭') || lowerTheme.includes('约饭')) {
          return { category: 'meal', location: '食堂' }
        }
        return { category: 'study', location: '自习室' }
      }
    }
  }
  
  const { category, location, skills } = getCategoryAndLocation()
  
  // 生成智能标签
  const generateTags = () => {
    const baseTags = [theme]
    const lowerTheme = theme.toLowerCase()
    
    if (lowerTheme.includes('ai') || lowerTheme.includes('人工智能')) {
      baseTags.push('AI', '机器学习')
    }
    if (lowerTheme.includes('前端') || lowerTheme.includes('开发')) {
      baseTags.push('编程', '技术')
    }
    if (lowerTheme.includes('设计') || lowerTheme.includes('创意')) {
      baseTags.push('创意', '设计')
    }
    if (lowerTheme.includes('运动') || lowerTheme.includes('体育')) {
      baseTags.push('运动', '健康')
    }
    
    if (mode === 'focus') {
      baseTags.push(isTeam ? '团队' : '学术')
    } else {
      baseTags.push(isTeam ? '社交' : '活动')
    }
    
    return baseTags.slice(0, 4)
  }
  
  // 生成描述
  const generateDescription = () => {
    if (isTeam) {
      if (mode === 'focus') {
        return `我们正在组建一个专注于${theme}的团队，致力于探索该领域的前沿技术和应用。团队将定期举行讨论会，分享最新研究成果，并计划参与相关竞赛和项目开发。我们寻找对${theme}有浓厚兴趣的伙伴，共同学习、共同成长。在这里，你将有机会接触到最新的技术动态，结识志同道合的伙伴，并在实践中提升自己的能力。`
      } else {
        return `寻找同样喜欢${theme}的小伙伴！我们计划定期组织相关活动，一起分享经验、交流心得。无论你是新手还是有经验，都欢迎加入我们的大家庭。我们相信，${theme}不仅能带来乐趣，还能帮助我们拓展视野、结交朋友。让我们一起在轻松愉快的氛围中探索${theme}的无限可能！`
      }
    } else {
      if (mode === 'focus') {
        return `本次活动将深入探讨${theme}的核心概念和实际应用。我们邀请了行业专家分享最新研究成果和实践经验，帮助参与者全面了解${theme}的发展趋势和技术要点。活动将包括主题演讲、案例分析和互动讨论环节，为参与者提供全方位的学习体验。无论你是${theme}的新手还是有一定基础的爱好者，都能从中获得启发和收获。`
      } else {
        `来参加我们的${theme}主题活动吧！这是一个充满乐趣和创意的聚会，我们准备了丰富的互动环节和小游戏。不管你是${theme}的老手还是新手，都能在这里找到属于自己的乐趣。活动将包括经验分享、互动游戏和自由交流环节，让大家在轻松愉快的氛围中结识新朋友、学习新知识。快来加入我们，一起度过难忘的时光！`
      }
    }
  }
  
  // 生成时间
  const generateTime = () => {
    const now = new Date()
    if (mode === 'focus') {
      // Focus模式：3-7天后
      const days = Math.floor(Math.random() * 5) + 3
      const eventTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      const deadline = new Date(now.getTime() + (days + 1) * 24 * 60 * 60 * 1000)
      return {
        eventTime: eventTime.toISOString().slice(0, 16),
        suggestedDeadline: deadline.toISOString().split('T')[0]
      }
    } else {
      // Vibe模式：1-2天后
      const days = Math.floor(Math.random() * 2) + 1
      const eventTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      return {
        eventTime: eventTime.toISOString().slice(0, 16),
        suggestedDeadline: undefined
      }
    }
  }
  
  const { eventTime, suggestedDeadline } = generateTime()
  
  return {
    title: `${theme}${isTeam ? (mode === 'focus' ? '研究团队' : '兴趣小组') : (mode === 'focus' ? '主题分享' : '主题活动')}`,
    description: generateDescription(),
    tags: generateTags(),
    category,
    location,
    skills,
    suggestedDeadline,
    suggestedEventTime: eventTime,
  }
}