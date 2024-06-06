import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/index.vue'),
  },
]

const modules = import.meta.glob('../views/**/*.vue')

for (let i in modules) {
  let item = modules[i]
  const routePath = item.name.replace(/.*views/gi, '').replace(/\.vue/gi, '')
  routes.push({
    path: routePath,
    component: item,
  })
}

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
