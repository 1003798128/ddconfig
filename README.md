# 钉钉集成以及鉴权免登封装

## 安装

### NPM

```shell
npm i ddconfig -S
```

## 集成前参数设置

在.env.development和.env.production等配置文件中添加

```js
//公司ID,有且只有唯一一个
VUE_APP_CORPID=dinge093d880ac591ee135c2f4657eb6378f
//鉴权免登接口IP地址,可能此接口会独立一个项目
VUE_APP_DD_URL=http://172.16.5.190:8080
//微应用ID,用于免登和鉴权,格式如下
VUE_APP_DD_AGENTID={"/main/executionRecord/case": "267248620", "/main/scan": "266052842"}
```

## 集成步骤

### 1.在main.js中初始化ddconfig

```js
  import { ddInitConfig } from 'ddconfig'
  ddInitConfig()
```

### 2.router.js中初始化dd标题头以及获取微应用ID

```js
  import { ddInitRouter } from 'ddconfig'
  router.beforeEach((to, from, next) => {
    ddInitRouter(to, from)
    ...
  })
```

### 3.使用钉钉jsAPI中功能

无需鉴权

```js
window.$dd.ready(()={
   window.$dd.---({
     onSuccess: function (data) {
     },
     onFail: function (err) {
     }
   })
})
```

需要鉴权

```js
import { ddAuthentication } from 'ddconfig'
//获取UUID的示例，可同时添加多个以及多个ddAPI调用
 ddAuthentication(['device.base.getUUID'], () => {
      // 后面要删掉
      window.$dd.ready(() => {
        window.$dd.device.base.getUUID({
          onSuccess: function (data) {
            alert('测试使用：' + JSON.stringify(data))
          },
          onFail: function (err) {
            alert('fail: ' + JSON.stringify(err))
          }
        })
      })
    }, () => {

    })
```

## 浏览器支持

现代浏览器以及 Android 4.0+, iOS 6+.

## 开源协议

本项目基于 [MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89) 协议，请自由地享受和参与开源。
