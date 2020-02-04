<template>
  <div class="container">
    <van-tabs v-model="activeIndex" swipeable>
      <van-tab :title="channel.name" v-for="channel in channels" :key="channel.id">
        <!-- 因为一个tab标签 对应一个article-list组件 -->
        <ArticleList @showAction="openMoreAction" :channel_id="channel.id"></ArticleList>
      </van-tab>
    </van-tabs>
    <span class="bar_btn" @click="showChannelEdit=true">
      <van-icon name="wap-nav" />
    </span>
    <!-- 放置弹层组件 -->
    <van-popup :style="{ width: '80%' }" v-model="showMoreAction">
      <more-action
        @dislike="dislikeOrReport($event,'dislike')"
        @report="dislikeOrReport($event,'report')"
      ></more-action>
    </van-popup>
    <!-- 放置编辑频道组件 -->
    <van-action-sheet :round="false" title="编辑频道" v-model="showChannelEdit">
      <channel-edit
        @addChannel="addChannel"
        @delChannel="delChannel"
        :activeIndex="activeIndex"
        @selectChannel="selectChannel"
        :channels="channels">
      </channel-edit>
    </van-action-sheet>
    <channel-edit v-model="showChannelEdit"></channel-edit>
  </div>
</template>

<script>
import ArticleList from './components/article-list'
import { getMyChannels, delChannel, addChannel } from '@/api/channels'
import MoreAction from './components/more-action'
import { disLikeArticle, reportArticle } from '@/api/article'
import eventBus from '@/utils/eventBus'
import ChannelEdit from './components/channel-edit'
export default {
  name: 'home', // devtools查看组件时  可以看到 对应的name名称
  data () {
    return {
      activeIndex: 0, // 默认启动第0 个标签
      channels: [], // 频道需要的数据
      showMoreAction: false, // 控制反馈组件显示隐藏
      articleId: null, // 定义一个值接收文章ID
      showChannelEdit: false // 控制编辑频道弹框
    }
  },
  components: {
    ArticleList, // 注册组件
    MoreAction,
    ChannelEdit
  },
  methods: {
    // 添加频道
    async addChannel (channel) {
      await addChannel(channel)
      this.channels.push(channel)
    },
    // 删除频道的方法
    async delChannel (id) {
      try {
        await delChannel(id) // 表示删除数据成功
        // 要移除自身data中channels中的数据
        let index = this.channels.findIndex(item => item.id === id) // 找到删除的索引
        if (index <= this.activeIndex) {
          // 如果删除的频道在当前激活频道之前或者就是当前激活频道
          // 要把我们的激活索引往前挪一位
          this.activeIndex = this.activeIndex - 1
        }
        if (index > -1) {
          //  如果大于-1
          this.channels.splice(index, 1) // 移除当前频道
        }
      } catch (error) {
        this.$gnotify({ type: 'danger', message: '删除频道失败' })
      }
    },
    // 切换到对应的频道 关闭弹层
    selectChannel (id) {
      let index = this.channels.findIndex(item => item.id === id) // 获取切换频道的索引
      this.activeIndex = index // 将tabs激活标签切换到对应的标签下
      this.showChannelEdit = false // 关闭弹层
    },
    async getMyChannels () {
      let data = await getMyChannels()
      this.channels = data.channels // 更新原来的channels
    },
    // 调用弹层的方法
    openMoreAction (artId) {
      this.showMoreAction = true
      this.articleId = artId
    },
    // 不喜欢文章或者举报文章
    async dislikeOrReport (params, operatetype) {
      try {
        if (this.articleId) {
          operatetype === 'dislike'
            ? await disLikeArticle({
              target: this.articleId
            })
            : await reportArticle({
              target: this.articleId,
              type: params
            })
          this.$gnotify({ type: 'success', message: '操作成功' })
          eventBus.$emit(
            'delArticle',
            this.articleId,
            this.channels[this.activeIndex].id
          )
          this.showMoreAction = false
        }
      } catch (error) {
        this.$gnotify({ type: 'danger', message: '操作失败' })
      }
    }
  },
  created () {
    this.getMyChannels()
  }
}
</script>

<style lang="less" scoped>
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
  }
}
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}
// 编辑频道组件的样式
.van-action-sheet {
  max-height: 100%;
  height: 100%;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
}
</style>
