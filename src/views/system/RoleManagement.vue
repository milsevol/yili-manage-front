<template>
    <div class="role-management">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2>角色管理</h2>
            <p>管理系统角色信息，配置角色权限和用户分配</p>
        </div>

        <!-- 搜索和操作区域 -->
        <ACard class="search-card">
            <AForm
                :model="searchForm"
                layout="inline"
                class="search-form"
            >
                <AFormItem label="角色名称">
                    <AInput
                        v-model:value="searchForm.roleName"
                        placeholder="请输入角色名称"
                        allow-clear
                        style="width: 200px"
                    />
                </AFormItem>
                <AFormItem label="角色ID">
                    <AInput
                        v-model:value="searchForm.roleId"
                        placeholder="请输入角色ID"
                        allow-clear
                        style="width: 200px"
                    />
                </AFormItem>
                <AFormItem>
                    <ASpace>
                        <AButton type="primary" @click="handleSearch">
                            <SearchOutlined />
                            搜索
                        </AButton>
                        <AButton @click="handleReset">
                            <ReloadOutlined />
                            重置
                        </AButton>
                    </ASpace>
                </AFormItem>
            </AForm>
            
            <div class="action-buttons">
                <AButton type="primary" @click="handleAdd">
                    <PlusOutlined />
                    新增角色
                </AButton>
            </div>
        </ACard>

        <!-- 角色列表 -->
        <ACard class="table-card">
            <ATable
                :columns="columns"
                :data-source="roleList"
                :loading="loading"
                :pagination="pagination"
                row-key="roleId"
                @change="handleTableChange"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'action'">
                        <ASpace>
                            <AButton 
                                type="link" 
                                size="small" 
                                @click="handleEdit(record)"
                            >
                                <EditOutlined />
                                编辑
                            </AButton>
                            <AButton 
                                type="link" 
                                size="small" 
                                @click="handleViewPermissions(record)"
                            >
                                <KeyOutlined />
                                详情
                            </AButton>
                            <APopconfirm
                                title="确定要删除这个角色吗？"
                                @confirm="handleDelete(record)"
                            >
                                <AButton 
                                    type="link" 
                                    size="small" 
                                    danger
                                >
                                    <DeleteOutlined />
                                    删除
                                </AButton>
                            </APopconfirm>
                        </ASpace>
                    </template>
                </template>
            </ATable>
        </ACard>

        <!-- 角色表单弹窗 -->
        <AModal
            v-model:open="roleModalVisible"
            :title="isEdit ? '编辑角色' : '新增角色'"
            width="600px"
            @ok="handleRoleSubmit"
            @cancel="handleRoleCancel"
        >
            <AForm
                ref="roleFormRef"
                :model="roleForm"
                :rules="roleFormRules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
            >
                <AFormItem label="角色名称" name="roleName">
                    <AInput v-model:value="roleForm.roleName" placeholder="请输入角色名称" />
                </AFormItem>
                
                <AFormItem label="角色ID" name="roleId">
                    <AInput 
                        v-model:value="roleForm.roleId" 
                        placeholder="请输入角色ID"
                        :disabled="isEdit"
                    />
                </AFormItem>
                
                <AFormItem label="创建用户ID" name="roleUserId">
                    <AInput 
                        v-model:value="roleForm.roleUserId" 
                        placeholder="请输入创建用户ID"
                    />
                </AFormItem>
                
                <AFormItem label="创建用户名" name="roleUserName">
                    <AInput 
                        v-model:value="roleForm.roleUserName" 
                        placeholder="请输入创建用户名"
                    />
                </AFormItem>
            </AForm>
        </AModal>

        <!-- 权限详情弹窗 -->
        <AModal
            v-model:open="permissionModalVisible"
            title="权限详情"
            width="800px"
            :footer="null"
        >
            <div v-if="currentRole">
                <ADescriptions :column="2" bordered>
                    <ADescriptionsItem label="角色名称">
                        {{ currentRole.roleName }}
                    </ADescriptionsItem>
                    <ADescriptionsItem label="角色ID">
                        {{ currentRole.roleId }}
                    </ADescriptionsItem>
                    <ADescriptionsItem label="创建用户">
                        {{ currentRole.roleUserName || '未知用户' }}
                    </ADescriptionsItem>
                    <ADescriptionsItem label="创建时间">
                        {{ currentRole.inserttime }}
                    </ADescriptionsItem>
                    <ADescriptionsItem label="更新时间" :span="2">
                        {{ currentRole.updatetime }}
                    </ADescriptionsItem>
                </ADescriptions>
                
                <ADivider>角色详情</ADivider>
                
                <AEmpty description="角色详情已在上方显示" />
            </div>
        </AModal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
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
        title: '创建用户',
        dataIndex: 'roleUserName',
        key: 'roleUserName',
        width: 120,
        customRender: ({ text }) => text || '未知用户'
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
    roleName: '',
    roleUserId: '',
    roleUserName: ''
});

// 表单验证规则
const roleFormRules = {
    roleName: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 50, message: '角色名称长度为2-50个字符', trigger: 'blur' }
    ]
};

// 权限详情
const permissionModalVisible = ref(false);
const currentRole = ref(null);

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
        roleName: '',
        roleUserId: '',
        roleUserName: ''
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