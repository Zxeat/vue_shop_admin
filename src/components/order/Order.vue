<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>

            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 订单列表 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
                <el-table-column label="是否付款" width="80px">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.pay_status==='0'?'danger':'success'">
                            {{scope.row.pay_status==='0'?'未付款':'已付款'}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
                <el-table-column label="下单时间" width="180px">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                    <template>
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="editAddressVisible = true"></el-button>
                        <el-button type="success" size="mini" icon="el-icon-location-outline" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
            :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20, 25, 30]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>

        </el-card>

        <!-- 修改地址的对话框 -->
        <el-dialog title="修改地址" :visible.sync="editAddressVisible" width="50%"
        @close="addressDialogClose">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item label="省/市区县" prop="address1">
                    <!-- 级联选择框 -->
                    <el-cascader :options="cityData" v-model="editForm.address1"
                    :props="addressProps">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="editForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editAddressVisible = false">取 消</el-button>
                <el-button type="primary" @click="editAddressVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
            <!-- 物流时间线 -->
            <el-timeline>
                <el-timeline-item v-for="(item, index) in progressInfo" :key="index" :timestamp="item.time">
                    {{item.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>



    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
    data(){
        return {
            // 订单列表请求数据
            queryInfo:{
                query:'',
                pagenum:1, // 当前页码
                pagesize:10, // 每页条数
            },
            // 订单列表
            orderList:[],
            // 数据总条数
            total:0,
            // 修改地址对话框是否显示
            editAddressVisible:false,
            // 修改地址表单数据
            editForm:{
                address1:[],
                address2:''
            },
            // 修改地址表单验证规则
            editFormRules:{
                address1:[{ required:true, message:'请选择地区', trigger:'blur' }],
                address2:[{ required:true, message:'请填写详细地址', trigger:'blur' }],
            },
            // 地址级联选择框的数据
            cityData,
            // 地址级联选择框的配置项
            addressProps:{
                expandTrigger: 'hover',
            },
            // 物流进度对话框是否展示
            progressVisible:false,
            // 物流信息
            progressInfo:[]

        }
    },

    created(){
        this.getOrderList();
    },

    methods:{
        // 获取订单列表
        async getOrderList(){
            const {data:res} = await this.$http.get('orders',{params:this.queryInfo});
            if(res.meta.status !== 200) return this.$message.error('订单列表获取失败！');
            // console.log(res);
            this.orderList = res.data.goods;
            this.total = res.data.total;
        },

        // 监听pagesize改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getOrderList();
        },

        // 监听页码值改变的事件
            handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getOrderList();
        },

        // 修改地址对话框的关闭事件
        addressDialogClose(){
            this.$refs.editFormRef.resetFields();
        },

        // 展示物流进度对话框
        async showProgressBox(){
            // 查询物流信息
            const {data:res} = await this.$http.get('/kuaidi/1106975712662');
            if(res.meta.status !== 200) return this.$message.error('获取物流信息失败！');
            // console.log(res);
            this.progressInfo = res.data;
            this.progressVisible = true;
        }

    }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader{
    width: 100%;
}
</style>