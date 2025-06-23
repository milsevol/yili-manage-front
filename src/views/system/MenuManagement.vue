<template>
    <div class="menu-management">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2>菜单管理</h2>
            <p>管理系统菜单信息，配置菜单结构和权限。右键点击节点可进行操作</p>
        </div>

        <!-- 操作区域 -->
        <a-card class="action-card">
            <div class="action-buttons">
                <a-space>
                    <a-button type="primary" @click="handleAddRootMenu">
                        <PlusOutlined />
                        新增根菜单
                    </a-button>
                    <a-button @click="handleExpandAll">
                        <ApartmentOutlined />
                        {{ expandedAll ? '收起全部' : '展开全部' }}
                    </a-button>
                    <a-button @click="handleRefresh">
                        <ReloadOutlined />
                        刷新
                    </a-button>
                </a-space>
            </div>
        </a-card>

        <!-- 菜单树 -->
        <a-card class="tree-card">
            <a-tree
                :tree-data="menuTreeData"
                :expanded-keys="expandedKeys"
                :selected-keys="selectedKeys"
                show-icon
                block-node
                @expand="onExpand"
                @select="onSelect"
                @right-click="onRightClick"
            >
                <template #icon="{ dataRef }">
                    <span :style="{ color: dataRef ? getNodeColor(dataRef) : '#1890ff' }">
                        <component :is="iconMap[getNodeIcon(dataRef)]" />
                    </span>
                </template>
                <template #title="{ dataRef }">
                    <div class="tree-node-title" v-if="dataRef">
                        <span class="node-name">{{ dataRef.title || '未命名' }}</span>
                        <a-tag 
                            :color="getTypeColor(dataRef.type || 'menu')" 
                            size="small" 
                            class="node-type"
                        >
                            {{ getTypeText(dataRef.type || 'menu') }}
                        </a-tag>
                        <a-tag 
                            :color="(dataRef.status === 1 || dataRef.status === undefined) ? 'green' : 'red'" 
                            size="small"
                            class="node-status"
                        >
                            {{ (dataRef.status === 1 || dataRef.status === undefined) ? '启用' : '禁用' }}
                        </a-tag>
                    </div>
                </template>
            </a-tree>
            <div v-if="menuTreeData.length === 0" style="text-align: center; padding: 20px; color: #999;">
                暂无菜单数据
            </div>
        </a-card>

        <!-- 右键菜单 -->
        <a-dropdown
            v-model:open="contextMenuVisible"
            :trigger="['contextmenu']"
            placement="bottomLeft"
        >
            <div
                :style="{
                    position: 'fixed',
                    left: contextMenuPosition.x + 'px',
                    top: contextMenuPosition.y + 'px',
                    width: '1px',
                    height: '1px',
                    pointerEvents: 'none'
                }"
            ></div>
            <template #overlay>
                <a-menu @click="handleContextMenuClick">
                    <a-menu-item key="add" v-if="canAddChild">
                        <PlusOutlined />
                        {{ getAddMenuText() }}
                    </a-menu-item>
                    <a-menu-item key="edit" v-if="selectedNode">
                        <EditOutlined />
                        编辑
                    </a-menu-item>
                    <a-menu-divider v-if="selectedNode" />
                    <a-menu-item key="delete" v-if="selectedNode && canDelete" danger>
                        <DeleteOutlined />
                        删除
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>

        <!-- 菜单表单弹窗 -->
        <a-modal
            v-model:open="menuModalVisible"
            :title="modalTitle"
            width="600px"
            @ok="handleMenuSubmit"
            @cancel="handleMenuCancel"
        >
            <a-form
                ref="menuFormRef"
                :model="menuForm"
                :rules="menuFormRules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
            >
                <a-form-item label="上级菜单" name="parentId" v-if="menuForm.parentId">
                    <a-input :value="getParentNodeName()" disabled />
                </a-form-item>
                
                <a-form-item label="名称" name="name">
                    <a-input v-model:value="menuForm.name" :placeholder="getNamePlaceholder()" />
                </a-form-item>
                
                <a-form-item label="编码" name="code">
                    <a-input
                        v-model:value="menuForm.code"
                        :placeholder="getCodePlaceholder()"
                        :disabled="isEdit"
                    />
                </a-form-item>
                
                <a-form-item label="类型" name="type">
                    <a-select
                        v-model:value="menuForm.type"
                        placeholder="请选择类型"
                        :disabled="isEdit || typeDisabled"
                    >
                        <a-select-option value="menu" v-if="!isThirdLevel">菜单</a-select-option>
                        <a-select-option value="permission" v-if="isThirdLevel">权限</a-select-option>
                    </a-select>
                </a-form-item>
                
                <a-form-item label="路由路径" name="path" v-if="menuForm.type === 'menu'">
                    <a-input v-model:value="menuForm.path" placeholder="请输入路由路径" />
                </a-form-item>
                
                <a-form-item label="组件路径" name="component" v-if="menuForm.type === 'menu'">
                    <a-input v-model:value="menuForm.component" placeholder="请输入组件路径" />
                </a-form-item>
                
                <a-form-item label="图标" name="icon" v-if="menuForm.type === 'menu'">
                    <a-input v-model:value="menuForm.icon" placeholder="请输入图标名称" />
                </a-form-item>
                
                <a-form-item label="权限标识" name="permission" v-if="menuForm.type === 'permission'">
                    <a-input v-model:value="menuForm.permission" placeholder="请输入权限标识，如：user:add" />
                </a-form-item>
                
                <a-form-item label="排序" name="sort">
                    <a-input-number
                        v-model:value="menuForm.sort"
                        :min="0"
                        :max="9999"
                        placeholder="请输入排序值"
                        style="width: 100%"
                    />
                </a-form-item>
                
                <a-form-item label="状态" name="status">
                    <a-radio-group v-model:value="menuForm.status">
                        <a-radio :value="1">启用</a-radio>
                        <a-radio :value="0">禁用</a-radio>
                    </a-radio-group>
                </a-form-item>
                
                <a-form-item label="描述" name="description">
                    <a-textarea
                        v-model:value="menuForm.description"
                        :placeholder="getDescriptionPlaceholder()"
                        :rows="3"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ApartmentOutlined,
    MenuOutlined,
    AppstoreOutlined,
    KeyOutlined,
    ReloadOutlined,
    FolderOutlined,
    FileOutlined
} from '@ant-design/icons-vue';

// 图标映射表，确保字符串能映射到组件
const iconMap = {
    FolderOutlined,
    FileOutlined,
    KeyOutlined
};
defineExpose({ iconMap });
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu.js';

// 菜单树数据
const menuList = ref([]);
const loading = ref(false);
const expandedAll = ref(false);
const expandedKeys = ref([]);
const selectedKeys = ref([]);

// 右键菜单
const contextMenuVisible = ref(false);
const contextMenuPosition = reactive({ x: 0, y: 0 });
const selectedNode = ref(null);

// 计算属性
const menuTreeData = computed(() => {
    console.log('计算menuTreeData，原始数据:', menuList.value);
    
    const buildTreeData = (list) => {
        if (!list || !Array.isArray(list)) {
            return [];
        }
        return list.map(item => {
            const nodeType = item.menuType === 'OPERATE' ? 'permission' : 'menu';
            const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
            
            const treeNode = {
                key: item.menuId,
                title: item.menuName,
                type: nodeType,
                status: 1,
                path: item.menuUrl || '',
                permission: item.menuPermissionstrs || '',
                sort: item.menuOrdernum || 0,
                parentId: item.menuParentId,
                level: item.menuLevel,
                isLeaf: !hasChildren
            };
            
            if (item.menuUrl) {
                treeNode.component = item.menuUrl;
            }
            
            if (hasChildren) {
                treeNode.children = buildTreeData(item.children);
            }
            
            // 关键修正：icon 赋值为字符串
            if (nodeType === 'permission') {
                treeNode.icon = 'KeyOutlined';
            } else if (!hasChildren) {
                treeNode.icon = 'FileOutlined';
            } else {
                treeNode.icon = 'FolderOutlined';
            }
            
            return treeNode;
        });
    };
    
    if (!menuList.value || !Array.isArray(menuList.value) || menuList.value.length === 0) {
        return [];
    }
    
    const result = buildTreeData(menuList.value);
    console.log('最终的menuTreeData:', result);
    return result;
});

const canAddChild = computed(() => {
    if (!selectedNode.value) return false;
    const level = getNodeLevel(selectedNode.value);
    return level < 2;
});

const canDelete = computed(() => {
    if (!selectedNode.value) return false;
    return !selectedNode.value.children || selectedNode.value.children.length === 0;
});

const isThirdLevel = computed(() => {
    if (!menuForm.parentId) return false;
    const parentNode = findNodeById(menuTreeData.value, menuForm.parentId);
    return parentNode ? getNodeLevel(parentNode) === 1 : false;
});

const typeDisabled = computed(() => {
    return isThirdLevel.value || (menuForm.parentId && getNodeLevel(findNodeById(menuTreeData.value, menuForm.parentId)) > 0);
});

// 菜单表单
const menuModalVisible = ref(false);
const isEdit = ref(false);
const menuFormRef = ref();
const menuForm = reactive({
    id: null,
    parentId: null,
    name: '',
    code: '',
    type: 'menu',
    path: '',
    component: '',
    icon: '',
    permission: '',
    sort: 0,
    status: 1,
    description: ''
});

// 弹窗标题
const modalTitle = computed(() => {
    if (!menuForm.parentId) return '新增根菜单';
    return isEdit.value ? '编辑' + getTypeText(menuForm.type) : '新增' + getTypeText(menuForm.type);
});

// 表单验证规则
const menuFormRules = {
    name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 2, max: 50, message: '名称长度为2-50个字符', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入编码', trigger: 'blur' },
        { pattern: /^[a-zA-Z][a-zA-Z0-9_:]*$/, message: '编码只能包含字母、数字、下划线和冒号，且以字母开头', trigger: 'blur' }
    ],
    type: [
        { required: true, message: '请选择类型', trigger: 'change' }
    ],
    path: [
        { required: true, message: '请输入路由路径', trigger: 'blur', type: 'string' }
    ],
    component: [
        { required: true, message: '请输入组件路径', trigger: 'blur', type: 'string' }
    ],
    permission: [
        { required: true, message: '请输入权限标识', trigger: 'blur', type: 'string' }
    ],
    sort: [
        { required: true, message: '请输入排序', trigger: 'blur' },
        { type: 'number', min: 0, message: '排序必须大于等于0', trigger: 'blur' }
    ]
};

// 获取节点图标
const getNodeIcon = (node) => {
    if (!node) return 'FolderOutlined';
    if (node.type === 'permission') return 'KeyOutlined';
    if (!node.children || (Array.isArray(node.children) && node.children.length === 0)) return 'FileOutlined';
    return 'FolderOutlined';
};

// 获取节点颜色
const getNodeColor = (node) => {
    if (node.type === 'permission') return '#722ed1';
    return node.children ? '#1890ff' : '#52c41a';
};

// 获取类型颜色
const getTypeColor = (type) => {
    const colorMap = {
        menu: 'blue',
        permission: 'purple'
    };
    return colorMap[type] || 'default';
};

// 获取类型文本
const getTypeText = (type) => {
    const textMap = {
        menu: '菜单',
        permission: '权限'
    };
    return textMap[type] || '未知类型';
};

// 获取父节点名称
const getParentNodeName = () => {
    if (!menuForm.parentId) return '';
    const parentNode = findNodeById(menuTreeData.value, menuForm.parentId);
    return parentNode ? parentNode.title : '';
};

// 获取占位符文本
const getNamePlaceholder = () => `请输入${getTypeText(menuForm.type)}名称`;
const getCodePlaceholder = () => `请输入${getTypeText(menuForm.type)}编码`;
const getDescriptionPlaceholder = () => `请输入${getTypeText(menuForm.type)}描述`;

// 获取添加菜单文本
const getAddMenuText = () => {
    if (!selectedNode.value) return '新增根菜单';
    const level = getNodeLevel(selectedNode.value);
    return level === 1 ? '添加权限' : '添加子菜单';
};

// 获取节点层级
const getNodeLevel = (node) => {
    let level = 0;
    let current = node;
    while (current.parent) {
        level++;
        current = current.parent;
    }
    return level;
};

// 根据ID查找节点
const findNodeById = (nodes, id) => {
    for (const node of nodes) {
        if (node.key === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

// 获取菜单树
const fetchMenuList = async () => {
    loading.value = true;
    try {
        const response = await getMenuTree();
        console.log('API响应:', response);
        console.log('菜单数据:', response.data);
        console.log('数据类型:', typeof response.data);
        console.log('是否为数组:', Array.isArray(response.data));
        
        // 确保数据正确赋值
        if (response && response.data && Array.isArray(response.data)) {
            menuList.value = response.data;
        } else {
            console.warn('API返回的数据格式不正确:', response);
            menuList.value = [];
        }
        console.log('设置后的menuList:', menuList.value);
        console.log('menuList长度:', menuList.value.length);
        
        // 如果是展开全部状态，重新设置展开的键
        if (expandedAll.value) {
            setAllExpanded(true);
        }
    } catch (error) {
        console.error('获取菜单列表失败:', error);
        message.error('获取菜单列表失败');
    } finally {
        loading.value = false;
    }
};

// 刷新
const handleRefresh = () => {
    fetchMenuList();
};

// 展开/收起全部
const handleExpandAll = () => {
    expandedAll.value = !expandedAll.value;
    setAllExpanded(expandedAll.value);
};

// 设置全部展开/收起
const setAllExpanded = (expanded) => {
    const getAllKeys = (list) => {
        let keys = [];
        list.forEach(item => {
            if (item.children && item.children.length > 0) {
                keys.push(item.key);
                keys = keys.concat(getAllKeys(item.children));
            }
        });
        return keys;
    };
    
    expandedKeys.value = expanded ? getAllKeys(menuTreeData.value) : [];
};

// 展开/收起节点
const onExpand = (keys) => {
    expandedKeys.value = keys;
    expandedAll.value = keys.length > 0;
};

// 选择节点
const onSelect = (keys, info) => {
    selectedKeys.value = keys;
    selectedNode.value = info.node;
};

// 右键点击节点
const onRightClick = ({ event, node }) => {
    event.preventDefault();
    selectedKeys.value = [node.key];
    selectedNode.value = node;
    contextMenuPosition.x = event.clientX;
    contextMenuPosition.y = event.clientY;
    contextMenuVisible.value = true;
};

// 处理右键菜单点击
const handleContextMenuClick = ({ key }) => {
    contextMenuVisible.value = false;
    switch (key) {
        case 'add':
            handleAdd();
            break;
        case 'edit':
            handleEdit();
            break;
        case 'delete':
            handleDelete();
            break;
    }
};

// 新增根菜单
const handleAddRootMenu = () => {
    selectedNode.value = null;
    selectedKeys.value = [];
    handleAdd();
};

// 新增菜单
const handleAdd = () => {
    isEdit.value = false;
    menuModalVisible.value = true;
    resetMenuForm();
    
    if (selectedNode.value) {
        menuForm.parentId = selectedNode.value.key;
        menuForm.type = getNodeLevel(selectedNode.value) === 1 ? 'permission' : 'menu';
    }
};

// 编辑菜单
const handleEdit = () => {
    if (!selectedNode.value) return;
    
    isEdit.value = true;
    menuModalVisible.value = true;
    
    const node = selectedNode.value;
    Object.assign(menuForm, {
        id: node.key,
        parentId: node.parentId,
        name: node.title,
        code: node.code,
        type: node.type,
        path: node.path,
        component: node.component,
        icon: node.icon,
        permission: node.permission,
        sort: node.sort,
        status: node.status,
        description: node.description
    });
};

// 删除菜单
const handleDelete = async () => {
    if (!selectedNode.value || !canDelete.value) return;
    
    try {
        await deleteMenu(selectedNode.value.key);
        message.success('删除成功');
        selectedNode.value = null;
        selectedKeys.value = [];
        fetchMenuList();
    } catch (error) {
        message.error('删除失败');
    }
};

// 菜单表单提交
const handleMenuSubmit = async () => {
    try {
        await menuFormRef.value.validate();
        
        if (isEdit.value) {
            await updateMenu(menuForm.id, menuForm);
            message.success('更新成功');
        } else {
            await createMenu(menuForm);
            message.success('创建成功');
        }
        
        menuModalVisible.value = false;
        fetchMenuList();
    } catch (error) {
        if (error.errorFields) {
            message.error('请检查表单输入');
        } else {
            message.error(isEdit.value ? '更新失败' : '创建失败');
        }
    }
};

// 菜单表单取消
const handleMenuCancel = () => {
    menuModalVisible.value = false;
    resetMenuForm();
};

// 重置菜单表单
const resetMenuForm = () => {
    Object.assign(menuForm, {
        id: null,
        parentId: null,
        name: '',
        code: '',
        type: 'menu',
        path: '',
        component: '',
        icon: '',
        permission: '',
        sort: 0,
        status: 1,
        description: ''
    });
    menuFormRef.value?.resetFields();
};

onMounted(() => {
    fetchMenuList();
});
</script>

<style scoped lang="less">
.menu-management {
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
    
    .action-card {
        margin-bottom: 16px;
        
        .action-buttons {
            text-align: right;
        }
    }
    
    .tree-card {
        min-height: 400px;
        
        :deep(.ant-tree) {
            .ant-tree-node-content-wrapper {
                padding: 8px 12px;
                border-radius: 6px;
                transition: all 0.3s;
                
                &:hover {
                    background-color: #f5f5f5;
                }
                
                &.ant-tree-node-selected {
                    background-color: #e6f7ff;
                    border-color: #91d5ff;
                }
            }
            
            .ant-tree-iconEle {
                margin-right: 8px;
            }
            
            .ant-tree-title {
                width: 100%;
            }
        }
        
        .tree-node-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            
            .node-name {
                flex: 1;
                font-weight: 500;
                color: #262626;
            }
            
            .node-type {
                margin-left: 8px;
            }
            
            .node-status {
                margin-left: 4px;
            }
        }
    }
}

// 响应式处理
@media (max-width: 768px) {
    .menu-management {
        .action-card {
            .action-buttons {
                text-align: left;
            }
        }
        
        .tree-card {
            :deep(.ant-tree) {
                .tree-node-title {
                    flex-direction: column;
                    align-items: flex-start;
                    
                    .node-name {
                        margin-bottom: 4px;
                    }
                    
                    .node-type,
                    .node-status {
                        margin-left: 0;
                        margin-right: 4px;
                    }
                }
            }
        }
    }
}
</style>