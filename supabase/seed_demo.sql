begin;

-- 清理旧数据（仅删除以下测试数据所用记录）
delete from forum_interactions;
delete from forum_comments;
delete from forum_hot_topics;
delete from forum_threads;
delete from team_members;
delete from teams;
delete from interactions;
delete from articles;
delete from profiles
 where id in (
  '3c558daf-3b1a-4112-919c-eba6b7d34d5c', -- test1@qq.com
  '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', -- test2@qq.com
  '410d2c73-80a5-4087-8e77-61ddacbdc52d', -- test3@qq.com
  '27728f80-435b-4917-bf34-0ca65e00cd92', -- test4@qq.com
  'db0a7f58-b056-47c5-9538-52937b235da6', -- test5@qq.com
  'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', -- 1483980567@qq.com
  '1290d9c5-9a99-436f-878f-2552eee3a5c0'  -- 691408254@qq.com
 );

-- 基础档案（需提前在 auth.users 中存在对应 ID）
insert into profiles (id, email, username, college, major, tags, avatar_url)
values
  ('3c558daf-3b1a-4112-919c-eba6b7d34d5c', 'test1@qq.com', 'Focus Pioneer', '计算机学院', '人工智能', '{AI,产品,跨学科}', null),
  ('3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', 'test2@qq.com', 'Design Catalyst', '艺术学院', '交互设计', '{XR,策展,体验}', null),
  ('410d2c73-80a5-4087-8e77-61ddacbdc52d', 'test3@qq.com', 'Biz Navigator', '商学院', '金融科技', '{创业,投资,ESG}', null),
  ('27728f80-435b-4917-bf34-0ca65e00cd92', 'test4@qq.com', 'Sports Viber', '体育学院', '运动康复', '{运动,社交,健康}', null),
  ('db0a7f58-b056-47c5-9538-52937b235da6', 'test5@qq.com', 'Life Curator', '公共管理学院', '社会创新', '{公益,社区,志愿}', null),
  ('b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '1483980567@qq.com', 'Data Ranger', '统计学院', '数据科学', '{数据,可视化,政策}', null),
  ('1290d9c5-9a99-436f-878f-2552eee3a5c0', '691408254@qq.com', 'Bio Hacker', '生命科学院', '合成生物', '{SynBio,食品,实验}', null)
on conflict (id) do update set
  email = excluded.email,
  username = excluded.username,
  college = excluded.college,
  major = excluded.major,
  tags = excluded.tags;

-- 文章/活动（Focus & Vibe 混合）
insert into articles (id, author_id, title, content, summary, poster_url, category, event_time, location, tags, college, ai_score)
values
  (1101, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', 'RAG 推荐系统集训营', '四小时构建 Supabase+pgvector 推荐引擎，并输出 Demo。', 'Focus 模式旗舰活动：RAG 推荐系统集训。', '/posters/rag-lab.png', 'lecture', '2025-12-22 14:00:00+08', '信息楼 A507', '{RAG,pgvector,Vue}', '计算机学院', 0.92),
  (1102, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', 'XR 沉浸式展演志愿者', '需要视觉/舞美/引导协作者，配备 AI 实时字幕。', '跨院 XR 展演志愿者招募。', null, 'notice', '2025-12-24 19:00:00+08', '艺术中心黑盒剧场', '{XR,舞美,志愿}', '艺术学院', 0.75),
  (1103, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '绿色金融 x 数据治理沙龙', '分享 ESG 数据采集、清洗与投资应用案例。', 'ESG 数据治理沙龙', null, 'research', '2026-01-06 16:00:00+08', '商学院 S302', '{ESG,数据治理}', '商学院', 0.84),
  (1104, '27728f80-435b-4917-bf34-0ca65e00cd92', '夜跑 + 声音冥想 Vibe', '20:30 东门，Night Run & Sound Bath，限 15 人。', 'Vibe 模式：夜跑冥想搭子。', null, 'sports', '2025-12-18 20:30:00+08', '东门操场', '{夜跑,冥想,社交}', '体育学院', 0.71),
  (1105, 'db0a7f58-b056-47c5-9538-52937b235da6', '24h 公益黑客松', '聚焦社区养老/志愿服务数字化，欢迎 PM/设计/技术。', 'Focus 模式：公益黑客松。', null, 'competition', '2026-01-12 09:00:00+08', '创新工场 F3', '{公益,黑客松,社区}', '公共管理学院', 0.8),
  (1106, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '数据可视化快闪展', '展示 5 个跨院数据作品，现场点评。', 'Data Viz 快闪展', null, 'lecture', '2025-12-29 10:00:00+08', '图书馆一层大厅', '{DataViz,跨学科}', '统计学院', 0.77),
  (1107, '1290d9c5-9a99-436f-878f-2552eee3a5c0', '未来食谱实验厨房', '生命学院联合美院共同开发合成生物创意菜品。', 'SynBio 食品工作坊', null, 'research', '2026-01-03 15:00:00+08', '实验楼 B203', '{SynBio,食品创新}', '生命科学院', 0.83),
  (1108, '27728f80-435b-4917-bf34-0ca65e00cd92', '自习+奶茶拼车约伴', '今晚 7 点约图书馆 402 自习，结束一起去一食堂奶茶。', 'Vibe 模式：自习奶茶搭子。', null, 'chat', '2025-12-17 19:00:00+08', '图书馆 402', '{自习,奶茶,社交}', '体育学院', 0.6);

-- 互动
insert into interactions (user_id, article_id, type)
values
  ('3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', 1101, 'bookmark'),
  ('410d2c73-80a5-4087-8e77-61ddacbdc52d', 1101, 'join'),
  ('1290d9c5-9a99-436f-878f-2552eee3a5c0', 1105, 'bookmark'),
  ('27728f80-435b-4917-bf34-0ca65e00cd92', 1104, 'join'),
  ('db0a7f58-b056-47c5-9538-52937b235da6', 1106, 'like'),
  ('b854c855-b2c5-4712-ba61-6e5a1a17d9fc', 1107, 'bookmark');

-- 团队（Focus / Vibe 双模式）
insert into teams (id, owner_id, name, description, type, college, tags, required_skills, max_members, deadline, status, is_vibe)
values
  (2101, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', 'RAG 推荐引擎 Demo 团队', '搭建 InfoCross 向量检索推荐 MVP，需前端/算法/PM。', 'project', '计算机学院', '{RAG,推荐,Vue}', '{Vue,Python,产品}', 6, '2026-01-31', 'recruiting', false),
  (2102, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '绿色金融洞察小组', '定期分析 ESG 报告，输出可视化简报。', 'study', '商学院', '{ESG,数据}', '{数据分析,可视化}', 8, '2026-02-15', 'recruiting', false),
  (2103, '27728f80-435b-4917-bf34-0ca65e00cd92', '夜跑呼吸 Vibe 队', '每周三夜跑 + 声音冥想，活动 4 小时有效。', 'sports', '体育学院', '{夜跑,冥想}', '{领跑,摄影}', 15, null, 'recruiting', true),
  (2104, 'db0a7f58-b056-47c5-9538-52937b235da6', '社区公益黑客松筹备组', '对接 NGO 需求，设计 24h 挑战题目与导师。', 'project', '公共管理学院', '{公益,黑客松}', '{PM,运营}', 7, '2026-01-05', 'recruiting', false),
  (2105, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '即兴展演 Vibe', '晚上临时展演+约饭，限 4 小时可见。', 'meal', '艺术学院', '{XR,即兴,社交}', '{声光电,拍摄}', 10, null, 'recruiting', true);

insert into team_members (team_id, member_id, role, skills, status, is_owner)
values
  (2101, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', '架构统筹', '{架构,产品}', 'approved', true),
  (2101, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '数据可视化', '{DataViz}', 'approved', false),
  (2101, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '业务顾问', '{金融}', 'approved', false),
  (2101, '1290d9c5-9a99-436f-878f-2552eee3a5c0', '实验场景', '{SynBio}', 'approved', false),
  (2102, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '召集人', '{金融,PM}', 'approved', true),
  (2102, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '叙事设计', '{叙事,内容}', 'approved', false),
  (2102, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '数据分析', '{数据,可视化}', 'approved', false),
  (2102, 'db0a7f58-b056-47c5-9538-52937b235da6', '社会议题顾问', '{社区,公益}', 'approved', false),
  (2103, '27728f80-435b-4917-bf34-0ca65e00cd92', '召集', '{运动}', 'approved', true),
  (2103, 'db0a7f58-b056-47c5-9538-52937b235da6', '体验记录', '{摄影}', 'approved', false),
  (2103, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '声景营造', '{声光电}', 'approved', false),
  (2103, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', '心率监测', '{IoT}', 'approved', false),
  (2104, 'db0a7f58-b056-47c5-9538-52937b235da6', '项目经理', '{PM,运营}', 'approved', true),
  (2104, '1290d9c5-9a99-436f-878f-2552eee3a5c0', '食品创新导师', '{SynBio}', 'approved', false),
  (2104, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', '技术顾问', '{前端,后端}', 'approved', false),
  (2104, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', '数据度量', '{数据}', 'approved', false),
  (2105, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', '主理人', '{XR,策展}', 'approved', true),
  (2105, '27728f80-435b-4917-bf34-0ca65e00cd92', '运营', '{社交,现场}', 'approved', false),
  (2105, '410d2c73-80a5-4087-8e77-61ddacbdc52d', '赞助顾问', '{商务}', 'approved', false)
on conflict (team_id, member_id) do nothing;

-- Spectrum 论坛帖子（Signal & Depth）
insert into forum_threads (id, author_id, is_anonymous, type, category, title, content_text, summary, ai_tags, sentiment_score, read_time_minutes, view_count, like_count, comment_count, share_count, source_college)
values
  (3201, '27728f80-435b-4917-bf34-0ca65e00cd92', true, 'signal', null, null, '东门夜跑预约周三 21:00 已满，建议提前两天抢位。', '夜跑预约提示', '{夜跑,预约}', 0.35, 1, 420, 32, 6, 4, '体育学院'),
  (3202, '3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', false, 'signal', null, null, '黑盒剧场临时征灯光师，今晚排练需要支援。', '灯光支援情报', '{XR,灯光}', 0.68, 1, 310, 44, 9, 5, '艺术学院'),
  (3203, '410d2c73-80a5-4087-8e77-61ddacbdc52d', false, 'depth', 'guide', '如何把 ESG 报告转化为 5 分钟 Pitch？', '拆解绿色金融 Pitch 的结构、数据源与呈现模板。', 'ESG Pitch 指南', '{ESG,Pitch,数据}', 0.81, 8, 980, 140, 22, 15, '商学院'),
  (3204, '1290d9c5-9a99-436f-878f-2552eee3a5c0', false, 'depth', 'discussion', '合成生物+食品创新：怎样在校园试点？', '分享实验室与食堂合作的流程、监管、口味测试。', 'SynBio 食品讨论', '{SynBio,食品,实验}', 0.77, 10, 760, 68, 12, 7, '生命科学院');

insert into forum_comments (thread_id, author_id, is_anonymous, content, parent_id, like_count)
values
  (3203, '3c558daf-3b1a-4112-919c-eba6b7d34d5c', false, '能否开源你的 Pitch Deck 模板？', null, 8),
  (3203, '410d2c73-80a5-4087-8e77-61ddacbdc52d', false, '今晚上传到团队仓库一个 Notion 模板。', null, 10),
  (3204, 'b854c855-b2c5-4712-ba61-6e5a1a17d9fc', false, '数据合规要注意冷链+营养标签，统计学院可以帮忙。', null, 6),
  (3201, 'db0a7f58-b056-47c5-9538-52937b235da6', true, '可以拉一个 Vibe 群共享剩余名额。', null, 3);

insert into forum_interactions (user_id, thread_id, type)
values
  ('3e9d0a6d-b2f8-4f16-954a-49f2b6f17749', 3203, 'bookmark'),
  ('410d2c73-80a5-4087-8e77-61ddacbdc52d', 3203, 'like'),
  ('27728f80-435b-4917-bf34-0ca65e00cd92', 3202, 'share'),
  ('b854c855-b2c5-4712-ba61-6e5a1a17d9fc', 3204, 'like'),
  ('1290d9c5-9a99-436f-878f-2552eee3a5c0', 3201, 'bookmark');

insert into forum_hot_topics (title, thread_ids, heat_score, expires_at)
values
  ('夜跑与运动设施', '{3201}', 0.78, now() + interval '3 days'),
  ('XR 展演即时支援', '{3202}', 0.72, now() + interval '2 days'),
  ('ESG Pitch 工具箱', '{3203}', 0.9, now() + interval '7 days'),
  ('未来食谱实验', '{3204}', 0.82, now() + interval '5 days');

commit;
