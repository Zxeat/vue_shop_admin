<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <!-- 提示区域 -->
            <el-alert :title="tips" type="warning" show-icon :closable="false"></el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cate_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 商品分类的级联选择框 -->
                    <el-cascader popper-class="cas_pop" :options="cateList" :props="cateProps" 
                    v-model="selectedCateKeys" @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- tabs标签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" :disabled="isBtnDisabled" @click="addCate">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <!-- 展开行tag标签区域 -->
                            <template slot-scope="scope">
                                <el-tag :key="index" v-for="(item,index) in scope.row.attr_vals" :disable-transitions="false" 
                                @close="handleClose(index,scope.row)" closable>
                                    {{item}}
                                </el-tag>
                                <!-- 输入的文本框 -->
                                <el-input class="new_tag_input" ref="saveTagInput" size="small" v-model="scope.row.tagInputValue" @keyup.enter.native="handleInputConfirm(scope.row)" 
                                @blur="handleInputConfirm(scope.row)" v-if="scope.row.tagInputVisible"></el-input>
                                <!-- 添加tag的按钮 -->
                                <el-button size="small" @click="showTagInput(scope.row)" v-else>+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="delAttr(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" :disabled="isBtnDisabled" @click="addCate">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <!-- 展开行tag标签区域 -->
                            <template slot-scope="scope">
                                <el-tag :key="index" v-for="(item,index) in scope.row.attr_vals" :disable-transitions="false" 
                                @close="handleClose(index,scope.row)" closable>
                                    {{item}}
                                </el-tag>
                                <!-- 输入的文本框 -->
                                <el-input class="new_tag_input" ref="saveTagInput" size="small" v-model="scope.row.tagInputValue" @keyup.enter.native="handleInputConfirm(scope.row)" 
                                @blur="handleInputConfirm(scope.row)" v-if="scope.row.tagInputVisible"></el-input>
                                <!-- 添加tag的按钮 -->
                                <el-button size="small" @click="showTagInput(scope.row)" v-else>+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit"  @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="delAttr(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数、属性的对话框 -->
        <el-dialog :title="'添加'+titleTxt" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleTxt" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addFormSubmit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑参数、属性的对话框 -->
        <el-dialog :title="'修改'+titleTxt" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleTxt" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editFormSubmit">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    data(){
        return {
            tips:'注意：只允许为第三级分类设置相关参数！',
            // 商品分类列表
            cateList:[],
            // 级联选择框的配置对象
            cateProps:{
                expandTrigger: 'hover',
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            // 所选择的分类id数组
            selectedCateKeys:[],
            // 被激活的tabs标签的名称
            activeName:'many',
            // 动态参数的表格数据
            manyTableData:[],
            // 静态属性的表格数据
            onlyTableData:[],
            // 添加参数的对话框是否显示
            addDialogVisible:false,
            // 添加参数的表单数据对象
            addForm:{
                attr_name:''
            },
            // 添加表单的验证规则
            addFormRules:{
                attr_name:[{ required:true, message:'请输入参数名称', trigger:'blur' }]
            },
            // 编辑参数的对话框是否显示
            editDialogVisible:false,
            // 编辑参数的表单数据对象
            editForm:{
                attr_name:''
            },
            // 编辑表单的验证规则
            editFormRules:{
                attr_name:[{ required:true, message:'请输入参数名称', trigger:'blur' }]
            },
            // 所选参数的id
            attrId:null,
        }
    },

    created(){
        this.getCateList();
    },

    methods:{
        // 获取所有的商品分类
        async getCateList(){
            const {data:res} = await this.$http.get('categories');
            if(res.meta.status !== 200) return this.$message.error('获取商品分类失败！');
            this.cateList = res.data;
        },

        // 监听级联选择框数据的变化
        handleChange(){
            this.getCateInfo();
        },

        // 获取分类数据
        async getCateInfo(){
            // 证明选中的不是三级分类
            if(this.selectedCateKeys.length !== 3){
                // 清空所选参数的数组
                this.selectedCateKeys = [];
                this.manyTableData = [];
                this.onlyTableData = [];
                return
            }
            // 证明选中的是三级分类，获取分类参数
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}});
            if(res.meta.status !== 200) return this.$message.error('分类参数获取失败！');
            
            
            res.data.forEach(item => {
                // 将attr_vals字段转为数组
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                // 控制文本框的显示与隐藏
                item.tagInputVisible = false;
                // 文本框中输入的值
                item.tagInputValue = '';
            })
            
            // console.log(res);
            
            // 判断获取的数据属于哪个tab标签
            if(this.activeName === 'many'){
                this.manyTableData = res.data
            }else{
                this.onlyTableData = res.data
            }
        },

        // tab标签点击事件的处理函数
        handleTabClick(){
            this.getCateInfo();
        },

        // 展示添加对话框
        addCate(){
            this.addDialogVisible = true;
        },

        // 监听天机对话框关闭的事件
        addDialogClose(){
            this.$refs.addFormRef.resetFields();
        },

        // 添加对话框的表单提交
        addFormSubmit(){
            this.$refs.addFormRef.validate(async (valid) => {
                if(!valid) return
                const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
                    attr_name:this.addForm.attr_name,
                    attr_sel:this.activeName
                });
                // console.log(res);
                if(res.meta.status !== 201) return this.$message.error('添加参数失败！');
                this.$message.success('添加参数成功！');
                this.addDialogVisible = false;
                this.getCateInfo();
            })
        },

        // 展示编辑参数的对话框
        async showEditDialog(id){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{params:{attr_sel:this.activeName}});
            // console.log(res);
            if(res.meta.status !== 200) return this.$message.error('获取参数失败！');
            this.editForm.attr_name = res.data.attr_name;
            this.attrId = res.data.attr_id;
            this.editDialogVisible = true;
        },

        // 监听编辑参数对话框关闭的事件
        editDialogClose(){
            this.$refs.editFormRef.resetFields();
        },

        // 编辑参数对话框的表单提交
        editFormSubmit(){
            this.$refs.editFormRef.validate(async (valid) => {
                if(!valid) return
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.attrId}`,{
                    attr_name:this.editForm.attr_name,
                    attr_sel:this.activeName
                })
                // console.log(res);
                if(res.meta.status !== 200) return this.$message.error('修改参数失败！');
                this.$message.success('修改参数成功！');
                this.editDialogVisible = false;
                this.getCateInfo();
            })
            
        },

        // 删除参数
        async delAttr(id){
            this.$confirm('是否确认删除该参数？','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`);
                if(res.meta.status !== 200) return this.$message.error('删除参数失败！');
                this.$message.success('删除参数成功！');
                this.getCateInfo();
            }).catch(() => {
                this.$message.info('已取消删除！');
            })
        },

        // 展示tag输入框
        showTagInput(row){
            row.tagInputVisible = true;
            // 使文本框自动获得焦点
            /**
             * $nextTick方法的作用：
             *      当页面上元素被重新渲染之后，才会指定回调函数中的代码
             */
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },

        // 文本框失去焦点或按下enter键 触发的事件
        async handleInputConfirm(row){
            // 判断输入的值是否为空（去除空格）
            if(row.tagInputValue.trim().length === 0){
                row.tagInputValue = '';
                row.tagInputVisible = false;
                return
            }
            // 输入值合法，进行添加参数操作
            row.attr_vals.push(row.tagInputValue.trim());
            row.tagInputValue = '';
            row.tagInputVisible = false;
            // 发起请求
            this.saveAttrVals(row);
            
        },

        // 删除所选参数
        handleClose(index,row){
            row.attr_vals.splice(index,1);
            this.saveAttrVals(row);
        },

        // 参数项的修改
        async saveAttrVals(obj){
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${obj.attr_id}`,{
                attr_name:obj.attr_name,
                attr_sel:obj.attr_sel,
                attr_vals:obj.attr_vals.join(' ')
            })
            if(res.meta.status !== 200) return this.$message.error('修改参数项失败！');
            this.$message.success('修改参数项成功！');
        }
    },

    computed:{
        // 按钮是否禁用的属性
        isBtnDisabled(){
            if(this.selectedCateKeys.length === 0){
                return true;
            }else{
                return false;
            }
        },

        // 当前选中的三级分类id
        cateId(){
            if(this.selectedCateKeys.length === 3){
                return this.selectedCateKeys[2];
            }
            return null;
        },

        // 对话框标题
        titleTxt(){
            if(this.activeName === 'many'){
                return '动态参数'
            }else{
                return '静态属性'
            }
        }
    }
}
</script>

<style lang="less" scoped>
    .cate_opt{
        margin: 15px 0;
    }
    .el-tag{
        margin: 5px;
    }
    .new_tag_input{
        width: 100px;
    }
</style>