<template>
    <div class="blog-article-management">
        <a-card class="search-card">
            <a-form layout="inline" :model="searchForm">
                <a-form-item label="标题">
                    <a-input v-model:value="searchForm.title" placeholder="请输入标题" allow-clear style="width: 220px" />
                </a-form-item>
                <a-form-item label="栏目">
                    <a-select v-model:value="searchForm.categoryId" placeholder="请选择栏目" allow-clear style="width: 200px">
                        <a-select-option v-for="c in enabledCategories" :key="c.categoryId" :value="c.categoryId">
                            {{ c.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="状态">
                    <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 180px">
                        <a-select-option value="DRAFT">草稿</a-select-option>
                        <a-select-option value="PUBLISHED">已发布</a-select-option>
                        <a-select-option value="OFFLINE">已下线</a-select-option>
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
                    新增文章
                </a-button>
            </div>
            <a-table
                :columns="columns"
                :data-source="articleList"
                :loading="loading"
                :pagination="pagination"
                row-key="articleId"
                @change="handleTableChange"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                        <a-tag :color="statusColor(record.status)">{{ statusText(record.status) }}</a-tag>
                    </template>
                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button type="link" size="small" @click="handleEdit(record)">
                                <EditOutlined />
                            </a-button>
                            <a-button v-if="record.status !== 'PUBLISHED'" type="link" size="small" @click="handlePublish(record)">
                                发布
                            </a-button>
                            <a-button v-if="record.status === 'PUBLISHED'" type="link" size="small" @click="handleOffline(record)">
                                下线
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
            :title="isEdit ? '编辑文章' : '新增文章'"
            :width="windowObj.innerWidth <= 768 ? '95%' : '900px'"
            @ok="handleSubmit"
            @cancel="handleCancel"
        >
            <a-form
                ref="formRef"
                :model="formModel"
                :rules="rules"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
            >
                <a-form-item label="栏目" name="categoryId">
                    <a-select v-model:value="formModel.categoryId" placeholder="请选择栏目">
                        <a-select-option v-for="c in enabledCategories" :key="c.categoryId" :value="c.categoryId">
                            {{ c.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="标题" name="title">
                    <a-input v-model:value="formModel.title" placeholder="请输入标题" />
                </a-form-item>
                <a-form-item label="摘要" name="summary">
                    <a-textarea v-model:value="formModel.summary" :rows="2" placeholder="请输入摘要" />
                </a-form-item>
                <a-form-item label="内容" name="content">
                    <a-textarea v-model:value="formModel.content" :rows="14" placeholder="请输入内容" />
                </a-form-item>
                <a-form-item label="备注" name="remark">
                    <a-textarea v-model:value="formModel.remark" :rows="2" placeholder="请输入备注" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { getEnabledBlogCategories } from '@/api/blogCategory.js';
import {
    createBlogArticle,
    deleteBlogArticle,
    getBlogArticleDetail,
    getBlogArticleList,
    offlineBlogArticle,
    publishBlogArticle,
    updateBlogArticle
} from '@/api/blogArticle.js';

const windowObj = window;

const searchForm = reactive({
    title: '',
    categoryId: undefined,
    status: undefined
});

const enabledCategories = ref([]);
const articleList = ref([]);
const loading = ref(false);

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`
});

const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '栏目', dataIndex: 'categoryName', key: 'categoryName', width: 180 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
    { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime', width: 180 },
    { title: '更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 180 },
    { title: '操作', key: 'action', width: 220, fixed: 'right' }
];

const statusText = (status) => {
    if (status === 'DRAFT') return '草稿';
    if (status === 'PUBLISHED') return '已发布';
    if (status === 'OFFLINE') return '已下线';
    return status || '-';
};

const statusColor = (status) => {
    if (status === 'DRAFT') return 'blue';
    if (status === 'PUBLISHED') return 'green';
    if (status === 'OFFLINE') return 'orange';
    return 'default';
};

const modalVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');
const formRef = ref();

const formModel = reactive({
    categoryId: '',
    title: '',
    summary: '',
    content: '',
    remark: ''
});

const rules = {
    categoryId: [{ required: true, message: '请选择栏目', trigger: 'change' }],
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
};

const fetchEnabledCategories = async () => {
    try {
        const res = await getEnabledBlogCategories();
        enabledCategories.value = res.data || [];
    } catch (e) {
        enabledCategories.value = [];
    }
};

const fetchList = async () => {
    loading.value = true;
    try {
        const params = {
            title: searchForm.title,
            categoryId: searchForm.categoryId,
            status: searchForm.status,
            pageNum: pagination.current,
            pageSize: pagination.pageSize
        };
        const res = await getBlogArticleList(params);
        articleList.value = res.data.list || [];
        pagination.total = res.data.total || 0;
    } catch (e) {
        message.error('获取文章列表失败');
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    pagination.current = 1;
    fetchList();
};

const handleReset = () => {
    searchForm.title = '';
    searchForm.categoryId = undefined;
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
    formModel.categoryId = '';
    formModel.title = '';
    formModel.summary = '';
    formModel.content = '';
    formModel.remark = '';
};

const handleCreate = async () => {
    isEdit.value = false;
    currentId.value = '';
    resetForm();
    if (enabledCategories.value.length === 0) {
        await fetchEnabledCategories();
    }
    modalVisible.value = true;
};

const handleEdit = async (record) => {
    isEdit.value = true;
    currentId.value = record.articleId;
    resetForm();
    if (enabledCategories.value.length === 0) {
        await fetchEnabledCategories();
    }
    try {
        const detail = await getBlogArticleDetail(record.articleId);
        formModel.categoryId = detail.data.categoryId;
        formModel.title = detail.data.title;
        formModel.summary = detail.data.summary;
        formModel.content = detail.data.content;
        formModel.remark = detail.data.remark;
        modalVisible.value = true;
    } catch (e) {
        message.error('获取文章详情失败');
    }
};

const handleSubmit = async () => {
    try {
        await formRef.value.validate();
        const payload = {
            categoryId: formModel.categoryId,
            title: formModel.title,
            summary: formModel.summary,
            content: formModel.content,
            remark: formModel.remark
        };
        if (isEdit.value) {
            await updateBlogArticle(currentId.value, payload);
            message.success('更新成功');
        } else {
            await createBlogArticle(payload);
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

const handlePublish = (record) => {
    Modal.confirm({
        title: '确认发布该文章？',
        content: `标题：${record.title}`,
        okText: '确认',
        cancelText: '取消',
        async onOk() {
            try {
                await publishBlogArticle(record.articleId);
                message.success('发布成功');
                fetchList();
            } catch (e) {
                message.error('发布失败');
            }
        }
    });
};

const handleOffline = (record) => {
    Modal.confirm({
        title: '确认下线该文章？',
        content: `标题：${record.title}`,
        okText: '确认',
        cancelText: '取消',
        async onOk() {
            try {
                await offlineBlogArticle(record.articleId);
                message.success('下线成功');
                fetchList();
            } catch (e) {
                message.error('下线失败');
            }
        }
    });
};

const confirmDelete = (record) => {
    Modal.confirm({
        title: '确认删除该文章？',
        content: `标题：${record.title}`,
        okText: '确认',
        cancelText: '取消',
        async onOk() {
            try {
                await deleteBlogArticle(record.articleId);
                message.success('删除成功');
                fetchList();
            } catch (e) {
                message.error('删除失败');
            }
        }
    });
};

onMounted(async () => {
    await fetchEnabledCategories();
    await fetchList();
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
