<template>
    <div class="user-management">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2>用户管理</h2>
            <p>管理系统用户信息，包括用户的创建、编辑、删除和权限分配</p>
        </div>

        <!-- 搜索和操作区域 -->
        <a-card class="search-card">
            <a-form
                :model="searchForm"
                layout="inline"
                class="search-form"
            >
                <a-form-item label="用户名">
                    <a-input
                        v-model:value="searchForm.userName"
                        placeholder="请输入用户名"
                        allow-clear
                        class="form-compo"
                    />
                </a-form-item>
                <a-form-item label="真实姓名">
                    <a-input
                        v-model:value="searchForm.userRealName"
                        placeholder="请输入真实姓名"
                        allow-clear
                        class="form-compo"
                    />
                </a-form-item>

                <a-form-item label="部门">
                    <a-input
                        v-model:value="searchForm.userDepartment"
                        placeholder="请输入部门"
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
                        新增用户
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

        <!-- 用户列表 -->
        <a-card class="table-card">
            <a-table
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
                        <a-avatar :src="record.avatar" :size="40">
                            {{ record.userRealName?.charAt(0) || record.userName?.charAt(0) || 'U' }}
                        </a-avatar>
                    </template>
                    
                    <template v-else-if="column.key === 'userStatus'">
                        <a-tag :color="record.userStatus === 'active' ? 'green' : 'red'">
                            {{ record.userStatus === 'active' ? '启用' : '禁用' }}
                        </a-tag>
                    </template>
                    
                    <template v-else-if="column.key === 'userDepartment'">
                        <span>{{ record.userDepartment || '-' }}</span>
                    </template>
                    
                    <template v-else-if="column.key === 'roles'">
                        <a-tag
                            v-for="role in record.roles"
                            :key="role.id"
                            color="blue"
                        >
                            {{ role.name }}
                        </a-tag>
                    </template>
                    
                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button 
                                type="link" 
                                size="small" 
                                @click="handleEdit(record)"
                                title="编辑"
                            >
                                <EditOutlined />
                            </a-button>
                            <a-dropdown>
                                <a-button type="link" size="small" title="更多操作">
                                    <MoreOutlined />
                                </a-button>
                                <template #overlay>
                                    <a-menu>
                                        <a-menu-item @click="handleAssignRole(record)">
                                            <TeamOutlined />
                                            分配角色
                                        </a-menu-item>
                                        <a-menu-item @click="handleAssignMenu(record)">
                                            <MenuOutlined />
                                            分配菜单
                                        </a-menu-item>
                                        <a-menu-item @click="handleResetPassword(record)">
                                            <KeyOutlined />
                                            重置密码
                                        </a-menu-item>
                                        <a-menu-divider />
                                        <a-menu-item @click="confirmDelete(record)" class="danger-item">
                                            <DeleteOutlined />
                                            删除
                                        </a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown>
                        </a-space>
                    </template>
                    

                </template>
            </a-table>
        </a-card>

        <!-- 用户表单弹窗 -->
        <a-modal
            v-model:open="userModalVisible"
            :title="isEdit ? '编辑用户' : '新增用户'"
            width="600px"
            @ok="handleUserSubmit"
            @cancel="handleUserCancel"
        >
            <a-form
                ref="userFormRef"
                :model="userForm"
                :rules="userFormRules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
            >
                <a-form-item v-if="!isEdit" label="用户名" name="userName">
                    <a-input v-model:value="userForm.userName" placeholder="请输入用户名" />
                </a-form-item>
                <a-form-item v-else label="用户名" name="userName">
                    <span>{{ userForm.userName }}</span>
                </a-form-item>
                
                <a-form-item label="邮箱" name="userEmail">
                    <a-input v-model:value="userForm.userEmail" placeholder="请输入邮箱" />
                </a-form-item>
                
                <a-form-item label="手机号" name="userMobile">
                    <a-input v-model:value="userForm.userMobile" placeholder="请输入手机号" />
                </a-form-item>
                
                <a-form-item v-if="!isEdit" label="密码" name="userPwd">
                    <a-input-password v-model:value="userForm.userPwd" placeholder="请输入密码" />
                </a-form-item>
                
                <a-form-item label="真实姓名" name="userRealName">
                    <a-input v-model:value="userForm.userRealName" placeholder="请输入真实姓名" />
                </a-form-item>
                

                
                <a-form-item label="部门" name="userDepartment">
                    <a-input v-model:value="userForm.userDepartment" placeholder="请输入部门" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 分配角色弹窗 -->
        <a-modal
            v-model:open="roleModalVisible"
            title="分配角色"
            width="600px"
            @ok="handleRoleSubmit"
            @cancel="handleRoleCancel"
            class="role-assignment-modal"
        >
            <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                <a-form-item label="用户">
                    <a-input 
                        :value="currentUser?.userName" 
                        disabled 
                        class="user-input"
                    >
                        <template #prefix>
                            <UserOutlined />
                        </template>
                    </a-input>
                </a-form-item>
                <a-form-item label="角色" class="roles-form-item">
                    <div class="roles-container">
                        <a-checkbox-group v-model:value="selectedRoles" class="role-checkbox-group">
                            <a-row :gutter="[16, 16]">
                                <a-col 
                                    v-for="role in roleList" 
                                    :key="role.roleId" 
                                    :xs="24"
                                    :sm="12"
                                    :md="8"
                                >
                                    <div 
                                        class="role-card" 
                                        :class="{ 'role-card-selected': selectedRoles.includes(role.roleId) }"
                                    >
                                        <a-checkbox :value="role.roleId">
                                            <div class="role-info">
                                                <span class="role-name">{{ role.roleName }}</span>
                                                <span class="role-desc" v-if="role.roleDesc">{{ role.roleDesc }}</span>
                                            </div>
                                        </a-checkbox>
                                    </div>
                                </a-col>
                            </a-row>
                        </a-checkbox-group>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 分配菜单弹窗 -->
        <a-modal
            v-model:open="menuModalVisible"
            title="分配菜单权限"
            width="600px"
            @ok="handleMenuSubmit"
            @cancel="handleMenuCancel"
            class="menu-assignment-modal"
        >
            <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                <a-form-item label="用户">
                    <a-input 
                        :value="currentUser?.userName" 
                        disabled 
                        class="user-input"
                    >
                        <template #prefix>
                            <UserOutlined />
                        </template>
                    </a-input>
                </a-form-item>
                <a-form-item label="菜单权限" class="menus-form-item">
                    <div class="menus-container">
                        <a-tree
                            v-model:checkedKeys="selectedMenus"
                            v-model:expandedKeys="expandedKeys"
                            :tree-data="menuTree"
                            checkable
                            :field-names="{ key: 'menuId', title: 'menuName', children: 'children' }"
                            class="menu-tree"
                        >
                            <template #title="{ menuName, menuType, menuPath }">
                                <span class="menu-node">
                                    <span class="menu-name">{{ menuName }}</span>
                                    <span class="menu-path" v-if="menuPath">{{ menuPath }}</span>
                                    <a-tag v-if="menuType" size="small" :color="menuType === 'MENU' ? 'blue' : 'green'">
                                        {{ menuType === 'MENU' ? '菜单' : '按钮' }}
                                    </a-tag>
                                </span>
                            </template>
                        </a-tree>
                    </div>
                </a-form-item>
            </a-form>
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
    TeamOutlined,
    KeyOutlined,
    MoreOutlined,
    UserOutlined,
    MenuOutlined
} from '@ant-design/icons-vue';
import {
    getUserList,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    resetUserPassword,
    assignUserRoles,
    getUserRoles,
    getUserMenus,
    assignUserMenus
} from '@/api/user.js';
import { getRoleList } from '@/api/role.js';
import { getMenuTree } from '@/api/menu.js';

// 搜索表单
const searchForm = reactive({
    userName: '',
    userRealName: '',
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
        width: 120,
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

};

// 角色相关
const roleModalVisible = ref(false);
const roleList = ref([]);
const selectedRoles = ref([]);
const currentUser = ref(null);

// 菜单相关
const menuModalVisible = ref(false);
const menuTree = ref([]);
const selectedMenus = ref([]);
const expandedKeys = ref([]);

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
    Object.assign(userForm, { ...record, userType: 'OTHER' });
};

// 删除用户确认
const confirmDelete = (record) => {
    Modal.confirm({
        title: '确定要删除这个用户吗？',
        content: `用户：${record.userName}`,
        onOk: () => handleDelete(record)
    });
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
    selectedRoles.value = [];
    loading.value = true;
    
    try {
        // 先获取所有角色列表
        await fetchRoleList();
        
        // 再获取用户当前角色
        const userRolesResponse = await getUserRoles(record.userId);
        
        // 设置用户已有的角色
        selectedRoles.value = userRolesResponse.data.map(role => role.roleId);
        
        // 显示弹窗
        roleModalVisible.value = true;
    } catch (error) {
        message.error('获取角色信息失败');
    } finally {
        loading.value = false;
    }
};

// 分配菜单
const handleAssignMenu = async (record) => {
    currentUser.value = record;
    selectedMenus.value = [];
    expandedKeys.value = [];
    loading.value = true;
    
    try {
        // 先获取菜单树
        await fetchMenuTree();
        
        // 再获取用户当前菜单权限
        const userMenusResponse = await getUserMenus(record.userId);
        
        // 设置用户已有的菜单权限
        selectedMenus.value = userMenusResponse.data.map(menu => menu.menuId);
        
        // 设置默认展开的节点
        expandedKeys.value = menuTree.value
            .filter(item => item.children && item.children.length > 0)
            .map(item => item.menuId);
        
        // 显示弹窗
        menuModalVisible.value = true;
    } catch (error) {
        message.error('获取菜单信息失败');
    } finally {
        loading.value = false;
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
        await assignUserRoles(currentUser.value.userId, { roleIds: selectedRoles.value });
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
        const params = {
            pageNum: 1,
            pageSize: 100 // 获取足够多的角色
        };
        const response = await getRoleList(params);
        roleList.value = response.data.list || [];
    } catch (error) {
        message.error('获取角色列表失败');
    }
};

// 获取菜单树
const fetchMenuTree = async () => {
    try {
        const response = await getMenuTree();
        menuTree.value = response.data || [];
    } catch (error) {
        message.error('获取菜单树失败');
    }
};

// 菜单分配提交
const handleMenuSubmit = async () => {
    try {
        await assignUserMenus(currentUser.value.userId, { menuIds: selectedMenus.value });
        message.success('菜单权限分配成功');
        menuModalVisible.value = false;
    } catch (error) {
        message.error('菜单权限分配失败');
    }
};

// 菜单分配取消
const handleMenuCancel = () => {
    menuModalVisible.value = false;
    selectedMenus.value = [];
    expandedKeys.value = [];
};

onMounted(() => {
    fetchUserList();
    fetchRoleList();
    fetchMenuTree();
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
        
        // 操作按钮样式优化
        :deep(.ant-dropdown-menu) {
            .danger-item {
                color: #ff4d4f;
                
                &:hover {
                    background-color: #fff2f0;
                }
            }
        }
    }
    
    // 角色分配弹窗样式
    :deep(.role-assignment-modal) {
        .user-input {
            margin-bottom: 16px;
        }
        
        .roles-container {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 8px;
            
            &::-webkit-scrollbar {
                width: 6px;
                background-color: #f5f5f5;
            }
            
            &::-webkit-scrollbar-thumb {
                background-color: #ccc;
                border-radius: 3px;
            }
        }
        
        .role-card {
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            padding: 12px;
            transition: all 0.3s;
            cursor: pointer;
            
            &:hover {
                border-color: #1890ff;
                box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
            }
            
            &.role-card-selected {
                border-color: #1890ff;
                background-color: #e6f7ff;
            }
            
            .role-info {
                display: flex;
                flex-direction: column;
            }
            
            .role-name {
                font-weight: 500;
                margin-bottom: 4px;
            }
            
            .role-desc {
                font-size: 12px;
                color: #8c8c8c;
            }
        }
    }
    
    // 菜单分配弹窗样式
    :deep(.menu-assignment-modal) {
        .user-input {
            margin-bottom: 16px;
        }
        
        .menus-container {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 8px;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            padding: 12px;
            
            &::-webkit-scrollbar {
                width: 6px;
                background-color: #f5f5f5;
            }
            
            &::-webkit-scrollbar-thumb {
                background-color: #ccc;
                border-radius: 3px;
            }
        }
        
        .menu-tree {
            .menu-node {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                
                .menu-name {
                    font-weight: 500;
                    margin-right: 8px;
                }
                
                .menu-path {
                    font-size: 12px;
                    color: #8c8c8c;
                    margin-right: 8px;
                }
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
}</style>