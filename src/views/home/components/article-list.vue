<template>
  <!-- 这里注意 这个div设置了滚动条 目的是 给后面做 阅读记忆 留下伏笔 -->
  <!-- 阅读记忆 => 看文章看到一半 滑到中部 去了别的页面 当你回来时 文章还在你看的位置 -->
  <div ref="myScroll" class="scroll-wrapper" @scroll="remember">
    <van-pull-refresh v-model="downLoading" @refresh="onRefresh" :success-text="refreshSuccessText">
      <van-list v-model="upLoading" :finished="finished" finished-text="没有了" @load="onLoad">
        <van-cell :to="`/article?articleId=${article.art_id.toString()}`" v-for="article in articles" :key="article.art_id.toString()">
          <div class="article_item">
            <h3 class="van-ellipsis">{{ article.title }}</h3>
            <!-- 三图 -->
            <div class="img_box" v-if="article.cover.type === 3">
              <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[0]" />
              <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[1]" />
              <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[2]" />
            </div>
            <!-- 单图 -->
            <div class="img_box" v-if="article.cover.type === 1">
              <van-image lazy-load class="w100" fit="cover" :src="article.cover.images[0]" />
            </div>
            <div class="info_box">
              <span>{{ article.aut_name }}</span>
              <span>{{ article.comm_count }}评论</span>
              <span>{{ article.pubdate | relTime }}</span>
              <span
                class="close"
                v-if="user.token"
                @click.stop="$emit('showAction',article.art_id.toString())"
              >
                <van-icon name="cross"></van-icon>
              </span>
            </div>
          </div>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import eventBus from '@/utils/eventBus'
export default {
  name: 'article-list',
  data () {
    return {
      downLoading: false, // 是否开启下拉刷新
      upLoading: false, // 是否加载数据
      finished: false, // 加载是否完成
      articles: [], // 定义一个数组
      refreshSuccessText: '更新成功',
      timestamp: null, // 定义一个时间戳
      scrollTop: 0 // 滚动条距离顶部的高度
    }
  },
  computed: {
    ...mapState(['user'])
  },
  props: {
    channel_id: {
      required: true,
      type: Number,
      default: null
    }
  },
  created () {
    // 开启监听 删除文章事件
    eventBus.$on('delArticle', (articleId, channelId) => {
      if (this.channel_id === channelId) {
        // 这个条件表示 该列表就是当前激活的列表
        let index = this.articles.findIndex(
          item => item.art_id.toString() === articleId
        ) // 查找对应的文章
        // 如果index大于 -1 表示找到了 就要删除
        if (index > -1) {
          this.articles.splice(index, 1) // 删除不喜欢的文章
        }
      }
    })
    eventBus.$on('changeTab', id => {
      // 判断一下id是否等于当前id
      if (id === this.channel_id) {
        // this.$nextTick 会在数据响应式之后 页面渲染完毕之后执行
        this.$nextTick(() => {
          // 判断是否存在滚动条
          if (this.scrollTop && this.$refs.myScroll) {
            this.$refs.myScroll.scrollTop = this.scrollTop
          }
        })
      }
    })
  },
  methods: {
    // 记录位置的方法
    // 当绑定事件只写 方法名时  第一个参数就是event 事件对象参数
    remember (event) {
      // 记录滚动条距离顶部的高度
      this.scrollTop = event.target.scrollTop
    },
    // 上拉加载
    async onLoad () {
      await this.$sleep()
      // // 加载方法
      // setTimeout(() => {
      //   if (this.articles.length === 50) {
      //     // 停止追加
      //     this.finished = true
      //   } else {
      //     let arr = Array.from(
      //       Array(10),
      //       (value, index) => index + this.articles.length + 1
      //     )
      //     this.articles.push(...arr) // 把生成的数据追加到末尾
      //     this.upLoading = false // 关闭状态
      //   }
      // }, 1000)
      let data = await getArticles({
        channel_id: this.channel_id,
        timestamp: this.timestamp || Date.now()
      })
      // 追加数据到队尾
      this.articles.push(...data.results)
      // 关闭加载状态
      this.upLoading = false
      if (data.pre_timestamp) {
        // 如果有
        this.timestamp = data.pre_timestamp
      } else {
        this.finished = true // 没有数据了
      }
    },
    // 下拉刷新方法
    async onRefresh () {
      await this.$sleep()
      // 触发下拉刷新
      // console.log('下拉刷新')
      // setTimeout(() => {
      //   let arr = Array.from(Array(10), (value, index) => '追加' + (index + 1))
      //   this.articles.unshift(...arr) // 将数据添加到队首
      //   this.downLoading = false // 关掉下拉状态
      //   this.refreshSuccessText = `更新了${arr.length}条数据`
      // }, 1000)
      // 下拉刷新永远拉取的是最新的数据
      const data = await getArticles({
        channel_id: this.channel_id,
        timestamp: Date.now()
      })
      this.downLoading = false // 关掉下拉状态
      // 有可能 最新没有推荐数据
      if (data.results.length) {
        // 如果长度大于0 表示有数据
        this.articles = data.results // 将历史数据全都覆盖掉了
        // 假如你之前 已经将 上拉加载设置成finished设置成true了
        // 表示 我们还需要继续往下拉 就需要把原来的状态再次打开
        this.finished = false
        // 注意我们依然需要获取此次的历史事件戳
        this.timestamp = data.pre_timestamp // 赋值历史时间戳 因为当你下拉刷新之后 上拉加载的时候 要用到这个历史事件戳
        this.refreshSuccessText = `更新了${data.results.length}条数据`
      } else {
        //  如果没有数据更新  什么都不需要变化
        this.refreshSuccessText = '已是最新数据'
      }
    }
  },
  // 激活函数，当组件被keep-alive包裹 组件下的组件有同样的效果
  activated () {
    if (this.scrollTop && this.$refs.myScroll) {
      this.$refs.myScroll.scrollTop = this.scrollTop // 将记录的位置赋值给dom元素
    }
  }
}
</script>

<style lang="less" scoped>
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
