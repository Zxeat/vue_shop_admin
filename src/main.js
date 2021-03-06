import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入TreeTable组件
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器插件
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入进度条的包和对应的样式
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入axios请求的包
import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置请求拦截器
axios.interceptors.request.use(config => {
  // 展示进度条
  NProgress.start();
  // 为请求头添加token验证的Authorization字段
  config.headers.Authorization = sessionStorage.getItem('token')
  // 最后必须要 return config
  return config
})
// 配置响应拦截器
axios.interceptors.response.use(config => {
  // 隐藏进度条
  NProgress.done();
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

// 注册为全局组件
Vue.component('tree-table', TreeTable)

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)


// 定义时间的过滤器
Vue.filter('dateFormat',(originVal) => {
  // 获取时间对象
  const dt = new Date(originVal);
  // 获取年月日
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 +'').padStart(2,'0');
  const d = (dt.getDate() + '').padStart(2,'0');
  // 获取时分秒
  const hh = (dt.getHours() + '').padStart(2,'0');
  const mm = (dt.getMinutes() + '').padStart(2,'0');
  const ss = (dt.getSeconds() + '').padStart(2,'0');
  
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
