import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vant from 'vant' // 引入vant组件库
import 'vant/lib/index.css' // 样式文件
Vue.use(vant) // 一旦完成祖册  在任意地方都可以使用vant组件库
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
