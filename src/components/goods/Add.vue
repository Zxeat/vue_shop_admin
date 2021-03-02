<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 提示 -->
            <el-alert title="添加商品信息" type="info" :closable="false" center show-icon></el-alert>
            
            <!-- 步骤条 -->
            <el-steps :space="200" :active="Number(activeIndex)" :align-center="true">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- 表单区域 -->
            <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" 
            label-position="top" label-width="100px">
                <!-- tab栏区域 -->
                <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" 
                @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="cateList" 
                            :props="cateProps" @change="cateChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的Item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <!-- 复选框区域 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="item2" v-for="(item2,index2) in item.attr_vals" 
                                :key="index2" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload :action="uploadURL" :on-preview="handlePreview" 
                        :on-remove="handleRemove" :headers="headerObj" list-type="picture"
                        :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!-- 添加商品的按钮 -->
                        <el-button class="addBtn" type="primary" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>

        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img class="previewImg" :src="previewUrl">
        </el-dialog>

    </div>
</template>

<script>
// 导入lodash插件
import _ from 'lodash'
export default {
    data() {
        return {
            // 激活的步骤条
            activeIndex:'0',
            // 添加商品的表单数据
            addForm:{
                goods_name:'',  // 名称
                goods_price:0,  // 价格
                goods_weight:0,  // 重量
                goods_number:0,  // 数量
                goods_cat:[],  // 分类
                pics:[],  // 图片
                goods_introduce:'',  // 介绍
                attrs:[], // 商品参数
            },
            // 添加商品表单的验证规则
            addFormRules:{
                goods_name:[
                    { required:true, message:'请输入商品名称', trigger:'blur' }
                ],
                goods_price:[{ required:true, message:'请输入商品价格', trigger:'blur' }],
                goods_weight:[{ required:true, message:'请输入商品重量', trigger:'blur' }],
                goods_number:[{ required:true, message:'请输入商品数量', trigger:'blur' }],
                goods_cat:[{ required:true, message:'请选择商品分类', trigger:'blur' }]
            },
            // 商品分类列表
            cateList:[],
            // 商品分类选择框配置项
            cateProps:{
                expandTrigger: 'hover',
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            // 动态参数列表数据
            manyTableData:[],
            // 商品属性列表数据
            onlyTableData:[],
            // 上传图片的地址
            uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传组件的请求头
            headerObj:{
                Authorization:sessionStorage.getItem('token')
            },
            // 图片预览对话框是否显示
            previewVisible:false,
            // 预览图片的路径
            previewUrl:''
        }
    },

    created(){
        this.getCateList();
    },

    methods:{

        // 获取商品分类
        async getCateList(){
            const {data:res} = await this.$http.get('categories');
            if(res.meta.status !== 200) this.$message.error('商品分类获取失败！');
            this.cateList = res.data
        },

        // 商品分类发生变化的事件
        cateChange(){
            // 只允许选择三级分类
            if(this.addForm.goods_cat.length !== 3){
                this.addForm.goods_cat = [];
                return
            }
            // console.log(this.addForm.goods_cat);
        },

        // 切换tabs栏之前的处理事件
        beforeTabLeave(activeName,oldActiveName){
            // 判断所处的标签页的某个内容是否填写
            if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
                this.$message.error('请先选择商品分类！')
                // 不允许切换标签
                return false
            }
        },

        // tab栏被选中时触发的事件
        async tabClicked(){
            // 访问的是商品参数面板
            if(this.activeIndex === '1'){
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}});
                if(res.meta.status !== 200) return this.$message.error('商品参数获取失败！');
                // console.log(res);
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : [];
                })
                this.manyTableData = res.data;
                // console.log(this.manyTableData);
            }
            // 访问的是商品属性面板
            else if(this.activeIndex === '2'){
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}});
                if(res.meta.status !== 200) return this.$message.error('商品属性获取失败！');
                // console.log(res);
                this.onlyTableData = res.data;
            }
        },

        // 图片预览效果
        handlePreview(file){
            // console.log(file);
            this.previewUrl = file.response.data.url;
            this.previewVisible = true;
        },

        // 移除图片的事件
        handleRemove(file){
            // 1.获取要删除的图片的临时路径
            const filePath = file.response.data.tmp_path;
            // 2.从 pics 数组中，找到这个图片对应的索引值
            const i = this.addForm.pics.findIndex(x => x.pic === filePath);
            // 3.从 pics 数组中删除这张图片
            this.addForm.pics.splice(i,1);
        },
        
        // 图片上传成功之后执行的函数
        handleSuccess(res){
            // 创建图片对象
            const picInfo = { pic:res.data.tmp_path };
            // 将图片信息对象存入 添加商品的pics数组中
            this.addForm.pics.push(picInfo);
        },

        // 添加商品
        addGoods(){
            this.$refs.addFormRef.validate(async (valid) => {
                if(!valid) return this.$message.error('请填写必要的表单项！');
                // 使用lodash的cloneDeep(obj)，对addFrom进行深拷贝
                const form = _.cloneDeep(this.addForm);
                // 将商品分类转成字符串
                form.goods_cat = form.goods_cat.join(','); 
                // 处理动态参数
                this.manyTableData.forEach(item => {
                    const newInfo = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals.join(' ')
                    };
                    this.addForm.attrs.push(newInfo);
                });
                // 处理静态属性
                this.onlyTableData.forEach(item => {
                    const newInfo = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals
                    };
                    this.addForm.attrs.push(newInfo);
                });
                // 将addForm的attrs赋值给深拷贝出来的form
                form.attrs = this.addForm.attrs;
                // 发起请求添加商品
                const {data:res} = await this.$http.post('goods',form);
                if(res.meta.status !== 201) return this.$message.error('添加商品失败！');
                this.$message.success('商品添加成功！');
                // 返回列表页
                this.$router.push('/goods');
            })
        }

    },

    computed:{
        // 获取分类id
        cateId(){
            if(this.addForm.goods_cat.length === 3){
                return this.addForm.goods_cat[2];
            }
            return null
        }
    }
}
</script>

<style lang="less" scoped>
    .el-checkbox{
        margin: 0 10px 0 0 !important;
    }
    .previewImg{
        width: 100%;
    }
    .addBtn{
        margin-top: 15px;
    }
</style>
