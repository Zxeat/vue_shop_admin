<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true" @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 商品列表 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" width="150px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="editById(scope.row.goods_id)"></el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
            :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20, 25, 30]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>


        </el-card>

    </div>
</template>

<script>
    export default {
        data(){
            return {
                // 查询参数对象
                queryInfo:{
                    // 关键字
                    query:'',
                    // 当前页码
                    pagenum:1,
                    // 每页显示条数
                    pagesize:10
                },
                // 商品列表
                goodsList:[],
                // 数据总条数
                total:0
            }
        },

        created(){
            this.getGoodsList();
        },

        methods:{
            // 根据分页获取对应的商品列表
            async getGoodsList(){
                const {data:res} = await this.$http.get('goods',{params:this.queryInfo});
                // console.log(res);
                if(res.meta.status !== 200) return this.$message.error('获取商品列表失败！');
                // this.$message.success('获取商品列表成功！');
                this.goodsList = res.data.goods;
                this.total = res.data.total;
            },

            // 监听pagesize改变的事件
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize;
                this.getGoodsList();
            },

            // 监听页码值改变的事件
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage;
                this.getGoodsList();
            },

            // 根据id删除商品
            removeById(id){
                this.$confirm('是否删除该商品?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const {data:res} = await this.$http.delete(`goods/${id}`);
                    if(res.meta.status !== 200) return this.$message.error('商品删除失败！');
                    this.$message.success('商品删除成功！');
                    this.getGoodsList();
                }).catch(() => {
                    this.$message.info('已取消删除！')
                })
            },

            // 编辑商品
            editById(id){
                this.$message.info('暂时不允许编辑商品！');
            },

            // 跳转到添加商品页面
            goAddPage(){
                // 编程式导航来跳转
                this.$router.push('/goods/add');
            }

        }
    }
</script>

<style lang="less" scoped>

</style>