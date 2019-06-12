import * as dd from 'dingtalk-jsapi'
import api from '../ddUtil/ddApi'
import { getUserInfo, ddAuther } from '../ddUtil/dd'

let currentAgentId

const ddInitConfig = function () {
  window.$dd = dd
}

const ddAuthentication = function (jsApi, ddSuccess, ddError) {
  if (!(jsApi instanceof Array)) {
    console.err('jsApi not Array')
    return false
  }
  if (!(typeof ddSuccess === 'function')) {
    console.err('ddSuccess not Array')
    return false
  }
  if (!(typeof ddError === 'function')) {
    console.err('ddError not Array')
    return false
  }
  if (currentAgentId) {
    api.request({
      api: { ...ddAuther },
      params: {
        agentId: currentAgentId,
        url: location.href
      },
      success: (response) => {
        if (response) {
          window.$dd.config({
            agentId: currentAgentId, // 必填，微应用ID
            corpId: process.env.VUE_APP_CORPID, // 必填，企业ID
            timeStamp: response.timeStamp, // 必填，生成签名的时间戳
            nonceStr: response.nonceStr, // 必填，生成签名的随机串
            signature: response.signature, // 必填，签名
            type: 0, // 选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
            jsApiList: jsApi // 必填，需要使用的jsapi列表，注意：不要带dd。
          })
          ddSuccess()
          return
        }
        ddError()
      },
      error: (error) => {
        ddError(error)
      }
    })
  }
}

const ddInitRouter = function (to, from) {
  // 在路由里面写入的meta里面的title字段
  let a = JSON.parse(process.env.VUE_APP_DD_AGENTID)
  window.$dd.ready(() => {
    if (a[to.path]) {
      currentAgentId = a[to.path]
      // dd.ready参数为回调函数，在环境准备就绪时触发，jsapi的调用需要保证在该回调函数触发后调用，否则无效。
      window.$dd.runtime.permission.requestAuthCode({
        corpId: process.env.VUE_APP_CORPID,
        onSuccess: function (result) {
          api.request({
            api: { ...getUserInfo },
            params: {
              agentId: currentAgentId,
              code: result.code
            },
            success: (response) => {
              if (response) {
                console.log(response)
              }
            },
            error: (error) => {
              console.log(error.response)
            }
          })
        },
        onFail: function (error) {
          console.log(error)
        }
      })
    }

    let title = '钉钉门户中心'
    if (to.meta) {
      if (to.meta.title) {
        title= to.meta.title
      }
    }
    document.title = title
     // 设置钉钉导航栏标题 start
    window.$dd.biz.navigation.setTitle({
      title: title, // 控制标题文本，空字符串表示显示默认文本
      onSuccess: result => {},
      onFail: err => alert(err)
    })
    window.$dd.biz.navigation.setRight({
      show: false
    })

  })
}

export { ddInitRouter, ddInitConfig, ddAuthentication }
