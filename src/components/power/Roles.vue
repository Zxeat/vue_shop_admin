<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            
            <!-- 角色列表 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',index1===0?'bdtop':'','vcenter']" 
                        v-for="(item1,index1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="delPower(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级权限 -->
                            <el-col :span="19">
                                <el-row :class="[index2===0?'':'bdtop','vcenter']" v-for="(item2,index2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="delPower(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="item3 in item2.children" 
                                        :key="item3.id" closable @close="delPower(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" prop="level" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="delRole(scope.row.id)">删除</el-button>
                        <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addVisible" width="50%" @close="addDialogClose">
            <el-form :model="addRoleForm" :rules="formRules" ref="addFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="editVisible" width="50%" @close="editDialogClose">
            <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="80px">
                <el-form-item label="角色ID">
                    <el-input v-model="editForm.roleId" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoleSubmit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightVisible" width="50%" @close="serRightsDiolagClose">
            <!-- 树形控件 -->
            <el-tree :data="rightList" :props="rightsProps" node-key="id" ref="treeRef"
            :default-expand-all="true" :default-checked-keys="defKeys" show-checkbox></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            // 角色列表
            rolesList:[],
            // 添加角色对话框是否显示
            addVisible:false,
            // 添加角色的表单数据
            addRoleForm:{
                roleName:'',
                roleDesc:''
            },
            // 添加/修改 角色表单的验证规则
            formRules:{
                roleName:[
                    { required:true, message:'请输入用户名', trigger:'blur' },
                ]
            },
            // 修改角色对话框的显示与隐藏
            editVisible:false,
            // 修改角色的表单数据
            editForm:{},
            // 分配权限对话框是否显示
            setRightVisible:false,
            // 权限列表
            rightList:[],
            // 权限配置选项列表
            rightsProps:{
                label:'authName',
                children:'children'
            },
            // 默认选中的节点id值数组
            defKeys:[],
            // 所选角色的id
            roleId:''
                
        }
    },

    created(){
        this.getRolesList();
    },

    methods:{
        // 获取角色列表
        async getRolesList(){
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status !== 200) return this.$message.error('获取角色列表失败！');
            this.rolesList = res.data;
            // console.log(res);
        },

        // 添加角色提交
        addRole(){
            this.$refs.addFormRef.validate(async (valid) => {
                if(!valid) return
                const {data:res} = await this.$http.post('roles',this.addRoleForm);
                // console.log(res);
                if(res.meta.status !== 201) return this.$message.error('添加角色失败！');
                this.$message.success('添加角色成功！');
                // 隐藏对话框
                this.addVisible = false;
                // 获取用户列表
                this.getRolesList();
            })
            
        },

        // 监听添加角色对话框的关闭事件
        addDialogClose(){
            this.$refs.addFormRef.resetFields();
        },

        // 展示编辑角色对话框
        async editRole(id){
            const {data:res} = await this.$http.get(`roles/${id}`);
            if(res.meta.status !== 200) return this.$message.error('角色信息获取失败！');
            this.editForm = res.data;
            this.editVisible = true;
            // console.log(res);
        },

        // 监听添加角色对话框的关闭事件
        editDialogClose(){
            this.$refs.editFormRef.resetFields();
        },

        // 修改角色提交
        editRoleSubmit(){
            this.$refs.editFormRef.validate(async (valid) => {
                if(!valid) return
                const {data:res} = await this.$http.put(`roles/${this.editForm.roleId}`,this.editForm);
                // console.log(res);
                if(res.meta.status !== 200) return this.$message.error('修改角色信息失败！');
                this.$message.success('修改角色信息成功！');
                // 隐藏对话框
                this.editVisible = false;
                // 获取列表
                this.getRolesList();
            })
        },

        // 删除角色
        delRole(id){
            this.$confirm('是否确认删除该角色？','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const {data:res} = await this.$http.delete(`roles/${id}`);
                if(res.meta.status !== 200) return this.$message.error('删除角色失败！');
                this.$message.success('删除角色成功！');
                this.getRolesList();
            }).catch(() => {
                this.$message.info('已取消删除！');
            })
            

        },

        // 删除权限
        delPower(role,rightsId){
            this.$confirm('是否确认删除该权限？','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                // 删除角色指定权限
                const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightsId}`);
                // console.log(res);
                if(res.meta.status !== 200) return this.$message.error('删除权限失败！');
                this.$message.success('删除权限成功！');
                // 将最新数据赋值过去（这里不重新获取列表是为了使展开列不收起，增加用户体验）
                role.children = res.data;
            }).catch(() => {
                this.$message.info('已取消删除！');
            })
        },

        // 展示分配权限的对话框
        async showSetRightDialog(role){
            // 获取角色id
            this.roleId = role.id;
            // 获取所有权限列表
            const {data:res} = await this.$http.get('rights/tree');
            // console.log(res);
            if(res.meta.status !== 200) return this.$message.error('获取权限列表失败');
            this.rightList = res.data;
            // 递归获取三级节点的id
            this.getLeafKeys(role,this.defKeys);

            // 展示弹窗
            this.setRightVisible = true;
        },

        /**
         * 通过递归的形式，获取角色下所有三级权限的id,并保存到数组中
         * node为节点对象
         * arr为保存节点id的数组
         */
        getLeafKeys(node,arr){
            // 如果当前节点不包含children属性，则是三级节点
            if(!node.children){
                return arr.push(node.id);
            }
            node.children.forEach(item => this.getLeafKeys(item,arr));
        },

        // 监听分配权限对话框的关闭
        serRightsDiolagClose(){
            // 清空默认选中节点id的数组
            this.defKeys = [];
        },

        // 为角色分配权限
        async allotRights(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            // 将数组转为字符串
            const idStr = keys.join(',');
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr});
            if(res.meta.status !== 200) return this.$message.error('分配权限失败！');
            this.$message.success('分配权限成功！');
            this.getRolesList();
            this.setRightVisible = false;
            // console.log(res);
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eeeeee;
}
.bdbottom{
   border-bottom: 1px solid #eeeeee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>