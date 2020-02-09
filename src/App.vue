<template>
  <div id="app">
    <div id="nav"></div>
    <!-- 将所有一级路由缓存 -->
    <keep-alive>
      <!-- 如果为true 就包在keep-alive里面 -->
      <router-view v-if="$route.meta.isAlive" />
    </keep-alive>
    <!-- 如果为false 就不包在keep-alive里面 -->
    <router-view v-if="!$route.meta.isAlive" />
  </div>
</template>

<style lang="less">
</style>
