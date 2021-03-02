<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDiolag('add',null)">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格 -->
            <tree-table class="tree_table" :data="cateList" :columns="columns" :border="true"
            :selection-type="false" :expand-type="false" :show-index="true"
            index-text="#">
                <!-- 是否有效 -->
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success" style="color:#00CC00;" v-if="scope.row.cat_deleted===false"></i>
                    <i class="el-icon-error" style="color:red;" v-else></i>
                </template>
                <!-- 排序 -->
                <template slot="sort" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="operation" slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="showAddCateDiolag('edit',scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="delCate(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>

        </el-card>

        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateVisible" width="50%" @close="addCateDialogClose">
            <!-- 内容主体区域 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader popper-class="cas_pop" :options="parentCateList" :props="cascaderProps" 
                    v-model="selectKeys" clearable :change-on-select="true" @change="parentCateChange"
                    :disabled="isChange">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCateSubmit">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    data(){
        return {
            // 获取商品分类的参数
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            // 商品分类数据列表
            cateList:[],
            // 总数据条数
            total:0,
            // 表格每一列的设置
            columns:[
                {
                    label: '分类名称',
                    prop: 'cat_name',
                },
                {
                    label: '是否有效',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template:'isOk'
                },
                {
                    label:'排序',
                    type: 'template',
                    template:'sort'
                },
                {
                    label:'操作',
                    type: 'template',
                    template:'operation',
                    width:'200px'
                }
            ],
            // 添加分类对话框是否显示
            addCateVisible:false,
            // 添加分类表单数据
            addCateForm:{
                // 父级分类的Id
                cat_pid:0,
                // 要添加的分类名称
                cat_name:'',
                // 分类层级，默认要添加的是一级分类
                cat_level:0
            },
            // 添加分类表单验证规则
            addCateFormRules:{
                cat_name:[
                    { required:true, message:'请输入分类名称', trigger:'blur' }
                ]
            },
            // 父级分类数据列表（一级、二级）
            parentCateList:[],
            // 指定级联选择器的配置对象
            cascaderProps:{
                expandTrigger: 'hover',
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            // 所选父级分类id的数组
            selectKeys:[],
            // 父级分类级联选择框是否可用
            isChange:false,
            // 所选分类id
            selectedId:null
        }
    },

    created(){
        this.getCateList();
    },

    methods:{
        // 获取商品分类
        async getCateList(){
            const {data:res} = await this.$http.get('categories', { params: this.queryInfo });
            if(res.meta.status !== 200) return this.$message.error('获取商品分类失败！');
            this.cateList = res.data.result;
            this.total = res.data.total;
            // console.log(res);
        },
        
        // 监听 pagesize 改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getCateList();
        },

        // 监听 page 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getCateList();
        },

        // 展示添加分类对话框
        showAddCateDiolag(status,id){
            this.getParentCateList();
            // 点击的是编辑按钮，则禁用选择父级分类选择器；反之可用
            if(status === 'edit'){
                this.isChange = true;
                this.selectedId = id;
                // 调用查询分类的方法
                this.getCateById(id);
            }else{
                this.isChange = false;
            }
            this.addCateVisible = true;
        },

        // 添加分类对话框关闭事件
        addCateDialogClose(){
            // 重置表单
            this.$refs.addCateFormRef.resetFields();
            this.addCateForm.cat_pid = 0;
            this.addCateForm.cat_level = 0;
            // 清空所选id的数组
            this.selectKeys = [];
        },

        // 获取父级分类的数据列表
        async getParentCateList(){
            const {data:res} = await this.$http.get('categories',{params:{type:2}});
            if(res.meta.status !== 200) return this.$message.error('获取父级分类失败！');
            this.parentCateList = res.data;
            // console.log(res);
        },

        // 根据id查询分类
        async getCateById(id){
            const {data:res} = await this.$http.get('categories/'+id);
            // console.log(res);
            if(res.meta.status !== 200) return this.$message.error('获取分类失败！');
            this.selectKeys = [res.data.cat_pid];
            this.addCateForm.cat_name = res.data.cat_name;
        },

        // 选择项发生变化时触发的函数
        parentCateChange(){
            /**
             * 判断 所选父级分类id数组的长度是否大于0
             * 如果大于0则证明选择了父级分类，就要把最后选中的id赋值过去
             * 反之，就说明没有选中任何父级分类
             */
            if(this.selectKeys.length > 0){
                // 获取父级分类的id
                this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
                // 设置分类层级（0为一级，1为二级，2为三级）
                this.addCateForm.cat_level = this.selectKeys.length;
            }else{
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
        },

        // 添加/编辑 分类提交
        addCateSubmit(){
            this.$refs.addCateFormRef.validate(async (valid) => {
                if(!valid) return
                // 添加分类
                if(!this.isChange){
                    const {data:res} = await this.$http.post('categories',this.addCateForm);
                    // console.log(res);
                    if(res.meta.status !== 201) return this.$message.error('添加分类失败');
                    this.$message.success('添加分类成功！');
                    this.getCateList();
                    this.addCateVisible = false;
                }else{
                    // 编辑分类
                    const {data:res} = await this.$http.put(`categories/${this.selectedId}`,{cat_name:this.addCateForm.cat_name});
                    // console.log(res);
                    if(res.meta.status !== 200) return this.$message.error('更新分类失败！');
                    this.$message.success('更新分类成功！');
                    this.getCateList();
                    this.addCateVisible = false;
                }
                
            })
        },

        // 删除分类
        async delCate(id){
            this.$confirm('是否确认删除该分类？','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                if(this.cateList.length == 1){
                    this.queryInfo.pagenum -= 1
                }
                const {data:res} = await this.$http.delete(`categories/${id}`);
                // console.log(res);
                if(res.meta.status !== 200) return this.$message.error('删除分类失败！');
                this.$message.success('删除分类成功！');
                this.getCateList();
            }).catch(() => {
                this.$message.info('已取消删除！');
            })
            
        }

    }
}
</script>

<style lang="less" scoped>
.tree_table{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>