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
                        :disabled="!selectedRowKeys.length"
                        @click="handleBatchAssignRole"
                        style="margin-right: 8px;"
                    >
                        <TeamOutlined />
                        批量分配角色
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
            :width="windowObj.innerWidth <= 768 ? '95%' : '600px'"
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
            :width="windowObj.innerWidth <= 768 ? '95%' : '700px'"
            @ok="handleRoleSubmit"
            @cancel="handleRoleCancel"
            class="role-assignment-modal"
        >
            <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" style="width: 100%; overflow: hidden;">
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
                <a-form-item label="角色" class="roles-form-item" style="overflow: hidden;">
                    <div class="roles-header" style="margin-bottom: 12px;">
                        <a-input-search 
                            v-model:value="roleSearchValue" 
                            placeholder="搜索角色" 
                            style="width: 200px; margin-right: 12px;"
                            @change="handleRoleSearch"
                        />
                        <a-button 
                            type="link" 
                            size="small" 
                            @click="handleSelectAllRoles"
                        >
                            {{ isAllRolesSelected ? '取消全选' : '全选' }}
                        </a-button>
                    </div>
                    <div class="roles-container">
                        <a-checkbox-group v-model:value="selectedRoles" class="role-checkbox-group">
                            <a-row :gutter="[12, 12]">
                                <a-col 
                                    v-for="role in filteredRoleList" 
                                    :key="role.roleId" 
                                    :xs="24"
                                    :sm="12"
                                    :md="8"
                                    :lg="8"
                                >
                                    <div 
                                        class="role-card" 
                                        :class="{ 'role-card-selected': selectedRoles.includes(role.roleId) }"
                                        @click="toggleRoleSelection(role.roleId)"
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
        
        <!-- 批量分配角色弹窗 -->
        <a-modal
            v-model:open="batchRoleModalVisible"
            title="批量分配角色"
            :width="windowObj.innerWidth <= 768 ? '95%' : '700px'"
            @ok="handleBatchRoleSubmit"
            @cancel="handleBatchRoleCancel"
            class="role-assignment-modal"
        >
            <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" style="width: 100%; overflow: hidden;">
                <a-form-item label="用户">
                    <a-alert
                        message="批量操作"
                        :description="`已选择 ${selectedRowKeys.length} 个用户进行角色分配`"
                        type="info"
                        show-icon
                        style="margin-bottom: 16px;"
                    />
                </a-form-item>
                <a-form-item label="角色" class="roles-form-item" style="overflow: hidden;">
                    <div class="roles-header" style="margin-bottom: 12px;">
                        <a-input-search 
                            v-model:value="batchRoleSearchValue" 
                            placeholder="搜索角色" 
                            style="width: 200px; margin-right: 12px;"
                            @change="handleBatchRoleSearch"
                        />
                        <a-button 
                            type="link" 
                            size="small" 
                            @click="handleBatchSelectAllRoles"
                        >
                            {{ isAllBatchRolesSelected ? '取消全选' : '全选' }}
                        </a-button>
                    </div>
                    <div class="roles-container">
                        <a-checkbox-group v-model:value="batchSelectedRoles" class="role-checkbox-group">
                            <a-row :gutter="[12, 12]">
                                <a-col 
                                    v-for="role in filteredBatchRoleList" 
                                    :key="role.roleId" 
                                    :xs="24"
                                    :sm="12"
                                    :md="8"
                                    :lg="8"
                                >
                                    <div 
                                        class="role-card" 
                                        :class="{ 'role-card-selected': batchSelectedRoles.includes(role.roleId) }"
                                        @click="toggleBatchRoleSelection(role.roleId)"
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
            
            :width="windowObj.innerWidth <= 768 ? '95%' : '600px'"
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
                            blockNode
                            checkable
                            @check="handleMenuCheck"
                            :field-names="{ key: 'menuId', title: 'menuName', children: 'children' }"
                            class="menu-tree"
                        >
                            <template #title="{ menuName, menuType, menuPath }">
                                <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
                                    <div>
                                        <span class="menu-name">{{ menuName }}</span>
                                        <span class="menu-path" v-if="menuPath">{{ menuPath }}</span>
                                    </div>
                                    <div>
                                        <a-tag v-if="menuType" size="small" :color="menuType === 'MENU' ? 'blue' : 'green'">
                                            {{ menuType === 'MENU' ? '菜单' : '权限' }}
                                        </a-tag>
                                    </div>
                                  </div>
                            </template>
                        </a-tree>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
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
    assignUserMenus,
    batchAssignUserRoles
} from '@/api/user.js';
import { getRoleList } from '@/api/role.js';
import { getUserMenuTree } from '@/api/menu.js';

// 提供 window 对象给模板使用
const windowObj = ref(window);

// 监听窗口大小变化
const updateWindowSize = () => {
    windowObj.value = { ...window };
};

// 添加窗口大小变化的监听
onMounted(() => {
    window.addEventListener('resize', updateWindowSize);
});

// 组件卸载时移除监听
onUnmounted(() => {
    window.removeEventListener('resize', updateWindowSize);
});

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
const batchRoleModalVisible = ref(false);
const roleList = ref([]);
const selectedRoles = ref([]);
const batchSelectedRoles = ref([]);
const currentUser = ref(null);
const roleSearchValue = ref('');

// 计算过滤后的角色列表
const filteredRoleList = computed(() => {
    if (!roleSearchValue.value) return roleList.value;
    return roleList.value.filter(role => 
        role.roleName.toLowerCase().includes(roleSearchValue.value.toLowerCase()) ||
        (role.roleDesc && role.roleDesc.toLowerCase().includes(roleSearchValue.value.toLowerCase()))
    );
});

// 计算是否全部角色已选中
const isAllRolesSelected = computed(() => {
    return filteredRoleList.value.length > 0 && 
           filteredRoleList.value.every(role => selectedRoles.value.includes(role.roleId));
});

// 批量角色搜索
const batchRoleSearchValue = ref('');

// 计算过滤后的批量角色列表
const filteredBatchRoleList = computed(() => {
    if (!batchRoleSearchValue.value) return roleList.value;
    return roleList.value.filter(role => 
        role.roleName.toLowerCase().includes(batchRoleSearchValue.value.toLowerCase()) ||
        (role.roleDesc && role.roleDesc.toLowerCase().includes(batchRoleSearchValue.value.toLowerCase()))
    );
});

// 计算是否全部批量角色已选中
const isAllBatchRolesSelected = computed(() => {
    return filteredBatchRoleList.value.length > 0 && 
           filteredBatchRoleList.value.every(role => batchSelectedRoles.value.includes(role.roleId));
});

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
        content: '重置后密码将变为：yili1234',
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

// 处理菜单选中逻辑，确保只勾选用户实际拥有的菜单
const processSelectedMenus = (menuIds, menuTreeData) => {
    // 创建一个映射，记录每个菜单的实际选中状态
    const menuSelectedMap = new Map();
    
    // 递归处理菜单树，标记实际拥有权限的菜单
    const markSelectedMenus = (menus) => {
        for (const menu of menus) {
            // 只有当菜单ID在用户权限列表中时，才标记为选中
            menuSelectedMap.set(menu.menuId, menuIds.includes(menu.menuId));
            
            // 递归处理子菜单
            if (menu.children && menu.children.length > 0) {
                markSelectedMenus(menu.children);
            }
        }
    };
    
    markSelectedMenus(menuTreeData);
    
    // 只返回实际选中的菜单ID
    return menuIds.filter(menuId => menuSelectedMap.has(menuId) && menuSelectedMap.get(menuId));
};

// 分配菜单
const handleAssignMenu = async (record) => {
    currentUser.value = record;
    selectedMenus.value = [];
    expandedKeys.value = [];
    loading.value = true;
    
    try {
        // 获取用户菜单树（包含权限标记）
        const userMenuTreeResponse = await getUserMenuTree(record.userId);
        console.log('userMenuTreeResponse', userMenuTreeResponse);
        
        // 处理菜单树数据，将true字段重命名为isTrue字段
        const processMenuTree = (menus) => {
            if (!menus || !Array.isArray(menus)) return [];
            
            return menus.map(menu => {
                // 创建新对象，避免修改原始对象
                const newMenu = { ...menu };
                
                // 将true字段重命名为isTrue字段
                if ('true' in newMenu) {
                    newMenu.isTrue = newMenu.true;
                }
                // 兼容后端可能返回allTrue字段的情况
                if ('allTrue' in newMenu) {
                    newMenu.isTrue = newMenu.allTrue;
                }
                
                // 递归处理子菜单
                if (newMenu.children && Array.isArray(newMenu.children)) {
                    newMenu.children = processMenuTree(newMenu.children);
                }
                
                return newMenu;
            });
        };
        
        // 处理菜单树数据
        menuTree.value = processMenuTree(userMenuTreeResponse.data || []);
        
        // 获取用户已有的菜单权限ID列表（从带有权限标记的菜单树中提取）
        const userMenuIds = extractUserMenuIds(menuTree.value);
        
        // 处理父子节点的选中关系
        const processParentChildSelection = (menuIds) => {
            // 创建一个新的选中菜单ID数组
            let newSelectedMenus = [...menuIds];
            
            // 处理父节点选中状态
            const processParentSelection = (menus) => {
                for (const menu of menus) {
                    if (menu.children && menu.children.length > 0) {
                        // 递归处理子菜单
                        processParentSelection(menu.children);
                        
                        // 检查所有子节点是否都被选中，不再限制只考虑有权限的子节点
                        const allChildrenSelected = menu.children.every(child => {
                            // 直接子节点是否选中，不再检查isTrue属性
                            const isChildSelected = newSelectedMenus.includes(child.menuId);
                            
                            // 如果子节点有子节点，则需要检查所有孙节点是否都被选中
                            if (child.children && child.children.length > 0) {
                                return isChildSelected && child.children.every(grandChild => 
                                    newSelectedMenus.includes(grandChild.menuId)
                                );
                            }
                            
                            return isChildSelected;
                        });
                        
                        // 如果所有子节点都被选中，则选中父节点，不再检查isTrue属性
                        if (allChildrenSelected && !newSelectedMenus.includes(menu.menuId)) {
                            newSelectedMenus.push(menu.menuId);
                        }
                    }
                }
            };
            
            processParentSelection(menuTree.value);
            return newSelectedMenus;
        };
        
        // 设置选中的菜单，并处理父子节点的选中关系
        selectedMenus.value = processParentChildSelection(userMenuIds);
        
        // 设置默认展开的节点
        expandedKeys.value = menuTree.value
            .filter(item => item.children && item.children.length > 0)
            .map(item => item.menuId);
        
        // 显示弹窗
        menuModalVisible.value = true;
    } catch (error) {
        console.error('获取菜单信息失败:', error);
        message.error('获取菜单信息失败');
    } finally {
        loading.value = false;
    }
};

// 从带有权限标记的菜单树中提取用户拥有权限的菜单ID
const extractUserMenuIds = (menuTreeData) => {
    console.log('menuTreeData', menuTreeData);
    const menuIds = [];
    
    const extractIds = (menus) => {
        for (const menu of menus) {
            // 如果用户有该菜单权限，添加到结果中
            // 我们已经在handleAssignMenu中将true字段重命名为isTrue字段
            // 注意：这里仍然保留isTrue检查，因为这是初始加载时提取用户已有权限
            if (menu.isTrue) {
                menuIds.push(menu.menuId);
            }
            
            // 递归处理子菜单
            if (menu.children && menu.children.length > 0) {
                extractIds(menu.children);
            }
        }
    };
    
    extractIds(menuTreeData);
    return menuIds;
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

// 角色搜索
const handleRoleSearch = () => {
    // 搜索逻辑已通过计算属性 filteredRoleList 实现
};

// 切换角色选择
const toggleRoleSelection = (roleId) => {
    const index = selectedRoles.value.indexOf(roleId);
    if (index === -1) {
        selectedRoles.value.push(roleId);
    } else {
        selectedRoles.value.splice(index, 1);
    }
};

// 全选/取消全选角色
const handleSelectAllRoles = () => {
    if (isAllRolesSelected.value) {
        // 取消全选
        selectedRoles.value = selectedRoles.value.filter(
            roleId => !filteredRoleList.value.some(role => role.roleId === roleId)
        );
    } else {
        // 全选
        const filteredRoleIds = filteredRoleList.value.map(role => role.roleId);
        const newSelectedRoles = [...new Set([...selectedRoles.value, ...filteredRoleIds])];
        selectedRoles.value = newSelectedRoles;
    }
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

// 批量分配角色
const handleBatchAssignRole = async () => {
    if (selectedRowKeys.value.length === 0) {
        message.warning('请先选择用户');
        return;
    }
    
    batchSelectedRoles.value = [];
    loading.value = true;
    
    try {
        // 获取所有角色列表
        await fetchRoleList();
        
        // 显示弹窗
        batchRoleModalVisible.value = true;
    } catch (error) {
        message.error('获取角色信息失败');
    } finally {
        loading.value = false;
    }
};

// 批量角色搜索
const handleBatchRoleSearch = () => {
    // 搜索逻辑已通过计算属性 filteredBatchRoleList 实现
};

// 切换批量角色选择
const toggleBatchRoleSelection = (roleId) => {
    const index = batchSelectedRoles.value.indexOf(roleId);
    if (index === -1) {
        batchSelectedRoles.value.push(roleId);
    } else {
        batchSelectedRoles.value.splice(index, 1);
    }
};

// 全选/取消全选批量角色
const handleBatchSelectAllRoles = () => {
    if (isAllBatchRolesSelected.value) {
        // 取消全选
        batchSelectedRoles.value = batchSelectedRoles.value.filter(
            roleId => !filteredBatchRoleList.value.some(role => role.roleId === roleId)
        );
    } else {
        // 全选
        const filteredRoleIds = filteredBatchRoleList.value.map(role => role.roleId);
        const newSelectedRoles = [...new Set([...batchSelectedRoles.value, ...filteredRoleIds])];
        batchSelectedRoles.value = newSelectedRoles;
    }
};

// 批量角色分配提交
const handleBatchRoleSubmit = async () => {
    try {
        await batchAssignUserRoles({
            userIds: selectedRowKeys.value,
            roleIds: batchSelectedRoles.value
        });
        message.success('批量角色分配成功');
        batchRoleModalVisible.value = false;
        selectedRowKeys.value = [];
        fetchUserList();
    } catch (error) {
        message.error('批量角色分配失败');
    }
};

// 批量角色分配取消
const handleBatchRoleCancel = () => {
    batchRoleModalVisible.value = false;
    batchSelectedRoles.value = [];
    batchRoleSearchValue.value = '';
};

// 角色分配取消
const handleRoleCancel = () => {
    roleModalVisible.value = false;
    selectedRoles.value = [];
    currentUser.value = null;
    roleSearchValue.value = '';
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

// 处理菜单节点勾选事件
const handleMenuCheck = (checkedKeys, e) => {
    const { checked, node } = e;
    const menuId = node.menuId;
    
    // 获取当前节点的所有子节点ID
    const getChildrenIds = (menu) => {
        const ids = [];
        if (menu.children && menu.children.length > 0) {
            for (const child of menu.children) {
                // 允许勾选所有子节点，不再限制只勾选有权限的子节点
                ids.push(child.menuId);
                ids.push(...getChildrenIds(child));
            }
        }
        return ids;
    };
    
    // 获取当前节点的所有父节点ID
    const getParentIds = (menuId, menus, parentIds = []) => {
        for (const menu of menus) {
            if (menu.children && menu.children.length > 0) {
                // 检查当前节点的子节点中是否包含目标节点
                const hasTarget = menu.children.some(child => 
                    child.menuId === menuId || 
                    (child.children && getParentIds(menuId, [child], []).length > 0)
                );
                
                if (hasTarget) {
                    parentIds.push(menu.menuId);
                    // 继续向上查找父节点
                    if (menus !== menuTree.value) {
                        getParentIds(menu.menuId, menuTree.value, parentIds);
                    }
                    break;
                } else {
                    // 递归查找子节点
                    getParentIds(menuId, menu.children, parentIds);
                }
            }
        }
        return parentIds;
    };
    
    // 检查节点的所有子节点是否都被选中
    const areAllChildrenChecked = (menu, checkedKeys) => {
        if (!menu.children || menu.children.length === 0) {
            return true;
        }
        
        // 考虑所有子节点，不再限制只考虑有权限的子节点
        return menu.children.every(child => {
            const isChecked = checkedKeys.includes(child.menuId);
            if (!isChecked) return false;
            
            // 递归检查子节点
            if (child.children && child.children.length > 0) {
                return areAllChildrenChecked(child, checkedKeys);
            }
            return true;
        });
    };
    
    // 创建一个新的选中菜单ID数组
    let newSelectedMenus = [...selectedMenus.value];
    
    if (checked) {
        // 勾选当前节点，允许用户手动勾选任何菜单节点
        if (!newSelectedMenus.includes(menuId)) {
            newSelectedMenus.push(menuId);
        }
        
        // 勾选所有有权限的子节点
        const childrenIds = getChildrenIds(node);
        for (const id of childrenIds) {
            if (!newSelectedMenus.includes(id)) {
                newSelectedMenus.push(id);
            }
        }
    } else {
        // 取消勾选当前节点
        newSelectedMenus = newSelectedMenus.filter(id => id !== menuId);
        
        // 取消勾选所有子节点
        const childrenIds = getChildrenIds(node);
        newSelectedMenus = newSelectedMenus.filter(id => !childrenIds.includes(id));
        
        // 如果取消勾选的是子节点，且该子节点的同级节点不是全部选中，则取消勾选父节点
        const parentIds = getParentIds(menuId, menuTree.value);
        for (const parentId of parentIds) {
            // 找到父节点对象
            const findParentNode = (menus, id) => {
                for (const menu of menus) {
                    if (menu.menuId === id) return menu;
                    if (menu.children && menu.children.length > 0) {
                        const found = findParentNode(menu.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };
            
            const parentNode = findParentNode(menuTree.value, parentId);
            if (parentNode && !areAllChildrenChecked(parentNode, newSelectedMenus)) {
                newSelectedMenus = newSelectedMenus.filter(id => id !== parentId);
            }
        }
    }
    
    // 更新选中的菜单ID
    selectedMenus.value = newSelectedMenus;
};

// 菜单分配提交
const handleMenuSubmit = async () => {
    try {
        // 获取真正需要提交的菜单ID列表
        // 这里我们需要确保提交的菜单ID是用户真正需要的，而不是因为父子关联自动选中的
        const getActualSelectedMenuIds = () => {
            // 创建一个映射，记录每个菜单的实际选中状态
            const menuMap = new Map();
            
            // 递归处理菜单树，标记每个菜单节点
            const processMenus = (menus) => {
                for (const menu of menus) {
                    // 记录菜单节点信息
                    menuMap.set(menu.menuId, {
                        id: menu.menuId,
                        isSelected: selectedMenus.value.includes(menu.menuId),
                        hasChildren: menu.children && menu.children.length > 0,
                        children: menu.children ? menu.children.map(child => child.menuId) : []
                    });
                    
                    // 递归处理子菜单
                    if (menu.children && menu.children.length > 0) {
                        processMenus(menu.children);
                    }
                }
            };
            
            processMenus(menuTree.value);
            
            // 过滤出真正需要提交的菜单ID，只包括用户实际有权限的菜单
            return selectedMenus.value.filter(menuId => {
                const menuInfo = menuMap.get(menuId);
                if (!menuInfo) return false;
                
                // 查找菜单节点对象，检查是否有权限
                const findMenuNode = (menus, id) => {
                    for (const menu of menus) {
                        if (menu.menuId === id) return menu;
                        if (menu.children && menu.children.length > 0) {
                            const found = findMenuNode(menu.children, id);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                
                const menuNode = findMenuNode(menuTree.value, menuId);
                // 如果节点不存在，则不提交
                if (!menuNode) return false;
                
                // 重要：如果是用户手动选中的菜单，即使没有isTrue标记，也应该提交
                // 这样可以确保用户手动选中的菜单被正确提交
                // 不再检查isTrue属性，允许提交所有用户手动选中的菜单
                
                // 如果是叶子节点或者不是所有子节点都被选中，则需要提交
                if (!menuInfo.hasChildren) return true;
                
                // 考虑所有子节点，不再限制只考虑有权限的子节点
                const children = menuInfo.children;
                
                // 如果没有子节点，则需要提交父节点
                if (children.length === 0) return true;
                
                // 检查是否所有子节点都被选中
                const allChildrenSelected = children.every(childId => 
                    selectedMenus.value.includes(childId)
                );
                
                // 如果不是所有子节点都被选中，则需要提交父节点
                return !allChildrenSelected;
            });
        };
        
        // 提交选中的菜单ID列表
        console.log('用户手动选中的菜单ID列表:', selectedMenus.value);
        const menuIdsToSubmit = getActualSelectedMenuIds();
        console.log('实际提交的菜单ID列表:', menuIdsToSubmit);
        
        // 确保提交的菜单ID列表不为空
        if (menuIdsToSubmit.length === 0 && selectedMenus.value.length > 0) {
            // 如果过滤后的菜单ID为空但用户选中了菜单，则直接提交用户选中的菜单ID
            console.log('过滤后菜单ID为空，直接提交用户选中的菜单ID');
            await assignUserMenus(currentUser.value.userId, { menuIds: selectedMenus.value });
        } else {
            // 正常提交过滤后的菜单ID
            await assignUserMenus(currentUser.value.userId, { menuIds: menuIdsToSubmit });
        }
        
        message.success('菜单权限分配成功');
        menuModalVisible.value = false;
    } catch (error) {
        console.error('菜单权限分配失败:', error);
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
    // 不再需要在初始化时获取菜单树，因为在分配菜单时会通过getUserMenuTree获取
    // fetchMenuTree();
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
}

// 角色分配弹窗样式优化
.role-assignment-modal {
    :deep(.ant-modal-content) {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 100%; /* 确保内容不超出 */
        
        .ant-modal-header {
            padding: 16px 24px;
            border-bottom: 1px solid #f0f0f0;
            background: #fafafa;
            
            .ant-modal-title {
                font-size: 16px;
                font-weight: 600;
                color: #262626;
            }
        }
        
        .ant-modal-body {
            padding: 24px;
            overflow-x: hidden; /* 防止水平滚动 */
        }
        
        .ant-modal-footer {
            padding: 10px 24px;
            border-top: 1px solid #f0f0f0;
        }
    }
    
    .roles-container {
        max-height: 450px; /* 增加容器高度 */
        overflow-y: auto;
        overflow-x: hidden; /* 防止水平滚动 */
        padding: 8px 0;
        border-radius: 4px;
        
        &::-webkit-scrollbar {
            width: 6px;
        }
        
        &::-webkit-scrollbar-thumb {
            background-color: #d9d9d9;
            border-radius: 3px;
        }
        
        &::-webkit-scrollbar-track {
            background-color: #f5f5f5;
        }
        
        .role-checkbox-group {
            width: 100%;
            overflow: hidden; /* 防止内容溢出 */
            
            .role-card {
                position: relative;
                padding: 10px; /* 减小内边距 */
                border-radius: 6px;
                border: 1px solid #f0f0f0;
                transition: all 0.3s ease;
                height: auto; /* 改为自适应高度 */
                min-height: 60px; /* 设置最小高度 */
                display: flex;
                align-items: center;
                
                &:hover {
                    border-color: #1890ff;
                    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
                }
                
                &.role-card-selected {
                    background-color: #e6f7ff;
                    border-color: #1890ff;
                }
                
                .ant-checkbox {
                    margin-right: 6px;
                    flex-shrink: 0;
                }
                
                .role-info {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    flex: 1;
                    max-width: 100%; /* 限制最大宽度 */
                    
                    .role-name {
                        font-weight: 500;
                        color: #262626;
                        margin-bottom: 2px;
                        font-size: 14px;
                        line-height: 1.4;
                    }
                    
                    .role-desc {
                        color: #8c8c8c;
                        font-size: 12px;
                        white-space: normal; /* 允许文本换行 */
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 2; /* 限制最多显示两行 */
                        -webkit-box-orient: vertical;
                        line-height: 1.3;
                    }
                }
            }
        }
    }
    
    .user-input {
        border-radius: 4px;
    }
}

.menu-assignment-modal  {
    .menus-container {
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #f0f0f0;
        padding: 10px;
        border-radius: 4px;
        
        &::-webkit-scrollbar {
            width: 6px;
        }
        
        &::-webkit-scrollbar-thumb {
            background-color: #d9d9d9;
            border-radius: 3px;
        }
        
        &::-webkit-scrollbar-track {
            background-color: #f5f5f5;
        }
        
        .menu-tree {
            .menu-name {
                font-weight: 500;
                margin-right: 8px;
            }
            
            .menu-path {
                color: #8c8c8c;
                font-size: 12px;
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
    
    .role-assignment-modal {
        width: 100% !important; // 确保弹窗宽度不超过屏幕
        
        :deep(.ant-modal-content) {
            width: 100%;
            max-width: 100vw;
        }
        
        .roles-container {
            max-height: 350px; // 小屏幕下减小容器高度
            overflow-x: hidden; // 防止水平滚动
            
            .role-checkbox-group {
                .role-card {
                    margin-bottom: 8px;
                    min-height: 50px; // 小屏幕下减小卡片最小高度
                    
                    .role-info {
                        .role-name {
                            font-size: 13px;
                        }
                        
                        .role-desc {
                            font-size: 11px;
                            -webkit-line-clamp: 1; // 小屏幕下只显示一行描述
                        }
                    }
                }
            }
        }
    }
}
</style>