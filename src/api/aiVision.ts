import type { FrequencyMode } from '@/stores/frequencyStore'

export interface RecognizedTeamInfo {
  title?: string
  description?: string
  category?: string
  location?: string
  college?: string
  maxMembers?: number
  skills?: string[] | string
  tags?: string[] | string
  deadline?: string
  eventTime?: string
}

const API_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = 'gpt-4o-mini'

function assertApiKey(): string {
  const key = import.meta.env.VITE_AI_RECOGNIZER_KEY
  if (!key) {
    throw new Error('未配置 AI 识别密钥，请在 .env.local 中设置 VITE_AI_RECOGNIZER_KEY')
  }
  return key
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

export async function recognizeTeamFromImage(dataUrl: string, mode: FrequencyMode): Promise<RecognizedTeamInfo> {
  const apiKey = assertApiKey()
  const prompt = `你是一名 OCR + 结构化信息助手。读取提供的活动/项目海报图片，输出一个 JSON，字段：
  title: 项目或约伴标题，字符串；
  description: 项目简介正文，字符串；
  category: 若可判断，输出 research/competition/project/study 或 meal/sports/carpool/gaming/study；
  location: 主要地点或集合点；
  college: 主办学院或社团名称；
  maxMembers: 数字，提取招募人数/名额；
  skills: 需要的技能数组；
  tags: 关键标签数组；
  deadline: 报名/截止日期（ISO 日期）;
  eventTime: 活动开始时间（ISO 日期时间）。
请严格输出 JSON。当前模式: ${mode}.`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: '你是擅长读取中文校园招募海报的助手，只输出用户要求的 JSON。',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'team_schema',
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              location: { type: 'string' },
              college: { type: 'string' },
              maxMembers: { type: 'number' },
              skills: {
                oneOf: [
                  { type: 'array', items: { type: 'string' } },
                  { type: 'string' },
                ],
              },
              tags: {
                oneOf: [
                  { type: 'array', items: { type: 'string' } },
                  { type: 'string' },
                ],
              },
              deadline: { type: 'string' },
              eventTime: { type: 'string' },
            },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI 识别失败：${errorText}`)
  }

  const json = (await response.json()) as ChatCompletionResponse
  const content = json.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('AI 未返回结果')
  }

  try {
    return JSON.parse(content)
  } catch (error) {
    console.error('识别结果解析失败', content)
    throw new Error('AI 返回内容无法解析，请重试')
  }
}
