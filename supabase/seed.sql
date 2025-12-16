insert into profiles (id, email, username, college, major, tags)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'student@infocross.edu',
    'InfoCross 体验官',
    '计算机学院',
    '人工智能',
    '{AI,产品,跨学科}'
  )
on conflict (id) do nothing;

insert into articles (author_id, title, content, summary, category, event_time, location, tags, college)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'AI+文学：科幻叙事工作坊',
    '跨学院共创的叙事实验课，AI 实时提供灵感。',
    'AI 与中文系共创的叙事实验课。',
    'lecture',
    now() + interval '4 days',
    '图书馆 B1',
    '{AI写作,人文,跨学科}',
    '中文与传媒学院'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'HNSW 索引黑客松',
    '使用 Supabase + pgvector 完成推荐引擎 Demo。',
    '36 小时向量检索黑客松。',
    'competition',
    now() + interval '20 days',
    '创新工场 F3',
    '{pgvector,Hackathon,推荐系统}',
    '信息科学学院'
  )
on conflict do nothing;
