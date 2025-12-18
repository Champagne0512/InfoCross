import type { RouteRecordRaw } from 'vue-router'

export const RouteName = {
  HOME: 'home',
  AUTH: 'auth',
  PUBLISH: 'publish',
  TEAM: 'team',
  TEAM_HUB: 'team-hub',
  FORUM: 'forum',
  PROFILE: 'profile',
} as const

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: RouteName.HOME,
    component: () => import('@/views/home/HomeView.vue'),
    meta: { title: 'InfoCross · 破壁推荐流' },
  },
  {
    path: '/auth',
    name: RouteName.AUTH,
    component: () => import('@/views/auth/AuthView.vue'),
    meta: { title: '登录 InfoCross' },
  },
  {
    path: '/publish',
    name: RouteName.PUBLISH,
    component: () => import('@/views/publish/PublishView.vue'),
    meta: { title: '发布活动', requiresAuth: true },
  },
  {
    path: '/team',
    name: RouteName.TEAM,
    component: () => import('@/views/team/TeamView.vue'),
    meta: { title: '发现协作', requiresAuth: true },
  },
  {
    path: '/team/hub',
    name: RouteName.TEAM_HUB,
    component: () => import('@/views/team/TeamHubView.vue'),
    meta: { title: '协作空间', requiresAuth: true },
  },
  {
    path: '/forum',
    name: RouteName.FORUM,
    component: () => import('@/views/forum/ForumView.vue'),
    meta: { title: 'The Spectrum · 全谱论坛' },
  },
  {
    path: '/profile',
    name: RouteName.PROFILE,
    component: () => import('@/views/profile/ProfileView.vue'),
    meta: { title: '个人空间', requiresAuth: true },
  },
]
