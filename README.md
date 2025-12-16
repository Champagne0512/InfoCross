# InfoCross · 校园跨学科信息聚合平台

InfoCross 是一个基于 Vue 3、Supabase 与 AI 能力的 Web 应用，用于聚合校园内分散的活动/讲座/竞赛信息，并通过向量检索实现“破壁”推荐。

## 🔧 技术栈

- Vue 3 + TypeScript + Vite
- Pinia 状态管理、Vue Router 分层路由
- Tailwind CSS (Nexus Design System 定制)
- Supabase（Auth、Postgres、Edge Functions、pgvector）

## 📁 目录结构

```
.
├── docs/                # PRD、UI 规范、工程结构文档
├── public/
├── src/
│   ├── api/             # Supabase 数据访问层
│   ├── assets/styles    # Tailwind + Base 样式
│   ├── components/      # common/layout/business
│   ├── composables/     # useAuth/useTheme
│   ├── router/          # routes + 守卫
│   ├── stores/          # Pinia stores
│   ├── types/           # 业务模型 + Supabase 类型
│   ├── utils/           # 日期、AI 辅助方法
│   └── views/           # auth/home/publish/profile
├── supabase/
│   ├── functions/       # analyze-article & recommend edge functions
│   ├── migrations/      # SQL 迁移（表结构 + RLS）
│   └── seed.sql         # 演示数据
└── ...
```

## 🚀 开发指南

1. 安装依赖
   ```bash
   npm install
   ```
2. 复制环境变量模板并填写 Supabase 信息
   ```bash
   cp .env.example .env.local
   ```
3. 运行本地开发服务器
   ```bash
   npm run dev
   ```
4. 代码规范
   ```bash
   npm run lint      # ESLint
   npm run format    # Prettier
   npm run typecheck # vue-tsc
   ```

## 🗄️ Supabase IaC

- 运行迁移：`supabase migration up`
- 运行 Edge Functions：`supabase functions serve analyze-article`
- 本地配置位于 `supabase/config.toml`

## 🧭 核心特性

- **AI 摘要/打标**：前端调用 `analyze-article` Edge Function 生成摘要、标签与 embedding。
- **破壁推荐**：`recommend` Edge Function 根据兴趣标签做余弦相似度排序。
- **Bento Grid UI**：遵循 Nexus Design System，黑白灰基底+酸性绿点缀，等宽字体展示时间数据。

请在答辩/演示前阅读 `docs/` 目录下的三份规范文件，确保产品、视觉与工程结构保持一致。
