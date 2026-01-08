import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Detail from '../views/Detail.vue'
// Votes feature - hidden but preserved for teacher review
// import Votes from '../views/Votes.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/detail/:id', component: Detail },
  // Votes route - hidden but preserved for teacher review
  // { path: '/votes', component: Votes }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
