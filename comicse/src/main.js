import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/ja'

Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

Vue.prototype.$sleep = function (time) {
  return new Promise((resolve) => {setTimeout(() => { resolve() }, time)})
},


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
