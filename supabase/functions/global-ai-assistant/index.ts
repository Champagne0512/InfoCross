Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { systemPrompt, history } = await req.json()

    if (!systemPrompt || !history) {
      return new Response(JSON.stringify({ error: 'invalid_payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ALIYUN_DASHSCOPE_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'missing_dashscope_key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content })),
    ]

    const dashscopeResponse = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: { messages },
          parameters: { temperature: 0.6, result_format: 'message' },
        }),
      }
    )

    if (!dashscopeResponse.ok) {
      const text = await dashscopeResponse.text()
      console.error('DashScope error:', text)
      return new Response(JSON.stringify({ error: 'dashscope_error', detail: text }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const dashData = await dashscopeResponse.json()
    const reply =
      dashData?.output?.choices?.[0]?.message?.content ??
      dashData?.output?.text ??
      '抱歉，我暂时无法响应，请稍后再试。'

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: 'internal_error', detail: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
