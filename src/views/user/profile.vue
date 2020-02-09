<template>
  <div class="container">
    <!-- 导航 -->
    <van-nav-bar left-arrow @click-left="$router.back()" title="编辑资料" right-text="保存" @click-right="saveUserInfo"></van-nav-bar>
    <van-cell-group>
      <!-- 头像 -->
      <van-cell is-link title="头像" center>
        <van-image
          @click="showPhoto=true"
          slot="default"
          width="1.5rem"
          height="1.5rem"
          fit="cover"
          round
          :src="user.photo"
        />
      </van-cell>
      <!-- 用户信息 -->
      <van-cell is-link title="名称" @click="showName=true" :value="user.name" />
      <van-cell is-link title="性别" @click="showGender=true" :value="user.gender === 0 ? '男' : '女'" />
      <van-cell is-link title="生日" @click="showDate" :value="user.birthday" />
    </van-cell-group>
    <!-- 头像弹层组件 -->
    <van-popup v-model="showPhoto" style="width:80%">
      <!-- 1.本地相册选择图片 -->
      <van-cell @click="openChangeFile" is-link title="本地相册选择图片"></van-cell>
      <!-- 2.拍照 -->
      <van-cell is-link title="拍照"></van-cell>
    </van-popup>
    <!-- 昵称弹层 -->
    <van-popup round :close-on-click-overlay="false" v-model="showName" style="width:80%">
      <van-field :error-message="nameMsg" v-model.trim="user.name" type="textarea" rows="4"></van-field>
      <van-button type="info" size="large" @click="btnName">确定</van-button>
    </van-popup>
    <!-- 性别选择弹层 -->
    <van-action-sheet @select="selectItem" :actions="actions" v-model="showGender" cancel-text="取消"></van-action-sheet>
    <!-- 生日弹层 -->
    <van-popup v-model="showBirthday" position="bottom">
      <!-- 出生日期应该是小于现在时间 -->
      <van-datetime-picker
        @cancel="showBirthday=false"
        @confirm="confirmDate"
        v-model="currentDate"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </van-popup>
    <!-- 设置一个文件上传控件 -->
    <input @change="upload" ref="myFile" type="file" name style="display:none" />
  </div>
</template>

<script>
import { mapMutations } from 'vuex' // 引入辅助函数
import dayjs from 'dayjs' // 引入dayjs插件
import { getUserProfile, updateImg, saveUserInfo } from '@/api/user' // 引入个人资料接口
export default {
  name: 'profile',
  data () {
    return {
      minDate: new Date(1900, 1, 1), // 最小时间
      maxDate: new Date(), // 最大时间 永远小于等于当前时间
      currentDate: new Date(), // 当前时间
      showBirthday: false, // 是否显示日期弹层
      showPhoto: false, // 是否显示头像弹层
      showName: false, // 是否显示昵称弹层
      showGender: false, // 是否显示性别弹层
      user: {
        name: '', // 用户名称
        gender: 0, // 0男 1女
        birthday: '' // 给一个默认生日
      },
      actions: [{ name: '男' }, { name: '女' }],
      nameMsg: ''
    }
  },
  methods: {
    ...mapMutations(['updatePhoto']), // 映射vuex中的mutations方法
    // 绑定按钮点击事件
    btnName () {
      if (this.user.name.length < 1 || this.user.name.length > 7) {
        this.nameMsg = '您的用户名称不符合长度要求'
        return false
      }
      // 如果成功
      this.nameMsg = ''
      this.showName = false
    },
    // 性别选择方法
    selectItem (item) {
      // item就是选择的对象
      this.user.gender = item.name === '男' ? 0 : 1 // 根据判断得到当前的性别
      this.showGender = false // 关闭当前的弹层
    },
    // 生日方法
    showDate () {
      this.currentDate = new Date(this.user.birthday)
      this.showBirthday = true // 显示生日弹层
    },
    // 点击生日弹层 确定 触发方法
    confirmDate (date) {
      this.user.birthday = dayjs(date).format('YYYY-MM-DD') // 转化日期赋值
      this.showBirthday = false // 关闭弹层
    },
    // 获取用户资料的方法
    async getUserProfile () {
      let data = await getUserProfile()
      this.updatePhoto({ photo: data.photo })
      // 将数据赋值给user
      this.user = data
    },
    // 点击选择图片触发 文件上传
    openChangeFile () {
      this.$refs.myFile.click() // 触发文件上传组件的方法
    },
    // 当选择图片之后触发方法
    async upload () {
      let data = new FormData()
      data.append('photo', this.$refs.myFile.files[0])
      let result = await updateImg(data)
      this.user.photo = result.photo
      this.showPhoto = false // 关闭弹层
      // 当头像上传成功之后 把图片传给 公共数据state
      this.updatePhoto({ photo: result.photo })
    },
    // 保存用户信息
    async saveUserInfo () {
      try {
        await saveUserInfo({ ...this.user, photo: null })
        this.$gnotify({ type: 'success', message: '保存成功' })
      } catch (error) {
        this.$gnotify({ type: 'danger', message: '保存失败' })
      }
    }
  },
  created () {
    // 调用获取用户资料方法
    this.getUserProfile()
  }
}
</script>

<style>
</style>
