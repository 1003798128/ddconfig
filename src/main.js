import { ddInitConfig, ddInitRouter ,ddAuthentication} from '../src/ddUtil/ddInit'
const init = {
  install: function (Vue) {
    if (typeof window !== 'undefined' && window.Vue) {
      Vue = window.Vue
    }
  }
}

export default init

export { ddInitRouter, ddInitConfig, ddAuthentication }

