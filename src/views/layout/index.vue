<template>
  <div class="container">
    <van-nav-bar @click-right="$router.push('/search')" v-if="showNavBar" fixed title="黑马头条" right-text="搜索"></van-nav-bar>
    <!-- 二级路由容器 -->
    <div class="my-wrapper" :class="{ noTop: !showNavBar }">
      <!-- 如果想要缓存耳机路由组件的话，可以直接缓存二级路由容器
        如果缓存了二级路由容器，表示  这个容器下的所有组件都会被缓存
      -->
      <!-- 使用keep-alive缓存 -->
      <keep-alive>
        <router-view></router-view>
      </keep-alive>

    </div>
    <van-tabbar route>
      <!-- router-link  to  -->
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/question" icon="chat-o">问答</van-tabbar-item>
      <van-tabbar-item to="/videos" icon="video-o">视频</van-tabbar-item>
      <van-tabbar-item to="/user" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  name: 'layout',
  computed: {
    // 是否显示navbar
    showNavBar () {
      // this  指向 组件实例
      return this.$route.path !== '/user'
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  .my-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-top: 46px;
    padding-bottom: 50px;
    box-sizing: border-box;
    &.noTop {
      padding-top: 0;
    }
  }
}
</style>
