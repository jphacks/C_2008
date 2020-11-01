import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import * as tf from '@tensorflow/tfjs-core'
import * as facemesh from '@tensorflow-models/facemesh'
require('@tensorflow/tfjs-backend-webgl')

tf.setBackend("webgl").then(async () => {
  Vue.prototype.$facemesh = await facemesh.load()
  Vue.prototype.$config = {
    eyeWidth: 10,
    eyeHeight: 6
  }

  Vue.config.productionTip = false

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
