<template>
    <el-container class="home_container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="" />
                <span>练习后台管理系统</span>
            </div>
            <el-button type="info" @click="signOut">退出</el-button>
        </el-header>

        <!-- 页面主体区 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse?'64px':'200px'">
                <!-- 收缩展开按钮 -->
                <div class="toggle_button" @click="toggleCollapse">|||</div>

                <!-- 侧边栏菜单区域 -->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF"
                :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :router="true"
                :default-active="activePath">
                    
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                        
                        <!-- 一级菜单的模板区 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 一级菜单文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + item2.path" v-for="item2 in item.children" :key="item2.id"
                        @click="saveNavState('/' + item2.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{item2.authName}}</span>
                            </template>
                        </el-menu-item>

                    </el-submenu>
                
                </el-menu>
            </el-aside>

            <!-- 右侧内容主体 -->
            <el-main> 
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            // 左侧菜单数据
            menuList:[],
            // 菜单列表项的图标
            iconsObj:{
                '125':'iconfont icon-users',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao',
            },
            // 是否折叠侧边栏
            isCollapse:false,
            // 被激活的链接地址
            activePath:'',
        }
    },
    created () {
        // 调用获取菜单的方法
        this.getMenuList();
        // 激活链接
        this.activePath = sessionStorage.getItem('activePath');
    },
    methods: {
        // 获取菜单
        async getMenuList(){
            let {data:res} = await this.$http.get('menus');
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg); // 请求失败，进行提示
            this.menuList = res.data; // 请求成功，赋值
        },

        // 退出
        signOut() {
            // 清空缓存
            sessionStorage.clear()
            // 跳转回登录页
            this.$router.push('/login')
        },

        // 切换侧边栏的折叠与展开
        toggleCollapse(){
            this.isCollapse = !this.isCollapse
        },

        // 保存链接的激活状态
        saveNavState(activePath){
            // 将选中的链接存入缓存中
            sessionStorage.setItem('activePath',activePath);
            // 设置选中的链接激活状态
            this.activePath = activePath;
        }

    },
}
</script>

<style lang="less" scoped>
.home_container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    color: #ffffff;
    font-size: 20px;
    > div {
        display: flex;
        align-items: center;
        span {
        margin-left: 15px;
        }
    }
}

.el-aside {
    background-color: #333744;
    .toggle_button{
        background-color: #4A5064;
        font-size: 10px;
        color: #ffffff;
        text-align: center;
        line-height: 24px;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
    .el-menu{
        border-right: none;
    }
}

.el-main {
    background-color: #eaedf1;
}

.iconfont{
    margin-right: 10px;
}
</style>
