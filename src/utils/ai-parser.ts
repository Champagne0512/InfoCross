import type { AiInsight, Article } from '@/types/models'

export function buildMockInsights(article: Article): AiInsight[] {
  return [
    {
      headline: '核心洞察',
      description: article.summary,
      confidence: 0.92,
      tags: article.tags.slice(0, 3),
    },
    {
      headline: '跨学科触点',
      description: `${article.title} 与 ${article.college} 之外的同学高度相关，推荐破壁探索。`,
      confidence: 0.81,
      tags: ['CROSS-DISCIPLINE', 'AI-ASSIST'],
    },
  ]
}

export function highlightAiAction(text: string): string {
  return text.replace(/破壁/g, '破壁·探索')
}
