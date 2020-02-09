<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <div class="chat-list" ref="myList">
      <div :class="{ left:item.name === 'xz',right:item.name !== 'xz'}" class="chat-item" v-for="(item,index) in list " :key="index">
        <van-image v-if="item.name === 'xz'" fit="cover" round :src="XZImg" />
        <div class="chat-pao">{{item.msg}}</div>
        <!-- 再放置一张图片 -->
        <van-image v-if="item.name !== 'xz'" fit="cover" round :src="photo" />
      </div>
      <!-- <div class="chat-item right">
        <div class="chat-pao">ewqewq</div>

      </div> -->
    </div>
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="value" placeholder="说点什么...">
        <!-- 进度条的作用  限制用户发送消息的评论 -->
        <van-loading v-if="loading" slot="button" type="spinner" size="16px"></van-loading>
        <!-- 点击发送按钮 发送消息 -->
        <span v-else @click="send()" slot="button" style="font-size:12px;color:#999">发送</span>
      </van-field>
    </div>
  </div>
</template>

<script>
import XZImg from '@/assets/images/XZImg.jpg'
import { mapState } from 'vuex' // 引入辅助函数
import io from 'socket.io-client'
export default {
  computed: {
    ...mapState(['photo', 'user']) // 映射vuex中的公共数据
  },
  data () {
    return {
      value: '', // 用来绑定用户谈话内容
      loading: false,
      XZImg, // 小智同学头像图片
      list: [] // 存放聊天内容
    }
  },
  methods: {
    // 滚动方法
    scrollBottom () {
      // 需要通过获取滚动条高度 和设置滚动条距离来滚动
      // 把当前滚动屏高度赋值给滚动条距离顶部的距离
      // $nextTick 会在上一次更新之后  并且视图完成更新之后执行
      this.$nextTick(() => {
        this.$refs.myList.scrollTop = this.$refs.myList.scrollHeight
      })
    },
    // 点击发送触发方法
    async send () {
      if (!this.value) return false // 如果为空 直接返回
      this.loading = true // 先打开加载状态
      await this.$sleep() // 默认延迟500毫秒
      // emit 发送消息
      let obj = {
        msg: this.value, // 消息内容
        timestamp: Date.now() // 当前时间戳
      }
      this.socket.emit('message', obj) // 发送消息
      this.list.push(obj) // 将刚发的消息添加到消息列表中
      this.value = '' // 发送消息之后清空输入框内容
      this.loading = false // 关闭回复加载状态
      this.scrollBottom() // 发送消息完毕调用滚动条方法
    }
  },
  created () {
    // 建立websocket和服务器的链接
    this.socket = io('http://ttapi.research.itcast.cn', {
      query: {
        token: this.user.token // 从vuex中获取token
      }
    })
    this.socket.on('connect', () => {
      console.log('建立连接成功')
      // 先让小智同学跟用户说一句话(模拟说话)
      this.list.push({ msg: '秃头小王子，你好！跟我唠唠呗', name: 'xz' })
    })
    // 需要监听小智同学的回复消息
    this.socket.on('message', data => {
      this.list.push({ ...data, name: 'xz' })
      // 接收完小智回复之后也要设置滚动条到底部
      this.scrollBottom()
    })
  },
  // 页面销毁之前钩子函数
  beforeDestroy () {
    this.socket.close() // 关闭连接
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background:#fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item{
      padding: 10px;
      .van-image{
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao{
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before{
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top:0.5px solid #c2d9ea;
          border-right:0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right{
  text-align: right;
  .chat-pao{
    margin-left: 0;
    margin-right: 15px;
    &::before{
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left{
  text-align: left;
  .chat-pao{
    margin-left: 15px;
    margin-right: 0;
    &::before{
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
