import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalyzePayload {
  title: string
  content: string
  tags?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    const payload = (await req.json()) as AnalyzePayload

    if (!payload.title) {
      return new Response(JSON.stringify({ error: 'title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const summary =
      payload.content?.slice(0, 120) ??
      'AI 暂未生成摘要。请提供更完整的活动内容。'

    const keywords = payload.tags ?? extractKeywords(payload.content ?? payload.title)

    const embedding = summary.split('').slice(0, 16).map((char, index) => char.charCodeAt(0) / (index + 1))

    const body = {
      summary,
      tags: keywords,
      embedding,
    }

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'failed to analyze article' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function extractKeywords(content: string): string[] {
  return Array.from(
    new Set(
      content
        .replace(/[\n\r]/g, ' ')
        .split(' ')
        .filter((word) => word.length > 1)
        .slice(0, 4),
    ),
  )
}
