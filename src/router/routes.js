const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/self-print' },
      { path: 'self-print', component: () => import('pages/SelfPrintPage.vue') },
      { path: 'admin-query', component: () => import('pages/AdminQueryPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

