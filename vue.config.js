module.exports = {
  // 覆盖蓝色主题
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          blue: '#3296fa'
        }
      }
    }
  },
  configureWebpack: (config) => {
    // 判断当前的环境是否是生产环境
    if (process.env.NODE_ENV === 'production') {
      // 把所有console都删除 然后打包
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  },
  publicPath: './' // 默认值 /改为./
}
