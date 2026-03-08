import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('../layout/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' },
      },
      {
        path: 'articles',
        name: 'ArticleList',
        component: () => import('../views/ArticleList.vue'),
        meta: { title: '文章列表', icon: 'Document' },
      },
      {
        path: 'articles/create',
        name: 'ArticleCreate',
        component: () => import('../views/ArticleForm.vue'),
        meta: { title: '新建文章', icon: 'EditPen' },
      },
      {
        path: 'articles/edit/:id',
        name: 'ArticleEdit',
        component: () => import('../views/ArticleForm.vue'),
        meta: { title: '编辑文章', icon: 'EditPen' },
      },
      {
        path: 'banners',
        name: 'BannerManage',
        component: () => import('../views/BannerManage.vue'),
        meta: { title: '轮播管理', icon: 'Picture' },
      },
      {
        path: 'review',
        name: 'Review',
        component: () => import('../views/Review.vue'),
        meta: { title: '文章审核', icon: 'Checked' },
      },
      {
        path: 'forum-review',
        name: 'ForumReview',
        component: () => import('../views/ForumReview.vue'),
        meta: { title: '帖子审核', icon: 'ChatDotRound' },
      },
      {
        path: 'trash',
        name: 'Trash',
        component: () => import('../views/Trash.vue'),
        meta: { title: '回收站', icon: 'Delete' },
      },
      {
        path: 'withdrawals',
        name: 'WithdrawalManage',
        component: () => import('../views/WithdrawalManage.vue'),
        meta: { title: '提现管理', icon: 'Money' },
      },
      {
        path: 'traders',
        name: 'TraderManage',
        component: () => import('../views/TraderManage.vue'),
        meta: { title: '交易员管理', icon: 'User' },
      },
      {
        path: 'trader-applications',
        name: 'TraderApplicationReview',
        component: () => import('../views/TraderApplicationReview.vue'),
        meta: { title: '入驻审核', icon: 'UserFilled' },
      },
      {
        path: 'trader-articles',
        name: 'TraderArticleManage',
        component: () => import('../views/TraderArticleManage.vue'),
        meta: { title: '交易员文章', icon: 'Document' },
      },
      {
        path: 'trader-articles/create',
        name: 'TraderArticleCreate',
        component: () => import('../views/TraderArticleForm.vue'),
        meta: { title: '新建交易员文章', icon: 'EditPen' },
      },
      {
        path: 'trader-articles/edit/:id',
        name: 'TraderArticleEdit',
        component: () => import('../views/TraderArticleForm.vue'),
        meta: { title: '编辑交易员文章', icon: 'EditPen' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.public) return true
  const token = localStorage.getItem('cms_token')
  if (!token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
