// 用户相关的请求模块
import request from '@/utils/request' // 引入疯转的模块
export function login (data) {
  return request({
    url: '/authorizations',
    data, // data:data 缩写
    method: 'post'
  }) //  得到一个promise对象  返回
}
