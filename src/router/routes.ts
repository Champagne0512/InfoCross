import { defineAsyncComponent, type Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

function lazyView(loader: () => Promise<{ default: Component }>) {
  return defineAsyncComponent({
    loader: () => loader().then((mod) => mod.default),
    suspensible: true,
    onError(error, retry, fail, attempts) {
      if (!attempts || attempts <= 3) {
        setTimeout(() => retry(), 800)
      } else {
        console.error('[router] failed to load view', error)
        fail()
      }
    },
  })
}

export const RouteName = {
  HOME: 'home',
  AUTH: 'auth',
  PUBLISH: 'publish',
  TEAM: 'team',
  TEAM_HUB: 'team-hub',
  TEAM_DETAIL: 'team-detail',
  FORUM: 'forum',
  INBOX: 'inbox',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  BOOKMARKS: 'bookmarks',
} as const

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: RouteName.HOME,
    component: lazyView(() => import('@/views/home/HomeView.vue')),
    meta: { title: 'InfoCross · 破壁推荐流' },
  },
  {
    path: '/auth',
    name: RouteName.AUTH,
    component: lazyView(() => import('@/views/auth/AuthView.vue')),
    meta: { title: '登录 InfoCross' },
  },
  {
    path: '/publish',
    name: RouteName.PUBLISH,
    component: lazyView(() => import('@/views/publish/PublishView.vue')),
    meta: { title: '发布活动', requiresAuth: true },
  },
  {
    path: '/team',
    name: RouteName.TEAM,
    component: lazyView(() => import('@/views/team/TeamView.vue')),
    meta: { title: '发现协作', requiresAuth: true },
  },
  {
    path: '/team/hub',
    name: RouteName.TEAM_HUB,
    component: lazyView(() => import('@/views/team/TeamHubView.vue')),
    meta: { title: '协作空间', requiresAuth: true },
  },
  {
    path: '/team/:id',
    name: RouteName.TEAM_DETAIL,
    component: lazyView(() => import('@/views/team/TeamDetailView.vue')),
    meta: { title: '小组详情', requiresAuth: true },
  },
  {
    path: '/forum',
    name: RouteName.FORUM,
    component: lazyView(() => import('@/views/forum/ForumView.vue')),
    meta: { title: 'The Spectrum · 全谱论坛' },
  },
  {
    path: '/inbox',
    name: RouteName.INBOX,
    component: lazyView(() => import('@/views/inbox/InboxView.vue')),
    meta: { title: 'InfoCross · 消息中心', requiresAuth: true },
  },
  {
    path: '/profile',
    name: RouteName.PROFILE,
    component: lazyView(() => import('@/views/profile/ProfileView.vue')),
    meta: { title: '个人空间', requiresAuth: true },
  },
  {
    path: '/settings',
    name: RouteName.SETTINGS,
    component: lazyView(() => import('@/views/settings/SettingsView.vue')),
    meta: { title: '设置' },
  },
  {
    path: '/bookmarks',
    name: RouteName.BOOKMARKS,
    component: lazyView(() => import('@/views/bookmarks/BookmarksView.vue')),
    meta: { title: '我的收藏', requiresAuth: true },
  },
]
