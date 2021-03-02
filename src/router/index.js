import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/List.vue';
import AddGoods from '../components/goods/Add.vue';
import Order from '../components/order/Order.vue';
import Report from '../components/report/report.vue'

Vue.use(VueRouter)

const routes = [
  { path:'/', redirect: '/login' },
  { path:'/login', component:Login },
  { 
    path:'/home', 
    component:Home,
    redirect: '/welcome',
    children:[
      { path:'/welcome', component:Welcome },
      { path:'/users', component:Users },
      { path:'/rights', component:Rights },
      { path:'/roles', component:Roles },
      { path:'/categories', component:Cate },
      { path:'/params', component:Params },
      { path:'/goods', component:GoodsList },
      { path:'/goods/add', component:AddGoods },
      { path:'/orders', component:Order },
      { path:'/reports', component:Report },
    ]
  },
  
  //   component: () => import('../views/About.vue')
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 代表将要访问的路径
  // from 代表从哪个路径跳转而来
  /**
   * next 是一个函数，代表放行
   * 调用方式：1.直接调用 next() 表示放行
   *          2.next('要跳转到的路径') 表示强制跳转到所写的路径中
  */

  if(to.path === '/login') return next(); // 如果要访问的是登录页面，则直接放行
  const tokenStr = sessionStorage.getItem('token'); // 如果访问的不是登录页，则获取token
  if(!tokenStr) return next('/login'); // 如果没有token则代表没有权限访问，则强制跳转登录页面
  next(); // 如果有token，则可以访问就直接放行

})

export default router
