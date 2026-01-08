import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Detail from '../views/Detail.vue'
import Votes from '../views/Votes.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/detail/:id', component: Detail },
  { path: '/votes', component: Votes }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
