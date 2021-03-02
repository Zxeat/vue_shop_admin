<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>

            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="7"> 
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true" @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="usersList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="changeStatus(scope.row.id,$event)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="delUser(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>

        </el-card>

        <!-- 添加用户的对话框 -->
        <el-dialog title="添加用户" :visible.sync="addVisible" width="50%" @close="addDialogClose">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户" :visible.sync="editVisible" width="50%" @close="editDialogClose">
            <!-- 内容主体区域 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleVisible" width="50%" @close="setRoleDiolagClose">
        <div>
            <p>当前的用户：{{userInfo.username}}</p>
            <p>当前的角色：{{userInfo.role_name}}</p>
            <p>分配新角色：
                <el-select v-model="selectRoleId" placeholder="请选择">
                    <el-option v-for="item in allRoles" :key="item.id" :label="item.roleName" :value="item.id">
                    </el-option>
                </el-select>
            </p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRoleVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
        </el-dialog>
        
    </div>
</template>

<script>
export default {
    name: '',
    components: {},
    data() {
        // 验证邮箱的规则
        var checkEmail = (rule,value,callback) => {
            // 验证邮箱的正则
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
            if(regEmail.test(value)){
                // 合法的邮箱
                return callback();
            }
            callback(new Error('请输入合法的邮箱'));
        }

        // 验证手机号的规则
        var checkMobile = (rule,value,callback) => {
            // 手机号的正则
            const regMobile = /^1[3456789]\d{9}$/;
            if(regMobile.test(value)){
                // 合法的手机号
                return callback();
            }
            callback(new Error('请输入合法的手机号'));
        }

        return {
            // 获取用户列表的参数对象
            queryInfo:{
                // 搜索关键字
                query:'',
                // 当前页数
                pagenum:1,
                // 每页显示的条数 
                pagesize:2
            },
            // 用户列表
            usersList:[],
            // 总条数
            total:0,
            // 添加用户对话框的显示与隐藏
            addVisible:false,
            // 添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            // 添加表单的验证规则
            addFormRules:{
                username:[
                    { required:true, message:'请输入用户名', trigger:'blur' },
                    { min:3, max:10, message:'用户名的长度在3~10个字符之间', trigger:'blur' }
                ],
                password:[
                    { required:true, message:'请输入密码', trigger:'blur' },
                    { min:6, max:15, message:'用户名的长度在6~15个字符之间', trigger:'blur' }
                ],
                email:[
                    { required:true, message:'请输入邮箱', trigger:'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile:[
                    { required:true, message:'请输入手机号', trigger:'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 修改用户对话框显示与隐藏
            editVisible:false,
            // 修改用户的表单数据
            editForm:{},
            // 修改用户表单的验证规则
            editFormRules:{
                email:[
                    { required:true, message:'请输入邮箱', trigger:'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile:[
                    { required:true, message:'请输入手机号', trigger:'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 所有角色列表
            allRoles:[],
            // 分配角色对话框是否显示
            setRoleVisible:false,
            // 需要被分配角色的用户信息
            userInfo:{},
            // 所选角色id
            selectRoleId:null
        }
    },

    created(){
        this.getUserList();
    },

    methods:{
        // 获取用户列表
        async getUserList(){
            const {data:res} = await this.$http.get('users',{
                params:this.queryInfo
            });
            if(res.meta.status !== 200) return this.$message.error('获取用户列表失败！');
            this.usersList = res.data.users;
            this.total = res.data.total;
            // console.log(res);
        },

        // 监听pagesize改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getUserList();
        },

        // 监听页码值改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getUserList();
        },

        // 改变开关状态
        async changeStatus(id,event){
            const {data:res} = await this.$http.put(`users/${id}/state/${event}`);
            if(res.meta.status !== 200) return this.$message.error('更新用户状态失败！');
            // 提示成功
            this.$message.success('更新用户状态成功！')
            // 重新获取用户列表
            this.getUserList();
        },

        // 监听添加用户对话框的关闭事件
        addDialogClose(){
            // 重置表单
            this.$refs.addFormRef.resetFields();
        },

        // 添加用户
        addUser(){
            this.$refs.addFormRef.validate(async (valid) => {
                if(!valid) return
                // 发起添加用户的请求
                const {data:res} = await this.$http.post('users',this.addForm);
                // console.log(res);
                if(res.meta.status !== 201) return this.$message.error('添加用户失败！');
                this.$message.success('添加用户成功！');
                // 隐藏对话框
                this.addVisible = false;
                // 获取用户列表
                this.getUserList();
            })
        },

        // 监听修改用户对话框的关闭事件
        editDialogClose(){
            // 重置表单
            this.$refs.editFormRef.resetFields();
        },

        // 展示修改用户的对话框
        async showEditDialog(id){
            const {data:rs} = await this.$http.get(`users/${id}`);
            if(rs.meta.status !== 200) return this.$message.error('用户信息获取失败！');
            this.editForm = rs.data;
            this.editVisible = true;
            // console.log(rs);
        },

        // 修改用户信息提交
        editUser(){
            this.$refs.editFormRef.validate(async (valid) => {
                if(!valid) return
                const {data:res} = await this.$http.put(`users/${this.editForm.id}`,this.editForm);
                // console.log(res);
                if(res.meta.status !== 200) return this.$message.error('修改用户信息失败！');
                this.$message.success('修改用户信息成功！');
                // 隐藏对话框
                this.editVisible = false;
                // 获取列表
                this.getUserList();
            })
            
        },

        // 删除用户
        delUser(id){
            this.$confirm('是否确认删除该用户？','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                // 请求删除用户的接口并获取结果
                const {data:res} = await this.$http.delete(`users/${id}`);
                // console.log(res);
                if(res.meta.status !== 200) return this.$message.error('删除用户失败！');
                this.$message.success('删除用户成功！');
                this.getUserList();
            }).catch(() => {
                this.$message.info('已取消删除！');
            })
            
        },

        // 展示分配角色对话框
        async setRole(userInfo){
            // 获取所选择的用户信息
            this.userInfo = userInfo;
            // 获取所有角色列表
            const {data:res} = await this.$http.get('roles');
            // console.log(res);
            if(res.meta.status !== 200) return this.$message.error('获取角色列表失败！');
            this.allRoles = res.data;

            this.setRoleVisible = true;
        },

        // 分配角色
        async saveRoleInfo(){
            if(!this.selectRoleId) return this.$message.error('请选择要分配的角色！');
            const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectRoleId});
            if(res.meta.status !== 200) return this.$message.error('更新用户角色失败！');
            this.$message.success('更新用户角色成功！');
            this.getUserList();
            this.setRoleVisible = false;
        },

        // 监听关闭分配角色对话框的关闭事件
        setRoleDiolagClose(){
            this.selectRoleId = null;
            this.userInfo = {};
        }
    }
}
</script>

<style lang="less" scoped>

</style>
