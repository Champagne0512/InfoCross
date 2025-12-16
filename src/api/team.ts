import type { Team } from '@/types/models'
import { hasSupabase } from './client'

const mockTeams: Team[] = [
  {
    id: 1,
    name: 'AI+文学：跨学科叙事平台',
    description: '结合自然语言处理与文学创作，打造一个能自动生成故事线索的协作平台。需要前端、后端、NLP工程师和文学专业同学共同参与。',
    type: 'project',
    college: '计算机学院',
    currentMembers: 3,
    maxMembers: 6,
    requiredSkills: ['前端开发', 'NLP', '文学创作'],
    members: [
      { id: '1', name: '张三', skills: ['前端开发', 'Vue'] },
      { id: '2', name: '李四', skills: ['NLP', 'Python'] },
      { id: '3', name: '王五', skills: ['文学创作', '中文'] }
    ],
    tags: ['AI', '文学', '跨学科'],
    createdAt: '2025-12-15',
    deadline: '2025-12-31',
    status: 'recruiting'
  },
  {
    id: 2,
    name: 'HNSW向量检索算法优化',
    description: '针对大规模向量检索场景，优化HNSW算法的索引构建和查询性能。目标是实现毫秒级响应的百万级向量检索。',
    type: 'research',
    college: '计算机学院',
    currentMembers: 2,
    maxMembers: 4,
    requiredSkills: ['算法', 'C++', '向量检索'],
    members: [
      { id: '4', name: '赵六', skills: ['算法', 'C++'] },
      { id: '5', name: '钱七', skills: ['Python', '算法'] }
    ],
    tags: ['算法', '向量检索', '性能优化'],
    createdAt: '2025-12-14',
    status: 'recruiting'
  },
  {
    id: 3,
    name: '可持续建筑设计大赛',
    description: '参加国际可持续建筑设计大赛，设计一个零碳校园建筑。需要建筑、结构、环境和能源专业的同学组成跨学科团队。',
    type: 'competition',
    college: '建筑学院',
    currentMembers: 5,
    maxMembers: 8,
    requiredSkills: ['建筑设计', '结构工程', '环境工程'],
    members: [
      { id: '6', name: '孙八', skills: ['建筑设计', 'SketchUp'] },
      { id: '7', name: '周九', skills: ['结构工程', 'SAP2000'] },
      { id: '8', name: '吴十', skills: ['环境工程', 'EnergyPlus'] },
      { id: '9', name: '郑十一', skills: ['能源系统', 'TRNSYS'] },
      { id: '10', name: '王十二', skills: ['项目管理'] }
    ],
    tags: ['可持续建筑', '设计大赛', '跨学科'],
    createdAt: '2025-12-13',
    deadline: '2026-01-15',
    status: 'recruiting'
  },
  {
    id: 4,
    name: '数据结构与算法学习小组',
    description: '系统学习数据结构与算法，每周一次线下讨论+线上刷题。适合准备算法竞赛或技术面试的同学。',
    type: 'study',
    college: '计算机学院',
    currentMembers: 8,
    maxMembers: 12,
    requiredSkills: ['编程基础', '算法'],
    members: [
      { id: '11', name: '陈十三', skills: ['C++', '算法'] },
      { id: '12', name: '林十四', skills: ['Java', '数据结构'] },
      { id: '13', name: '黄十五', skills: ['Python', '算法'] }
    ],
    tags: ['算法', '数据结构', '学习小组'],
    createdAt: '2025-12-12',
    status: 'recruiting'
  },
  {
    id: 5,
    name: '校园低碳出行App开发',
    description: '开发一个校园低碳出行App，整合校车、共享单车、步行路线，鼓励师生选择低碳出行方式。需要产品、设计、前后端开发。',
    type: 'project',
    college: '商学院',
    currentMembers: 4,
    maxMembers: 7,
    requiredSkills: ['产品设计', 'UI设计', 'React Native'],
    members: [
      { id: '14', name: '刘十六', skills: ['产品设计', 'Axure'] },
      { id: '15', name: '杨十七', skills: ['UI设计', 'Figma'] },
      { id: '16', name: '何十八', skills: ['React Native', 'JavaScript'] },
      { id: '17', name: '高十九', skills: ['后端开发', 'Node.js'] }
    ],
    tags: ['低碳出行', 'App开发', '产品设计'],
    createdAt: '2025-12-11',
    status: 'recruiting'
  },
  {
    id: 6,
    name: '机器学习论文研读组',
    description: '每周研读一篇顶会机器学习论文，深入理解算法原理和实现细节。需要有一定数学基础和编程能力。',
    type: 'study',
    college: '计算机学院',
    currentMembers: 6,
    maxMembers: 8,
    requiredSkills: ['数学基础', 'Python', '机器学习'],
    members: [
      { id: '18', name: '马二十', skills: ['数学', 'Python'] },
      { id: '19', name: '罗二十一', skills: ['机器学习', 'TensorFlow'] },
      { id: '20', name: '梁二十二', skills: ['深度学习', 'PyTorch'] }
    ],
    tags: ['机器学习', '论文研读', '深度学习'],
    createdAt: '2025-12-10',
    status: 'recruiting'
  }
]

export async function fetchTeams(params?: {
  type?: string
  college?: string
  skill?: string
  status?: string
  limit?: number
}): Promise<Team[]> {
  if (hasSupabase) {
    console.info('[Supabase] 可在此处接入真实团队数据查询。当前返回本地 mock。')
  }

  let result = [...mockTeams]

  if (params?.type && params.type !== 'all') {
    result = result.filter(team => team.type === params.type)
  }

  if (params?.college && params.college !== 'all') {
    result = result.filter(team => team.college === params.college)
  }

  if (params?.limit) {
    result = result.slice(0, params.limit)
  }

  return result
}

export async function fetchTeamById(id: number): Promise<Team | null> {
  return mockTeams.find(team => team.id === id) || null
}

export async function createTeam(team: Partial<Team>): Promise<Team> {
  const today = new Date().toISOString().split('T')[0] || new Date().toISOString()
  const newTeam: Team = {
    id: mockTeams.length + 1,
    name: team.name || '未命名团队',
    description: team.description || '',
    type: (team.type as Team['type']) || 'project',
    college: team.college || '未知学院',
    currentMembers: 1,
    maxMembers: team.maxMembers || 5,
    requiredSkills: team.requiredSkills || [],
    members: team.members || [],
    tags: team.tags || [],
    createdAt: today,
    status: 'recruiting'
  }

  mockTeams.unshift(newTeam)
  return newTeam
}

export async function joinTeam(teamId: number, _userId: string): Promise<boolean> {
  const team = mockTeams.find(t => t.id === teamId)
  if (!team) return false
  
  if (team.currentMembers >= team.maxMembers) return false
  
  team.currentMembers += 1
  return true
}
