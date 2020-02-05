// 用户相关的请求模块
import request from '@/utils/request' // 引入疯转的模块
export function login (data) {
  return request({
    url: '/authorizations',
    data, // data:data 缩写
    method: 'post'
  }) //  得到一个promise对象  返回
}
/** *关注用户***/
export function followUser (data) {
  return request({
    url: '/user/followings',
    method: 'post',
    data
  })
}
/** *取消关注***/
export function unFollowUser (target) {
  return request({
    method: 'delete',
    url: `/user/followings/${target}`
  })
}
