<template>
    <div class="user-management">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2>用户管理</h2>
            <p>管理系统用户信息，包括用户的创建、编辑、删除和权限分配</p>
        </div>

        <!-- 搜索和操作区域 -->
        <ACard class="search-card">
            <AForm
                :model="searchForm"
                layout="inline"
                class="search-form"
            >
                <AFormItem label="用户名">
                    <AInput
                        v-model:value="searchForm.userName"
                        placeholder="请输入用户名"
                        allow-clear
                        style="width: 200px"
                    />
                </AFormItem>
                <AFormItem label="真实姓名">
                    <AInput
                        v-model:value="searchForm.userRealName"
                        placeholder="请输入真实姓名"
                        allow-clear
                        style="width: 200px"
                    />
                </AFormItem>
                <AFormItem label="用户类型">
                    <ASelect
                        v-model:value="searchForm.userType"
                        placeholder="请选择用户类型"
                        allow-clear
                        style="width: 120px"
                    >
                        <ASelectOption value="OTHER">普通用户</ASelectOption>
                        <ASelectOption value="ADMIN">管理员</ASelectOption>
                    </ASelect>
                </AFormItem>
                <AFormItem label="部门">
                    <AInput
                        v-model:value="searchForm.userDepartment"
                        placeholder="请输入部门"
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
                <ASpace>
                    <AButton type="primary" @click="handleAdd">
                        <PlusOutlined />
                        新增用户
                    </AButton>
                    <AButton 
                        type="primary" 
                        danger 
                        :disabled="!selectedRowKeys.length"
                        @click="handleBatchDelete"
                    >
                        <DeleteOutlined />
                        批量删除
                    </AButton>
                </ASpace>
            </div>
        </ACard>

        <!-- 用户列表 -->
        <ACard class="table-card">
            <ATable
                :columns="columns"
                :data-source="userList"
                :loading="loading"
                :pagination="pagination"
                :row-selection="rowSelection"
                row-key="userId"
                @change="handleTableChange"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'avatar'">
                        <AAvatar :src="record.avatar" :size="40">
                            {{ record.userName?.charAt(0)?.toUpperCase() }}
                        </AAvatar>
                    </template>
                    
                    <template v-else-if="column.key === 'userDepartment'">
                        <span>{{ record.userDepartment || '-' }}</span>
                    </template>
                    
                    <template v-else-if="column.key === 'roles'">
                        <ATag
                            v-for="role in record.roles"
                            :key="role.id"
                            color="blue"
                        >
                            {{ role.name }}
                        </ATag>
                    </template>
                    
                    <template v-else-if="column.key === 'action'">
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
                                @click="handleAssignRole(record)"
                            >
                                <TeamOutlined />
                                分配角色
                            </AButton>
                            <AButton 
                                type="link" 
                                size="small" 
                                @click="handleResetPassword(record)"
                            >
                                <KeyOutlined />
                                重置密码
                            </AButton>
                            <APopconfirm
                                title="确定要删除这个用户吗？"
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
                    
                    <!-- 用户类型显示逻辑 -->
                    <template v-else-if="column.key === 'userType'">
                        <ATag :color="record.userType === 'ADMIN' ? 'red' : record.userType === 'USER' ? 'blue' : 'default'">
                            {{ record.userType === 'ADMIN' ? '管理员' : record.userType === 'USER' ? '普通用户' : '其他' }}
                        </ATag>
                    </template>
                </template>
            </ATable>
        </ACard>

        <!-- 用户表单弹窗 -->
        <AModal
            v-model:open="userModalVisible"
            :title="isEdit ? '编辑用户' : '新增用户'"
            width="600px"
            @ok="handleUserSubmit"
            @cancel="handleUserCancel"
        >
            <AForm
                ref="userFormRef"
                :model="userForm"
                :rules="userFormRules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
            >
                <AFormItem label="用户名" name="userName">
                    <AInput v-model:value="userForm.userName" placeholder="请输入用户名" />
                </AFormItem>
                
                <AFormItem label="邮箱" name="userEmail">
                    <AInput v-model:value="userForm.userEmail" placeholder="请输入邮箱" />
                </AFormItem>
                
                <AFormItem label="手机号" name="userMobile">
                    <AInput v-model:value="userForm.userMobile" placeholder="请输入手机号" />
                </AFormItem>
                
                <AFormItem v-if="!isEdit" label="密码" name="userPwd">
                    <AInputPassword v-model:value="userForm.userPwd" placeholder="请输入密码" />
                </AFormItem>
                
                <AFormItem label="真实姓名" name="userRealName">
                    <AInput v-model:value="userForm.userRealName" placeholder="请输入真实姓名" />
                </AFormItem>
                
                <AFormItem label="用户类型" name="userType">
                    <ASelect v-model:value="userForm.userType" placeholder="请选择用户类型">
                        <ASelectOption value="OTHER">普通用户</ASelectOption>
                        <ASelectOption value="ADMIN">管理员</ASelectOption>
                    </ASelect>
                </AFormItem>
                
                <AFormItem label="部门" name="userDepartment">
                    <AInput v-model:value="userForm.userDepartment" placeholder="请输入部门" />
                </AFormItem>
            </AForm>
        </AModal>

        <!-- 分配角色弹窗 -->
        <AModal
            v-model:open="roleModalVisible"
            title="分配角色"
            width="500px"
            @ok="handleRoleSubmit"
            @cancel="handleRoleCancel"
        >
            <AForm :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <AFormItem label="用户">
                    <AInput :value="currentUser?.userName" disabled />
                </AFormItem>
                <AFormItem label="角色">
                    <ACheckboxGroup v-model:value="selectedRoles">
                        <ARow>
                            <ACol 
                                v-for="role in roleList" 
                                :key="role.roleId" 
                                :span="12"
                                style="margin-bottom: 8px"
                            >
                                <ACheckbox :value="role.roleId">
                                    {{ role.roleName }}
                                </ACheckbox>
                            </ACol>
                        </ARow>
                    </ACheckboxGroup>
                </AFormItem>
            </AForm>
        </AModal>
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
    TeamOutlined,
    KeyOutlined
} from '@ant-design/icons-vue';
import {
    getUserList,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    resetUserPassword,
    assignUserRoles,
    getUserRoles
} from '@/api/user.js';
import { getRoleList } from '@/api/role.js';

// 搜索表单
const searchForm = reactive({
    userName: '',
    userRealName: '',
    userType: undefined,
    userDepartment: ''
});

// 用户列表
const userList = ref([]);
const loading = ref(false);
const selectedRowKeys = ref([]);

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
        title: '头像',
        key: 'avatar',
        width: 80,
        align: 'center'
    },
    {
        title: '用户名',
        dataIndex: 'userName',
        key: 'userName',
        width: 120
    },
    {
        title: '真实姓名',
        dataIndex: 'userRealName',
        key: 'userRealName',
        width: 100
    },
    {
        title: '邮箱',
        dataIndex: 'userEmail',
        key: 'userEmail',
        width: 200
    },
    {
        title: '手机号',
        dataIndex: 'userMobile',
        key: 'userMobile',
        width: 130
    },
    {
        title: '用户类型',
        dataIndex: 'userType',
        key: 'userType',
        width: 100,
        align: 'center'
    },
    {
        title: '部门',
        dataIndex: 'userDepartment',
        key: 'userDepartment',
        width: 120
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
        width: 280,
        fixed: 'right'
    }
];

// 行选择
const rowSelection = computed(() => ({
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys) => {
        selectedRowKeys.value = keys;
    }
}));

// 用户表单
const userModalVisible = ref(false);
const isEdit = ref(false);
const userFormRef = ref();
// 用户表单
const userForm = reactive({
    userId: null,
    userName: '',
    userEmail: '',
    userMobile: '',
    userPwd: '',
    userRealName: '',
    userType: 'OTHER',
    userDepartment: ''
});

// 表单验证规则
const userFormRules = {
    userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
    ],
    userEmail: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    userMobile: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    userPwd: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
    ],
    userRealName: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' }
    ],
    userType: [
        { required: true, message: '请选择用户类型', trigger: 'change' }
    ]
};

// 角色相关
const roleModalVisible = ref(false);
const roleList = ref([]);
const selectedRoles = ref([]);
const currentUser = ref(null);

// 获取用户列表
const fetchUserList = async () => {
    loading.value = true;
    try {
        const params = {
            pageNum: pagination.current,
            pageSize: pagination.pageSize,
            ...searchForm
        };
        const response = await getUserList(params);
        userList.value = response.data.list || [];
        pagination.total = response.data.total || 0;
    } catch (error) {
        message.error('获取用户列表失败');
    } finally {
        loading.value = false;
    }
};

// 搜索
const handleSearch = () => {
    pagination.current = 1;
    fetchUserList();
};

// 重置
const handleReset = () => {
    Object.assign(searchForm, {
        userName: '',
        userRealName: '',
        userType: undefined,
        userDepartment: ''
    });
    pagination.current = 1;
    fetchUserList();
};

// 表格变化
const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchUserList();
};

// 新增用户
const handleAdd = () => {
    isEdit.value = false;
    userModalVisible.value = true;
    resetUserForm();
};

// 编辑用户
const handleEdit = (record) => {
    isEdit.value = true;
    userModalVisible.value = true;
    Object.assign(userForm, record);
};

// 删除用户
const handleDelete = async (record) => {
    try {
        await deleteUser(record.userId);
        message.success('删除成功');
        fetchUserList();
    } catch (error) {
        message.error('删除失败');
    }
};

// 批量删除
const handleBatchDelete = () => {
    Modal.confirm({
        title: '确定要删除选中的用户吗？',
        content: `将删除 ${selectedRowKeys.value.length} 个用户`,
        onOk: async () => {
            try {
                await batchDeleteUsers(selectedRowKeys.value);
                message.success('批量删除成功');
                selectedRowKeys.value = [];
                fetchUserList();
            } catch (error) {
                message.error('批量删除失败');
            }
        }
    });
};

// 重置密码
const handleResetPassword = (record) => {
    Modal.confirm({
        title: '确定要重置密码吗？',
        content: '重置后密码将变为：123456',
        onOk: async () => {
            try {
                await resetUserPassword(record.userId, { newPassword: '123456' });
                message.success('密码重置成功');
            } catch (error) {
                message.error('密码重置失败');
            }
        }
    });
};

// 分配角色
const handleAssignRole = async (record) => {
    currentUser.value = record;
    roleModalVisible.value = true;
    
    try {
        const userRoles = await getUserRoles(record.userId);
        selectedRoles.value = userRoles.map(role => role.roleId);
    } catch (error) {
        message.error('获取用户角色失败');
    }
};

// 用户表单提交
const handleUserSubmit = async () => {
    try {
        await userFormRef.value.validate();
        
        if (isEdit.value) {
            await updateUser(userForm.userId, userForm);
            message.success('更新成功');
        } else {
            await createUser(userForm);
            message.success('创建成功');
        }
        
        userModalVisible.value = false;
        fetchUserList();
    } catch (error) {
        if (error.errorFields) {
            message.error('请检查表单输入');
        } else {
            message.error(isEdit.value ? '更新失败' : '创建失败');
        }
    }
};

// 用户表单取消
const handleUserCancel = () => {
    userModalVisible.value = false;
    resetUserForm();
};

// 角色分配提交
const handleRoleSubmit = async () => {
    try {
        await assignUserRoles(currentUser.value.userId, selectedRoles.value);
        message.success('角色分配成功');
        roleModalVisible.value = false;
        fetchUserList();
    } catch (error) {
        message.error('角色分配失败');
    }
};

// 角色分配取消
const handleRoleCancel = () => {
    roleModalVisible.value = false;
    selectedRoles.value = [];
    currentUser.value = null;
};

// 重置用户表单
const resetUserForm = () => {
    Object.assign(userForm, {
        userId: null,
        userName: '',
        userEmail: '',
        userMobile: '',
        userPwd: '',
        userRealName: '',
        userType: 'OTHER',
        userDepartment: ''
    });
    userFormRef.value?.resetFields();
};

// 获取角色列表
const fetchRoleList = async () => {
    try {
        const response = await getRoleList();
        roleList.value = response.data.list || [];
    } catch (error) {
        message.error('获取角色列表失败');
    }
};

onMounted(() => {
    fetchUserList();
    fetchRoleList();
});
</script>

<style scoped lang="less">
.user-management {
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
}

// 响应式处理
@media (max-width: 768px) {
    .user-management {
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