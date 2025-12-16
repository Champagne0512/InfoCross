import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import type { Database } from '../../../src/types/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient<Database>(supabaseUrl, serviceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, tags, limit = 4 } = await req.json()

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(limit * 3)
      .order('created_at', { ascending: false })

    if (error) throw error

    const enriched = (data ?? []).map((article) => ({
      article,
      score: cosineSimilarity(tags ?? [], article.tags ?? []),
    }))

    const sorted = enriched.sort((a, b) => b.score - a.score).slice(0, limit)

    return new Response(
      JSON.stringify({
        userId,
        recommendations: sorted.map((item) => ({
          id: item.article.id,
          title: item.article.title,
          summary: item.article.summary,
          score: item.score,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'recommendation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function cosineSimilarity(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0.2
  const overlap = a.filter((item) => b.includes(item)).length
  return overlap / Math.sqrt(a.length * b.length)
}
