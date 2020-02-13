import Vue from 'vue'
import App from './App.vue'
import router from './permission'
import store from './store'
import plugin from '@/utils/plugin' // 引入小插件
import vant, { Lazyload } from 'vant' // 引入vant组件库  引入Lazyload图片懒加载插件
import 'vant/lib/index.less' // 样式文件
import '@/styles/index.less' // 引入全局自定义样式
import 'amfe-flexible' // 引入自动配置插件
Vue.use(vant) // 一旦完成祖册  在任意地方都可以使用vant组件库
Vue.use(plugin) // 注册小插件 会调用插件中的install方法
Vue.use(Lazyload) // 注册图片懒加载
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// 在main.js中添加如下代码  此代码是采用的 5+ Runtime中的plus对象
document.addEventListener('plusready', function () {
  var webview = window.plus.webview.currentWebview()
  window.plus.key.addEventListener('backbutton', function () {
    webview.canBack(function (e) {
      if (e.canBack) {
        webview.back()
      } else {
        // webview.close(); //hide,quit
        // plus.runtime.quit();
        // 首页返回键处理
        // 处理逻辑：1秒内，连续两次按返回键，则退出应用；
        var first = null
        window.plus.key.addEventListener('backbutton', function () {
          // 首次按键，提示‘再按一次退出应用’
          if (!first) {
            first = new Date().getTime()
            setTimeout(function () {
              first = null
            }, 1000)
          } else {
            if (new Date().getTime() - first < 1500) {
              window.plus.runtime.quit()
            }
          }
        }, false)
      }
    })
  })
})
