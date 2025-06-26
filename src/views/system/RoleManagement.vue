<template>
    <div class="role-management">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2>角色管理</h2>
            <p>管理系统角色信息，配置角色权限和用户分配</p>
        </div>

        <!-- 搜索和操作区域 -->
        <a-card class="search-card">
            <a-form
                :model="searchForm"
                layout="inline"
                class="search-form"
            >
                <a-form-item label="角色名称">
                    <a-input
                        v-model:value="searchForm.roleName"
                        placeholder="请输入角色名称"
                        allow-clear
                        class="form-compo"
                    />
                </a-form-item>
              
                <a-form-item>
                    <a-space>
                        <a-button type="primary" @click="handleSearch">
                            <SearchOutlined />
                            搜索
                        </a-button>
                        <a-button @click="handleReset">
                            <ReloadOutlined />
                            重置
                        </a-button>
                    </a-space>
                </a-form-item>
            </a-form>
            
            <div class="action-buttons">
                <a-space>
                    <a-button type="primary" @click="handleAdd">
                        <PlusOutlined />
                        新增角色
                    </a-button>
                    <a-button 
                        type="primary" 
                        danger 
                        :disabled="!selectedRowKeys.length"
                        @click="handleBatchDelete"
                    >
                        <DeleteOutlined />
                        批量删除
                    </a-button>
                </a-space>
            </div>
        </a-card>

        <!-- 角色列表 -->
        <a-card class="table-card">
            <a-table
                :columns="columns"
                :data-source="roleList"
                :loading="loading"
                :pagination="pagination"
                :row-selection="rowSelection"
                row-key="roleId"
                @change="handleTableChange"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                        <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                            {{ record.status === 'active' ? '启用' : '禁用' }}
                        </a-tag>
                    </template>
                    
                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button 
                                type="link" 
                                size="small" 
                                @click="handleEdit(record)"
                            >
                                <EditOutlined />
                                编辑
                            </a-button>
                            <a-button 
                                type="link" 
                                size="small" 
                                @click="handlePermission(record)"
                            >
                                <SettingOutlined />
                                权限
                            </a-button>
                            <a-button 
                                type="link" 
                                size="small" 
                                danger 
                                @click="handleDelete(record)"
                            >
                                <DeleteOutlined />
                                删除
                            </a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <!-- 角色表单弹窗 -->
        <a-modal
            v-model:open="roleModalVisible"
            :title="isEdit ? '编辑角色' : '新增角色'"
            width="600px"
            @ok="handleRoleSubmit"
            @cancel="handleRoleCancel"
        >
            <a-form
                ref="roleFormRef"
                :model="roleForm"
                :rules="roleFormRules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
            >
                <a-form-item label="角色名称" name="roleName">
                    <a-input v-model:value="roleForm.roleName" placeholder="请输入角色名称" />
                </a-form-item>
                
                <a-form-item v-if="isEdit" label="角色ID" name="roleId">
                    <a-input 
                        v-model:value="roleForm.roleId" 
                        placeholder="角色ID"
                        disabled
                    />
                </a-form-item>
                

            </a-form>
        </a-modal>

        <!-- 权限详情弹窗 -->
        <a-modal
            v-model:open="permissionModalVisible"
            title="权限详情"
            width="800px"
            :footer="null"
        >
            <div v-if="currentRole">
                <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="角色名称">
                        {{ currentRole.roleName }}
                    </a-descriptions-item>
                    <a-descriptions-item label="角色ID">
                        {{ currentRole.roleId }}
                    </a-descriptions-item>
                    <a-descriptions-item label="创建用户">
                        {{ currentRole.roleUserName || '未知用户' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="创建时间">
                        {{ currentRole.inserttime }}
                    </a-descriptions-item>
                    <a-descriptions-item label="更新时间" :span="2">
                        {{ currentRole.updatetime }}
                    </a-descriptions-item>
                </a-descriptions>
                
                <a-divider>角色详情</a-divider>
                
                <a-empty description="角色详情已在上方显示" />
            </div>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    KeyOutlined
} from '@ant-design/icons-vue';
import {
    getRoleList,
    createRole,
    updateRole,
    deleteRole,
    getRoleDetail
} from '@/api/role.js';

// 搜索表单
const searchForm = reactive({
    roleName: '',
    roleId: ''
});

// 角色列表
const roleList = ref([]);
const loading = ref(false);

// 分页
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`
});

// 表格列配置
const columns = [
    {
        title: '角色名称',
        dataIndex: 'roleName',
        key: 'roleName',
        width: 150
    },
    {
        title: '角色ID',
        dataIndex: 'roleId',
        key: 'roleId',
        width: 150
    },

    {
        title: '创建时间',
        dataIndex: 'inserttime',
        key: 'inserttime',
        width: 180
    },
    {
        title: '更新时间',
        dataIndex: 'updatetime',
        key: 'updatetime',
        width: 180
    },
    {
        title: '操作',
        key: 'action',
        width: 200,
        fixed: 'right'
    }
];

// 角色表单
const roleModalVisible = ref(false);
const isEdit = ref(false);
const roleFormRef = ref();
const roleForm = reactive({
    roleId: null,
    roleName: ''
});

// 表单验证规则
const roleFormRules = {
    roleName: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 50, message: '角色名称长度为2-50个字符', trigger: 'blur' }
    ],
    roleId: [
        { required: true, message: '角色ID不能为空', trigger: 'blur' }
    ]
};

// 权限详情
const permissionModalVisible = ref(false);
const currentRole = ref(null);

// 表格行选择
const selectedRowKeys = ref([]);
const rowSelection = computed(() => ({
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys) => {
        selectedRowKeys.value = keys;
    }
}));

// 获取角色列表
const fetchRoleList = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.current,
            pageSize: pagination.pageSize,
            ...searchForm
        };
        const response = await getRoleList(params);
        roleList.value = response.data.list || [];
        pagination.total = response.data.total || 0;
    } catch (error) {
        message.error('获取角色列表失败');
    } finally {
        loading.value = false;
    }
};

// 搜索
const handleSearch = () => {
    pagination.current = 1;
    fetchRoleList();
};

// 重置
const handleReset = () => {
    Object.assign(searchForm, {
        roleName: '',
        roleId: ''
    });
    pagination.current = 1;
    fetchRoleList();
};

// 表格变化
const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchRoleList();
};

// 新增角色
const handleAdd = () => {
    isEdit.value = false;
    roleModalVisible.value = true;
    resetRoleForm();
};

// 编辑角色
const handleEdit = (record) => {
    isEdit.value = true;
    roleModalVisible.value = true;
    Object.assign(roleForm, record);
};

// 删除角色
const handleDelete = async (record) => {
    try {
        await deleteRole(record.roleId);
        message.success('删除成功');
        fetchRoleList();
    } catch (error) {
        message.error('删除失败');
    }
};

// 查看权限详情
const handleViewPermissions = async (record) => {
    try {
        const response = await getRoleDetail(record.roleId);
        currentRole.value = response.data;
        permissionModalVisible.value = true;
    } catch (error) {
        message.error('获取角色详情失败');
    }
};

// 批量删除角色
const handleBatchDelete = () => {
    if (selectedRowKeys.value.length === 0) {
        message.warning('请选择要删除的角色');
        return;
    }
    
    Modal.confirm({
        title: '确认删除',
        content: `将删除 ${selectedRowKeys.value.length} 个角色`,
        onOk: async () => {
            try {
                await Promise.all(selectedRowKeys.value.map(roleId => deleteRole(roleId)));
                message.success('批量删除成功');
                selectedRowKeys.value = [];
                fetchRoleList();
            } catch (error) {
                message.error('批量删除失败');
            }
        }
    });
};

// 角色表单提交
const handleRoleSubmit = async () => {
    try {
        await roleFormRef.value.validate();
        
        if (isEdit.value) {
            await updateRole(roleForm.roleId, roleForm);
            message.success('更新成功');
        } else {
            await createRole(roleForm);
            message.success('创建成功');
        }
        
        roleModalVisible.value = false;
        fetchRoleList();
    } catch (error) {
        if (error.errorFields) {
            message.error('请检查表单输入');
        } else {
            message.error(isEdit.value ? '更新失败' : '创建失败');
        }
    }
};

// 角色表单取消
const handleRoleCancel = () => {
    roleModalVisible.value = false;
    resetRoleForm();
};

// 重置角色表单
const resetRoleForm = () => {
    Object.assign(roleForm, {
        roleId: null,
        roleName: ''
    });
    roleFormRef.value?.resetFields();
};

onMounted(() => {
    fetchRoleList();
});
</script>

<style scoped lang="less">
.role-management {
    .page-header {
        margin-bottom: 24px;
        
        h2 {
            margin: 0 0 8px 0;
            color: #262626;
            font-size: 24px;
            font-weight: 600;
        }
        
        p {
            margin: 0;
            color: #8c8c8c;
            font-size: 14px;
        }
    }
    
    .search-card {
        margin-bottom: 16px;
        
        .search-form {
            margin-bottom: 16px;
        }
        
        .action-buttons {
            text-align: right;
        }
    }
    
    .table-card {
        :deep(.ant-table) {
            .ant-table-thead > tr > th {
                background: #fafafa;
                font-weight: 600;
            }
        }
    }
    
    .permission-card {
        height: 100%;
        
        .permission-info {
            .permission-name {
                font-weight: 600;
                color: #262626;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
            }
            
            .permission-code {
                font-size: 12px;
                color: #8c8c8c;
                margin-bottom: 4px;
                font-family: 'Courier New', monospace;
            }
            
            .permission-desc {
                font-size: 12px;
                color: #595959;
                line-height: 1.4;
            }
        }
    }
}

// 响应式处理
@media (max-width: 768px) {
    .role-management {
        .search-card {
            .search-form {
                :deep(.ant-form-item) {
                    margin-bottom: 16px;
                }
            }
            
            .action-buttons {
                text-align: left;
                margin-top: 16px;
            }
        }
    }
}
</style>