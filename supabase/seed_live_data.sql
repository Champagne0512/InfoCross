begin;

-- 丰富文章/活动，覆盖 Focus 与 Vibe 场景
insert into articles (id, author_id, title, content, summary, category, event_time, location, tags, college, ai_score)
values
  (1201, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', '多模态 AI 共创体验营', '48 小时完成语音 + 图像情报 Demo，需跑通 RAG 工作流。', 'Focus：多模态 AI 共创体验营。', 'lecture', '2026-02-02 10:00:00+08', '信息楼 A401', '{RAG,LLM,多模态}', '计算机学院', 0.91),
  (1202, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', 'XR x 声光跨夜排练', '夜间剧场开放 6 小时，需要灯光/视觉/声音三位协作。', 'Vibe：XR 跨夜排练自发活动。', 'notice', '2026-01-18 22:00:00+08', '艺术中心黑盒剧场', '{XR,灯光,声学}', '艺术学院', 0.74),
  (1203, '410d2c73-80a5-4087-8e77-61ddacbdc52d', 'ESG 数据黑客松二期', '聚焦碳账户与绿色金融，跨院队伍当场出报告。', 'Focus：ESG 数据黑客松。', 'competition', '2026-02-20 09:00:00+08', '商学院 S208', '{ESG,数据可视化,金融}', '商学院', 0.87),
  (1204, '27728f80-435b-4917-bf34-0ca65e00cd92', '逐日晨跑 + Breathwork', '06:30 操场集合，结束后共享早餐与呼吸练习。', 'Vibe：晨跑呼吸搭子。', 'sports', '2026-01-09 06:30:00+08', '西操场', '{晨跑,冥想,社交}', '体育学院', 0.69),
  (1205, 'db0a7f58-b056-47c5-9538-52937b235da6', '社区数据志愿队招募', '对接街道办，帮助清洗志愿者数据并做可视化。', 'Focus：社区数据志愿队。', 'research', '2026-02-08 14:00:00+08', '公共管理学院 403', '{公益,数据,社区}', '公共管理学院', 0.83),
  (1206, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '数据可视化深夜 Co-Working', '凌晨时段开放统计楼实验室，欢迎带项目来冲刺。', 'Vibe：深夜 Co-Working。', 'study', '2026-01-15 23:00:00+08', '统计学院 305', '{数据,CoWorking}', '统计学院', 0.72),
  (1207, '1290d9c5-9a99-436f-878f-2552eee3a5c0', '未来食谱第二季 Demo Day', 'SynBio 食品项目 Demo Day，开放试吃 + 投票。', 'Focus：未来食谱 Demo Day。', 'research', '2026-03-05 15:00:00+08', '实验楼 B210', '{SynBio,食品创新}', '生命科学院', 0.9),
  (1208, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', 'InfoCross 平台体验巡回', '校园 5 大学院巡回 Demo，欢迎报名成为体验官。', '平台体验官巡回活动。', 'lecture', '2026-01-25 10:00:00+08', '信息楼报告厅', '{InfoCross,体验,巡回}', 'InfoCross 团队', 0.78)
on conflict (id) do nothing;

insert into interactions (user_id, article_id, type)
values
  ('3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', 1201, 'bookmark'),
  ('410d2c73-80a5-4087-8e77-61ddacbdc52d', 1201, 'join'),
  ('3c558daf-3b1a-4112-919c-eba6b7d34d5c', 1202, 'like'),
  ('27728f80-435b-4917-bf34-0ca65e00cd92', 1204, 'join'),
  ('db0a7f58-b056-47c5-9538-52937b235da6', 1205, 'bookmark'),
  ('b854c855-b2c5-4712-ba61-6e5a1a17d9fc', 1206, 'bookmark'),
  ('1290d9c5-9a99-436f-878f-2552eee3a5c0', 1207, 'like')
on conflict do nothing;

-- 新增团队（Focus & Vibe 混合）
insert into teams (id, owner_id, name, description, type, college, tags, required_skills, max_members, deadline, status, is_vibe)
values
  (2301, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', '多模态信号工作坊', '打造“信号+Depth”串联的 AI 情报平台 Demo。', 'project', '计算机学院', '{RAG,LLM}', '{Vue,Python,产品}', 8, '2026-03-10', 'recruiting', false),
  (2302, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '绿色金融情报站', '每周追踪 ESG / 碳市场热点，输出双语简报。', 'study', '商学院', '{ESG,数据}', '{可视化,写作}', 10, '2026-02-28', 'recruiting', false),
  (2303, '27728f80-435b-4917-bf34-0ca65e00cd92', '露营+天文 Vibe', '周末露营 + 星空摄影 + 声景直播，活动 24h 失效。', 'sports', '体育学院', '{露营,天文,社交}', '{摄影,直播}', 18, null, 'recruiting', true),
  (2304, 'db0a7f58-b056-47c5-9538-52937b235da6', '社区数字体检小队', '与街道合作做“社区数字画像”，需要数据+调研。', 'project', '公共管理学院', '{社区,数据}', '{调研,PM,数据}', 9, '2026-04-01', 'recruiting', false),
  (2305, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '深夜胶囊放映', '午夜放映 + 即兴配乐，活动 6 小时可见。', 'meal', '艺术学院', '{放映,即兴}', '{配乐,灯光}', 12, null, 'recruiting', true)
on conflict (id) do nothing;

insert into team_members (team_id, member_id, role, skills, status, is_owner)
values
  (2301, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', '召集人', '{架构,LLM}', 'approved', true),
  (2301, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '数据工程', '{Data,可视化}', 'approved', false),
  (2301, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '业务顾问', '{金融,策略}', 'approved', false),
  (2301, 'db0a7f58-b056-47c5-9538-52937b235da6', '体验官', '{测试}', 'approved', false),
  (2302, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '研究负责人', '{ESG}', 'approved', true),
  (2302, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '信息图设计', '{可视化}', 'approved', false),
  (2302, 'db0a7f58-b056-47c5-9538-52937b235da6', '社区联络', '{社区,调研}', 'approved', false),
  (2302, '1290d9c5-9a99-436f-878f-2552eee3a5c0', '数据建模', '{SynBio,数据}', 'approved', false),
  (2303, '27728f80-435b-4917-bf34-0ca65e00cd92', '召集', '{运动}', 'approved', true),
  (2303, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', '心率监测', '{IoT}', 'approved', false),
  (2303, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '现场视觉', '{灯光,摄影}', 'approved', false),
  (2304, 'db0a7f58-b056-47c5-9538-52937b235da6', '项目经理', '{PM}', 'approved', true),
  (2304, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '数据分析', '{Python}', 'approved', false),
  (2304, '27728f80-435b-4917-bf34-0ca65e00cd92', '社区走访', '{运动,场景}', 'approved', false),
  (2304, '1290d9c5-9a99-436f-878f-2552eee3a5c0', '实验设计', '{SynBio}', 'approved', false),
  (2305, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '策展', '{XR}', 'approved', true),
  (2305, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '赞助商务', '{金融}', 'approved', false),
  (2305, 'db0a7f58-b056-47c5-9538-52937b235da6', '观众运营', '{社区}', 'approved', false)
on conflict (team_id, member_id) do nothing;

-- 任务与分配
insert into team_tasks (id, team_id, title, status, due_date, order_index, created_by)
values
  (4301, 2301, '整理校园热点数据源', 'in-progress', '2026-01-25', 1, '3c558daf-3b1a-4112-919c-eba6b7d34d5c'),
  (4302, 2301, '搭建向量检索 Demo', 'todo', '2026-02-05', 2, '3c558daf-3b1a-4112-919c-eba6b7d34d5c'),
  (4303, 2302, '撰写 ESG 双语简报 01 期', 'in-progress', '2026-01-20', 1, '410d2c73-80a5-4087-8e77-61ddacbdc52d'),
  (4304, 2304, '完成社区访谈大纲', 'todo', '2026-01-18', 1, 'db0a7f58-b056-47c5-9538-52937b235da6')
on conflict (id) do nothing;

insert into team_task_assignees (task_id, member_id, assigned_by, status)
values
  (4301, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '3c558daf-3b1a-4112-919c-eba6b7d34d5c', 'in-progress'),
  (4301, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '3c558daf-3b1a-4112-919c-eba6b7d34d5c', 'pending'),
  (4302, 'db0a7f58-b056-47c5-9538-52937b235da6', '3c558daf-3b1a-4112-919c-eba6b7d34d5c', 'pending'),
  (4303, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '410d2c73-80a5-4087-8e77-61ddacbdc52d', 'in-progress'),
  (4303, 'db0a7f58-b056-47c5-9538-52937b235da6', '410d2c73-80a5-4087-8e77-61ddacbdc52d', 'pending'),
  (4304, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', 'db0a7f58-b056-47c5-9538-52937b235da6', 'pending')
on conflict (task_id, member_id) do nothing;

-- 小组申请 & 临时对话
insert into team_applications (team_id, applicant_id, message, status, mode, extra)
values
  (2301, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '熟悉 Supabase + ECharts，希望负责可视化。', 'pending', 'focus', '{"preferred_role":"可视化工程"}'::jsonb),
  (2301, '1290d9c5-9a99-436f-878f-2552eee3a5c0', '能提供跨院实验数据，期待加入 demo 组。', 'approved', 'focus', '{"preferred_role":"数据桥接"}'::jsonb),
  (2303, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '想带移动直播设备一起露营。', 'pending', 'vibe', '{"preferred_role":"直播协作"}'::jsonb),
  (2305, '27728f80-435b-4917-bf34-0ca65e00cd92', '想帮忙做呼吸带领。', 'rejected', 'vibe', '{"preferred_role":"主持"}'::jsonb)
on conflict do nothing;

insert into team_interest_messages (team_id, sender_id, content, metadata, created_at)
values
  (
    2301,
    'b854c855-b2c5-4712-ba61-6e5a1a17d9fc',
    '我可以把情报数据做成多模态雷达图，是否还缺可视化？',
    '{"sender_role":"applicant","applicant_id":"b854c855-b2c5-4712-ba61-6e5a1a17d9fc"}'::jsonb,
    now() - interval '2 minutes'
  ),
  (
    2301,
    '3c558daf-3b1a-4112-919c-eba6b7d34d5c',
    '正好缺这个能力，晚上 9 点前给我两个 sample？',
    '{"sender_role":"owner"}'::jsonb,
    now() - interval '1 minutes'
  ),
  (
    2303,
    '410d2c73-80a5-4087-8e77-61ddacbdc52d',
    '我能自带声景直播设备和电源箱。',
    '{"sender_role":"applicant","applicant_id":"410d2c73-80a5-4087-8e77-61ddacbdc52d"}'::jsonb,
    now() - interval '5 minutes'
  ),
  (
    2303,
    '27728f80-435b-4917-bf34-0ca65e00cd92',
    '太好了！先加微信，确认露营位置。',
    '{"sender_role":"owner"}'::jsonb,
    now() - interval '4 minutes'
  )
on conflict do nothing;

-- 论坛内容
insert into forum_threads (id, author_id, is_anonymous, type, category, title, content_text, summary, ai_tags, sentiment_score, read_time_minutes, view_count, like_count, comment_count, share_count, source_college)
values
  (3401, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', false, 'signal', null, null, '深夜机房跑 LLM，避坑指南：A 楼 5 层空调不会关。', '深夜 LLM 训练情报。', '{LLM,机房}', 0.61, 1, 612, 54, 8, 6, '计算机学院'),
  (3402, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', true, 'signal', null, null, '黑盒剧场今晚临时缺灯光师，带控制台技能的快来！', '灯光支援情报。', '{XR,灯光}', 0.73, 1, 488, 72, 11, 9, '艺术学院'),
  (3403, '410d2c73-80a5-4087-8e77-61ddacbdc52d', false, 'depth', 'guide', 'ESG 双语简报写作流程公开', '分四步：情报搜集—指标对齐—双语模版—可视化发布。', 'ESG 简报写作指南。', '{ESG,写作}', 0.82, 7, 980, 156, 24, 14, '商学院'),
  (3404, '1290d9c5-9a99-436f-878f-2552eee3a5c0', false, 'depth', 'discussion', 'SynBio 食品测试在校园的伦理边界', '讨论如何与食堂合作、如何披露营养标签与冷链数据。', 'SynBio 校园实践讨论。', '{SynBio,伦理}', 0.78, 11, 640, 63, 15, 8, '生命科学院'),
  (3405, 'db0a7f58-b056-47c5-9538-52937b235da6', true, 'signal', null, null, '社区志愿数据还有 200 份纸质表需要录入，来人！', '志愿数据录入求助。', '{公益,数据}', 0.55, 1, 350, 44, 10, 5, '公共管理学院')
on conflict (id) do nothing;

insert into forum_comments (id, thread_id, author_id, is_anonymous, content, parent_id, like_count)
values
  (4501, 3403, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', false, '能否分享 Notion 模版？', null, 6),
  (4502, 3403, '410d2c73-80a5-4087-8e77-61ddacbdc52d', false, '模板今晚上传到团队仓库。', 4501, 9),
  (4503, 3404, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', false, '数据标签可以参考统计学院的食品追踪项目。', null, 5),
  (4504, 3405, '27728f80-435b-4917-bf34-0ca65e00cd92', true, '我可以带 3 名志愿者今晚去录入。', null, 4)
on conflict (id) do nothing;

insert into forum_interactions (user_id, thread_id, type)
values
  ('3c558daf-3b1a-4112-919c-eba6b7d34d5c', 3402, 'share'),
  ('3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', 3403, 'bookmark'),
  ('410d2c73-80a5-4087-8e77-61ddacbdc52d', 3401, 'like'),
  ('1290d9c5-9a99-436f-878f-2552eee3a5c0', 3404, 'bookmark'),
  ('db0a7f58-b056-47c5-9538-52937b235da6', 3405, 'share')
on conflict do nothing;

insert into forum_hot_topics (id, title, thread_ids, heat_score, expires_at)
values
  (5201, '深夜 AI 工坊', '{3401,3403}', 0.88, now() + interval '6 days'),
  (5202, 'XR 即兴演出支援', '{3402,3405}', 0.81, now() + interval '3 days'),
  (5203, 'SynBio 食品争议', '{3404}', 0.77, now() + interval '4 days')
on conflict (id) do nothing;

commit;
