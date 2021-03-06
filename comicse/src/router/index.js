import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Calibrate from '../views/Calibrate.vue'
import Viewer from '../views/Viewer'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/calibrate',
    name: 'Calibrate',
    component: Calibrate
  },
  {
    path: '/viewer',
    name: 'Viewer',
    component: Viewer
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
