<template>
    <div class="login_container">
        <div class="login_box">
            
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            
            <!-- 登录表单区域 -->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                
                <!-- 用户名区域 -->
                <el-form-item prop="username">
                    <el-input  prefix-icon="el-icon-user-solid" placeholder="用户名" v-model="loginForm.username"></el-input>
                </el-form-item>
                <!-- 密码区域 -->
                <el-form-item prop="password">
                    <el-input prefix-icon="el-icon-lock" type="password" placeholder="密码" v-model="loginForm.password"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
            
        </div>
    </div>
</template>

<script>
    export default {
        data(){
            return {
                // 登录表单数据
                loginForm:{
                    username:'admin',
                    password:'123456'
                },
                // 登录表单验证规则
                loginFormRules:{
                    // 验证用户名
                    username:[
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                    // 验证密码
                    password:[
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                    ]
                }
            }
        },
        methods: {
            // 点击登录，提交表单
            login(){
                this.$refs.loginFormRef.validate(async (valid) => {
                    if (!valid) return;
                    // 发送请求并获取数据
                    let {data:res} = await this.$http.post('login',this.loginForm);
                    // console.log(res);
                    // 判断是否登录成功
                    if(res.meta.status !== 200){
                        this.$message.error('登录失败！');
                    }else{
                        this.$message.success('登录成功！');
                        // 存储token
                        sessionStorage.setItem('token',res.data.token);
                        // 跳转到主页
                        this.$router.push('/home');
                    }
                });
            },

            // 点击重置，重置表单数据
            reset(){
                this.$refs.loginFormRef.resetFields();
            }
        }
    }
</script>

<style lang="less" scoped>

.login_container{
    height: 100%;
    background-color: #2b4b6b;
}

.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    
    .avatar_box{
        width: 130px;
        height: 130px;
        background-color: #fff;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        img{
           width: 100%;
           height: 100%;
           border-radius: 50%;
           background-color: #eee;
        } 
    }
}

.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns{
    display: flex;
    justify-content: flex-end;
}

</style>