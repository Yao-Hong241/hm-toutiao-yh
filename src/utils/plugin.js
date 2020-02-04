export default {
  // Vue.use(obj) => 会调用obj 中的install方法
  install (Vue) {
    //   插件
    Vue.prototype.$gnotify = (params) => Vue.prototype.$notify({ duration: 800, ...params }) // 小伎俩
    Vue.prototype.$sleep = sleep
  }
}
function sleep (time = 500) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => resolve(), time)
  })
}
