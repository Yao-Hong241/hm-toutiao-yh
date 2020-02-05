<template>
  <div class="comment">
    <van-list @load="onLoad" v-model="loading" :finished="finished" finished-text="没有更多了">
      <div
        class="item van-hairline--bottom van-hairline--top"
        v-for="comment in comments"
        :key="comment.com_id.toString()"
      >
        <van-image round width="1rem" height="1rem" fit="fill" :src="comment.aut_photo" />
        <div class="info">
          <p>
            <span class="name">{{comment.aut_name}}</span>
            <span style="float:right">
              <span class="van-icon van-icon-good-job-o zan"></span>
              <span class="count">{{comment.like_count}}</span>
            </span>
          </p>
          <p>{{comment.content}}</p>
          <p>
            <span class="time">{{comment.pubdate | relTime}}</span>&nbsp;
            <van-tag plain @click="openReply(comment.com_id)">{{comment.reply_count}} 回复</van-tag>
          </p>
        </div>
      </div>
    </van-list>
    <!-- 提交模块 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="value" placeholder="写评论...">
        <van-loading v-if="submiting" slot="button" type="spinner" size="16px"></van-loading>
        <span class="submit" @click="submit" v-else slot="button">提交</span>
      </van-field>
    </div>
    <!-- 回复列表弹层 -->
    <van-action-sheet
      @closed="reply.commentId=null"
      :round="false"
      v-model="showReply"
      title="回复评论"
      class="reply_dialog"
    >
      <!-- 回复列表组件  -->
      <!-- 关闭第一次主动上拉加载 immediate-check -->
      <van-list
        @load="getReply"
        :immediate-check="false"
        v-model="reply.loading"
        :finished="reply.finished"
        finished-text="没有更多了"
      >
        <!-- 要循环的数据 -->
        <div
          class="item van-hairline--bottom van-hairline--top"
          v-for="reply in reply.list"
          :key="reply.com_id.toString()"
        >
          <van-image round width="1rem" height="1rem" fit="fill" :src="reply.aut_photo" />
          <div class="info">
            <p>
              <span class="name">{{reply.aut_name}}</span>
            </p>
            <p>{{reply.content}}</p>
            <p>
              <span class="time">{{reply.pubdate | relTime}}</span>
            </p>
          </div>
        </div>
      </van-list>
    </van-action-sheet>
  </div>

  <!-- 都不输入框 -->
</template>

<script>
import { getComments, commentOrReply } from '@/api/article' // 引入封装的获取评论方法 回复评论方法
export default {
  data () {
    return {
      // 上拉加载中
      loading: false,
      // 全部加载完毕
      finished: false,
      // 输入的内容
      value: '',
      // 控制提交中状态数据
      submiting: false,
      comments: [], // 用来存放评论列表的数据
      offset: null, // 表示分页依据 如果为空 表示从第一页开始 获取文章的评论分页依据
      showReply: false, // 控制回复列表组件的显示隐藏
      reply: {
        loading: false, // 回复列表上拉加载中
        finished: false, // 回复列表全部加载完毕
        offset: null, // 偏移量  获取评论的评论分页依据
        list: [], // 用于存放 当前弹出的关于某个评论的回复列表的数据
        commentId: null // 用来存放当前点击的id
      }
    }
  },
  methods: {
    // 提交评论的方法
    async submit () {
      if (!this.value) return false // 评论为空 返回
      this.submiting = true // 控制用户单位时间内评论的数据次数
      await this.$sleep() // 强制等待500毫秒
      try {
        const data = await commentOrReply({
          content: this.value, // 评论内容
          target: this.reply.commentId
            ? this.reply.commentId.toString()
            : this.$route.query.articleId,
          art_id: this.reply.commentId ? this.$route.query.articleId : null
        })
        // 评论成功  将数据呈现到视图上
        if (this.reply.commentId) {
          // 对评论进行评论
          this.reply.list.unshift(data.new_obj) // 将数据添加到 队首
          const comment = this.comments.find(item => item.com_id.toString() === this.reply.commentId.toString())
          comment && comment.reply_count++ // 如果找到了 就对恢复数据加1
        } else {
          // 对文章进行评论
          this.comments.unshift(data.new_obj)
        }
        // 提交后清空输入框
        this.value = ''
      } catch (error) {
        this.gnotify({ type: 'danger', message: '评论失败' })
      }
      // 最后关闭状态
      this.submiting = false
    },
    // 打开回复列表面板
    openReply (commentId) {
      this.showReply = true
      this.reply.commentId = commentId // 存储当前点击的id
      this.reply.list = [] // 清空原有的数据
      this.reply.offset = null // 重置回复的偏移量
      this.reply.finished = false // 设置为原始状态
      this.reply.loading = true // 主动打开加载状态
      // 开始加载第一页的数据
      this.getReply()
    },
    // 获取评论的评论数据
    async getReply () {
      let data = await getComments({
        type: 'c', // c代表评论的评论
        offset: this.reply.offset,
        source: this.reply.commentId.toString() // 代表获取评论的评论的id
      })
      this.reply.list.push(...data.results)
      this.reply.loading = false // 关闭评论的评论加载
      this.reply.finished = data.last_id === data.end_id // 如果当前页id等于整个评论最后一个id表示 我们已经完了所有的数据
      if (!this.reply.finished) {
        // 表示last_id 和 end_id 不等   表示还有下一页的数据
        this.reply.offset = data.last_id // 将last_id 设置为下一页的请求数据
      }
    },
    // 获取评论数据
    async onLoad () {
      // 加载评论依据
      let data = await getComments({
        type: 'a', // 获取类型
        offset: this.offset, // 偏移量
        source: this.$route.query.articleId // 获取文章Id
      })
      this.comments.push(...data.results) // 将数据添加到当前评论列表的尾部
      this.loading = false // 关闭正在上拉加载状态
      this.finished = data.last_id === data.end_id // 如果当前页id等于整个评论最后一个id表示 我们已经完了所有的数据
      if (!this.finished) {
        // 表示last_id 和 end_id 不等   表示还有下一页的数据
        this.offset = data.last_id // 将last_id 设置为下一页的请求数据
      }
    }
  }
}
</script>

<style lang='less' scoped>
.comment {
  margin-top: 10px;
  /deep/ .item {
    display: flex;
    padding: 10px 0;
    .info {
      flex: 1;
      padding-left: 10px;
      .name {
        color: #069;
      }
      .zan {
        vertical-align: middle;
        padding-right: 2px;
      }
      .count {
        vertical-align: middle;
        font-size: 10px;
        color: #666;
      }
      .time {
        color: #666;
      }
      p {
        padding: 5px 0;
        margin: 0;
      }
    }
  }
  /deep/ .van-button:active::before {
    background: transparent;
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
  .submit {
    font-size: 12px;
    color: #3296fa;
  }
}
// 回复评论组件样式
.reply_dialog {
  height: 100%;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
  .van-action-sheet__content {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 44px;
  }
}
</style>
