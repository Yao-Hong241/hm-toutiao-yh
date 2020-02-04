import Vue from 'vue'
import App from './App.vue'
import router from './permission'
import store from './store'
import plugin from '@/utils/plugin' // 引入小插件
import vant from 'vant' // 引入vant组件库
import 'vant/lib/index.less' // 样式文件
import '@/styles/index.less' // 引入全局自定义样式
import 'amfe-flexible' // 引入自动配置插件
Vue.use(vant) // 一旦完成祖册  在任意地方都可以使用vant组件库
Vue.use(plugin) // 注册小插件 会调用插件中的install方法
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
