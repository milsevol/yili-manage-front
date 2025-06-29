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
                            <a-button type="link" size="small" @click="handleEdit(record)">
                                <template #icon><EditOutlined /></template>
                                编辑
                            </a-button>
                            <a-button type="link" size="small" @click="handlePermission(record)">
                                <template #icon><MenuOutlined /></template>
                                分配菜单
                            </a-button>
                            <a-button type="link" size="small" @click="handleViewPermissions(record)">
                                <template #icon><KeyOutlined /></template>
                                权限
                            </a-button>
                            <a-popconfirm
                                title="确定要删除这个角色吗？"
                                ok-text="确定"
                                cancel-text="取消"
                                @confirm="handleDelete(record)"
                            >
                                <a-button type="link" danger size="small">
                                    <template #icon><DeleteOutlined /></template>
                                    删除
                                </a-button>
                            </a-popconfirm>
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
                <a-form-item label="角色">
                    <a-input 
                        :value="currentRole?.roleName" 
                        disabled 
                        class="role-input"
                    >
                        <template #prefix>
                            <SettingOutlined />
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
import { ref, reactive, onMounted, computed } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    KeyOutlined,
    SettingOutlined,
    MenuOutlined
} from '@ant-design/icons-vue';
import {
    getRoleList,
    createRole,
    updateRole,
    deleteRole,
    getRoleDetail,
    getRoleMenuTrees,
    assignRoleMenus
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

// 表格列定义
const columns = [
    {
        title: '角色名称',
        dataIndex: 'roleName',
        key: 'roleName',
        width: '20%',
    },
    {
        title: '角色ID',
        dataIndex: 'roleId',
        key: 'roleId',
        width: '20%',
    },
    {
        title: '创建时间',
        dataIndex: 'inserttime',
        key: 'inserttime',
        width: '20%',
    },
    {
        title: '更新时间',
        dataIndex: 'updatetime',
        key: 'updatetime',
        width: '20%',
    },
    {
        title: '操作',
        key: 'action',
        width: '20%',
    },
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

// 菜单权限相关
const menuModalVisible = ref(false);
const menuTree = ref([]);
const selectedMenus = ref([]);
const expandedKeys = ref([]);

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

// 配置菜单权限
const handlePermission = async (record) => {
    currentRole.value = record;
    selectedMenus.value = [];
    expandedKeys.value = [];
    loading.value = true;
    
    try {
        // 获取角色菜单树
        const menuTreeResponse = await getRoleMenuTrees(record.roleId);
        
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
        menuTree.value = processMenuTree(menuTreeResponse.data || []);
        
        // 获取角色已有的菜单权限ID列表
        const roleMenuIds = extractRoleMenuIds(menuTree.value);
        
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
                        
                        // 检查所有子节点是否都被选中
                        const allChildrenSelected = menu.children.every(child => {
                            // 直接子节点是否选中
                            const isChildSelected = newSelectedMenus.includes(child.menuId);
                            
                            // 如果子节点有子节点，则需要检查所有孙节点是否都被选中
                            if (child.children && child.children.length > 0) {
                                return isChildSelected && child.children.every(grandChild => 
                                    newSelectedMenus.includes(grandChild.menuId)
                                );
                            }
                            
                            return isChildSelected;
                        });
                        
                        // 如果所有子节点都被选中，则选中父节点
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
        selectedMenus.value = processParentChildSelection(roleMenuIds);
        
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

// 从带有权限标记的菜单树中提取角色拥有权限的菜单ID
const extractRoleMenuIds = (menuTreeData) => {
    const menuIds = [];
    
    const extractIds = (menus) => {
        for (const menu of menus) {
            // 如果角色有该菜单权限，添加到结果中
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

// 处理菜单节点勾选事件
const handleMenuCheck = (checkedKeys, e) => {
    const { checked, node } = e;
    const menuId = node.menuId;
    
    // 获取当前节点的所有子节点ID
    const getChildrenIds = (menu) => {
        const ids = [];
        if (menu.children && menu.children.length > 0) {
            for (const child of menu.children) {
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
        // 勾选当前节点
        if (!newSelectedMenus.includes(menuId)) {
            newSelectedMenus.push(menuId);
        }
        
        // 勾选所有子节点
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
            
            // 过滤出真正需要提交的菜单ID
            return selectedMenus.value.filter(menuId => {
                const menuInfo = menuMap.get(menuId);
                if (!menuInfo) return false;
                
                // 如果是叶子节点或者不是所有子节点都被选中，则需要提交
                if (!menuInfo.hasChildren) return true;
                
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
        const menuIdsToSubmit = getActualSelectedMenuIds();
        
        // 确保提交的菜单ID列表不为空
        if (menuIdsToSubmit.length === 0 && selectedMenus.value.length > 0) {
            // 如果过滤后的菜单ID为空但用户选中了菜单，则直接提交用户选中的菜单ID
            await assignRoleMenus(currentRole.value.roleId, { menuIds: selectedMenus.value });
        } else {
            // 正常提交过滤后的菜单ID
            await assignRoleMenus(currentRole.value.roleId, { menuIds: menuIdsToSubmit });
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