<template>
    <div class="blog-category-management">
        <a-card class="search-card">
            <a-form layout="inline" :model="searchForm">
                <a-form-item label="栏目名称">
                    <a-input v-model:value="searchForm.name" placeholder="请输入栏目名称" allow-clear style="width: 200px" />
                </a-form-item>
                <a-form-item label="状态">
                    <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 160px">
                        <a-select-option value="ENABLE">启用</a-select-option>
                        <a-select-option value="DISABLE">停用</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item>
                    <a-space>
                        <a-button type="primary" @click="handleSearch">查询</a-button>
                        <a-button @click="handleReset">重置</a-button>
                    </a-space>
                </a-form-item>
            </a-form>
        </a-card>

        <a-card class="table-card">
            <div class="table-header">
                <a-button type="primary" @click="handleCreate">
                    <PlusOutlined />
                    新增栏目
                </a-button>
            </div>
            <a-table
                :columns="columns"
                :data-source="categoryList"
                :loading="loading"
                :pagination="pagination"
                row-key="categoryId"
                @change="handleTableChange"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                        <a-tag :color="record.status === 'ENABLE' ? 'green' : 'red'">
                            {{ record.status === 'ENABLE' ? '启用' : '停用' }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button type="link" size="small" @click="handleEdit(record)">
                                <EditOutlined />
                            </a-button>
                            <a-button type="link" size="small" danger @click="confirmDelete(record)">
                                <DeleteOutlined />
                            </a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <a-modal
            v-model:open="modalVisible"
            :title="isEdit ? '编辑栏目' : '新增栏目'"
            :width="windowObj.innerWidth <= 768 ? '95%' : '600px'"
            @ok="handleSubmit"
            @cancel="handleCancel"
        >
            <a-form
                ref="formRef"
                :model="formModel"
                :rules="rules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
            >
                <a-form-item label="栏目名称" name="name">
                    <a-input v-model:value="formModel.name" placeholder="请输入栏目名称" />
                </a-form-item>
                <a-form-item label="栏目编码" name="code">
                    <a-input v-model:value="formModel.code" placeholder="请输入栏目编码" :disabled="isEdit" />
                </a-form-item>
                <a-form-item label="状态" name="status">
                    <a-select v-model:value="formModel.status" placeholder="请选择状态">
                        <a-select-option value="ENABLE">启用</a-select-option>
                        <a-select-option value="DISABLE">停用</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="排序号" name="sort">
                    <a-input-number v-model:value="formModel.sort" :min="0" style="width: 100%" />
                </a-form-item>
                <a-form-item label="备注" name="remark">
                    <a-textarea v-model:value="formModel.remark" :rows="3" placeholder="请输入备注" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { createBlogCategory, deleteBlogCategory, getBlogCategoryList, updateBlogCategory } from '@/api/blogCategory.js';

const windowObj = window;

const searchForm = reactive({
    name: '',
    status: undefined
});

const loading = ref(false);
const categoryList = ref([]);

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`
});

const columns = [
    { title: '栏目名称', dataIndex: 'name', key: 'name' },
    { title: '栏目编码', dataIndex: 'code', key: 'code', width: 140 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
    { title: '排序号', dataIndex: 'sort', key: 'sort', width: 100 },
    { title: '更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 180 },
    { title: '操作', key: 'action', width: 120, fixed: 'right' }
];

const modalVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');
const formRef = ref();

const formModel = reactive({
    name: '',
    code: '',
    status: 'ENABLE',
    sort: 0,
    remark: ''
});

const rules = {
    name: [{ required: true, message: '请输入栏目名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入栏目编码', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    sort: [{ required: true, message: '请输入排序号', trigger: 'change' }]
};

const fetchList = async () => {
    loading.value = true;
    try {
        const params = {
            name: searchForm.name,
            status: searchForm.status,
            pageNum: pagination.current,
            pageSize: pagination.pageSize
        };
        const res = await getBlogCategoryList(params);
        categoryList.value = res.data.list || [];
        pagination.total = res.data.total || 0;
    } catch (e) {
        message.error('获取栏目列表失败');
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    pagination.current = 1;
    fetchList();
};

const handleReset = () => {
    searchForm.name = '';
    searchForm.status = undefined;
    pagination.current = 1;
    fetchList();
};

const handleTableChange = (pager) => {
    pagination.current = pager.current;
    pagination.pageSize = pager.pageSize;
    fetchList();
};

const resetForm = () => {
    formModel.name = '';
    formModel.code = '';
    formModel.status = 'ENABLE';
    formModel.sort = 0;
    formModel.remark = '';
};

const handleCreate = () => {
    isEdit.value = false;
    currentId.value = '';
    resetForm();
    modalVisible.value = true;
};

const handleEdit = (record) => {
    isEdit.value = true;
    currentId.value = record.categoryId;
    formModel.name = record.name;
    formModel.code = record.code;
    formModel.status = record.status;
    formModel.sort = record.sort;
    formModel.remark = record.remark;
    modalVisible.value = true;
};

const handleSubmit = async () => {
    try {
        await formRef.value.validate();
        if (isEdit.value) {
            await updateBlogCategory(currentId.value, {
                name: formModel.name,
                status: formModel.status,
                sort: formModel.sort,
                remark: formModel.remark
            });
            message.success('更新成功');
        } else {
            await createBlogCategory({
                name: formModel.name,
                code: formModel.code,
                status: formModel.status,
                sort: formModel.sort,
                remark: formModel.remark
            });
            message.success('创建成功');
        }
        modalVisible.value = false;
        fetchList();
    } catch (e) {
        if (e && e.errorFields) {
            message.error('请检查表单输入');
        } else {
            message.error(isEdit.value ? '更新失败' : '创建失败');
        }
    }
};

const handleCancel = () => {
    modalVisible.value = false;
};

const confirmDelete = (record) => {
    Modal.confirm({
        title: '确认删除该栏目？',
        content: `栏目：${record.name}`,
        okText: '确认',
        cancelText: '取消',
        async onOk() {
            try {
                await deleteBlogCategory(record.categoryId);
                message.success('删除成功');
                fetchList();
            } catch (e) {
                message.error('删除失败');
            }
        }
    });
};

onMounted(() => {
    fetchList();
});
</script>

<style scoped>
.search-card {
    margin-bottom: 16px;
}

.table-card .table-header {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
}
</style>
