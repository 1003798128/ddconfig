import axios from 'axios'
import qs from 'qs'
import _ from 'lodash'

const EMPTY_OBJECT_STRING = '{}'

// 针对blob方式的请求，处理错误
axios.interceptors.response.use(
  response => { return response },
  error => {
    if (
      error.request.responseType === 'blob' &&
        typeof Blob !== 'undefined' &&
        error.response.data instanceof Blob &&
        error.response.data.type &&
        error.response.data.type.toLowerCase().indexOf('json') !== -1
    ) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = () => {
          error.response.data = JSON.parse(reader.result)
          resolve(Promise.reject(error))
        }

        reader.onerror = () => {
          reject(error)
        }

        reader.readAsText(error.response.data)
      })
    };

    return Promise.reject(error)
  }
)

export default {
  request: function ({ api, params, success, error, header }) {
    if (api.mock && api.mock.enable === true) {
      console.log('mock data: [app=' + api.app + ', path=' + api.path + ']')
      if (typeof success === 'function') {
        success(api.mock.data)
      }
      return
    }

    const config = {
      url: process.env.VUE_APP_BASE_URL + api.path,
      method: 'post',
      data: params,
      dataType: 'json',
      contentType: 'json',
      headers: {
        'X-Requested-With': 'XMLHttpRequest' // 标记ajax的异步请求
      },
      timeout: null,
      withCredentials: true
    }
    if (arguments.length > 2 && Object.prototype.toString.apply(arguments[arguments.length - 1]) === '[object Object]') {
      if (arguments[arguments.length - 1].headers) {
        config.headers = Object.assign(config.headers, arguments[arguments.length - 1].headers)
      } else if (arguments[arguments.length - 1].cancelToken) {
        config.cancelToken = arguments[arguments.length - 1].cancelToken
      }
    }
    if (api.method) {
      config.method = api.method
    }

    if (api.dataType) {
      config.dataType = api.dataType
    }

    if (config.dataType === 'json') {
      if (config.method === 'get') {
        config.params = params
      } else {
        config.data = params
      }
    } else {
      config.data = params
      config.transformRequest = [function (data) {
        return qs.stringify(data)
      }]
    }

    if (api.timeout) {
      config.timeout = api.timeout
    }

    if (api.contentType) {
      config.contentType = api.contentType
    }
    config.responseType = api.responseType || api.contentType
    let $http = axios(config)
    $http.then(function (response) {
      if (success) {
        let resData
        if (!response.data) {
          resData = JSON.parse(response.request.responseText)
        } else {
          resData = response.data
        }
        success(resData)
      }
    }).catch(function (exception) {
      if (error) {
        error(exception)
      } else {
        let resData = _.get(exception, 'response.data')
        if (!resData) {
          resData = JSON.parse(_.get(exception, 'request.responseText') || EMPTY_OBJECT_STRING)
        }

        let responseStatus = _.get(exception, 'response.status')
        if (exception && responseStatus) {
          switch (responseStatus) {
            case 400:
              break
            case 401:
              break
            case 500:
              break
            default:
              break
          }
        }
      }
    }).finally(() => {
    })
    return $http
  },
  syncRequest: function ({
    url,
    method = 'GET',
    data,
    successCallback = _.noop,
    failCallback = _.noop,
    options = {}
  }) {
    const xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP')
    const { headers = {}, withCredentials = true } = options
    const baseUrl = process.env.VUE_APP_BASE_URL

    xhr.withCredentials = withCredentials
    xhr.open(method, baseUrl + url, false)

    // 默认的请求头
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')

    // 设置请求头
    _.forEach(headers, (value, key) => {
      xhr.setRequestHeader(key, value)
    })

    const lowerMethod = method.toLowerCase()
    if (lowerMethod === 'get') {
      xhr.send()
    } else if (lowerMethod === 'post') {
      xhr.send(JSON.stringify(data))
    }

    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log(xhr.responseText)
        successCallback(xhr.responseText)
      } else {
        failCallback(`Error ${xhr.status}: ${xhr.statusText}`)
        console.log(`Error ${xhr.status}: ${xhr.statusText}`)
      }
    } else {
      failCallback(`Error ${xhr.status}: ${xhr.statusText}`)
      console.log(`Error ${xhr.status}: ${xhr.statusText}`)
    }
  }
}
