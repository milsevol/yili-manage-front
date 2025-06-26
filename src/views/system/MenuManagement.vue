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
                show-line
                @expand="onExpand"
                @select="onSelect"
                @right-click="onRightClick"
            >
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
                <a-form-item label="上级菜单" name="menuParentId" v-if="menuForm.menuParentId">
                    <a-input :value="getParentNodeName()" disabled />
                </a-form-item>
                
                <a-form-item label="名称" name="menuName">
                    <a-input v-model:value="menuForm.menuName" :placeholder="getNamePlaceholder()" />
                </a-form-item>
                
                <a-form-item label="类型" name="menuType">
                    <a-select
                        v-model:value="menuForm.menuType"
                        placeholder="请选择类型"
                        disabled
                    >
                        <a-select-option value="menu">菜单</a-select-option>
                        <a-select-option value="operate">操作</a-select-option>
                    </a-select>
                    <div style="color: #999; font-size: 12px; margin-top: 4px;">
                        类型根据节点层级自动设置：1、2级为菜单，3级为操作
                    </div>
                </a-form-item>
                
                <a-form-item label="路由路径" name="menuUrl" v-if="menuForm.menuType === 'MENU'">
                    <a-input v-model:value="menuForm.menuUrl" placeholder="请输入路由路径" />
                </a-form-item>
                
                <a-form-item label="权限标识" name="menuPermissionstrs" v-if="menuForm.menuType === 'OPERATE'">
                    <a-input v-model:value="menuForm.menuPermissionstrs" placeholder="请输入权限标识，如：user:add" />
                </a-form-item>
                
                <a-form-item label="排序" name="menuOrdernum">
                    <a-input-number
                        v-model:value="menuForm.menuOrdernum"
                        :min="0"
                        :max="9999"
                        placeholder="请输入排序值"
                        style="width: 100%"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';


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
            const nodeType = item.menuType === 'OPERATE' ? 'OPERATE' : 'MENU';
            const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
            
            const treeNode = {
                key: item.menuId,
                title: item.menuName,
                type: nodeType,
                path: item.menuUrl || '',
                menuPermissionstrs: item.menuPermissionstrs || '',
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

// 菜单表单
const menuModalVisible = ref(false);
const isEdit = ref(false);
const menuFormRef = ref();
const menuForm = reactive({
    id: null,
    menuParentId: null,
    menuName: '',
    menuType: 'MENU',
    menuUrl: '',
    menuPermissionstrs: '',
    menuOrdernum: 0
});

// 弹窗标题
const modalTitle = computed(() => {
    if (isEdit.value) return '编辑菜单';
    if (!menuForm.menuParentId) return '添加根菜单';
    return `添加${menuForm.menuType === 'OPERATE' ? '权限' : '菜单'}`;
});

// 表单验证规则
const menuFormRules = {
    menuName: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 2, max: 50, message: '名称长度为2-50个字符', trigger: 'blur' }
    ],
    menuType: [
        { required: true, message: '请选择类型', trigger: 'change' }
    ],
    menuUrl: [
        { required: true, message: '请输入路由路径', trigger: 'blur', type: 'string' }
    ],
    menuPermissionstrs: [
        { required: true, message: '请输入权限标识', trigger: 'blur', type: 'string' }
    ],
    menuOrdernum: [
        { required: true, message: '请输入排序', trigger: 'blur' },
        { type: 'number', min: 0, message: '排序必须大于等于0', trigger: 'blur' }
    ]
};

// 获取父节点名称
const getParentNodeName = () => {
    if (!menuForm.menuParentId) return '无';
    const node = findNodeById(menuTreeData.value, menuForm.menuParentId);
    return node ? node.title : '无';
};

// 获取名称占位符
const getNamePlaceholder = () => {
    if (menuForm.menuType === 'MENU') return '请输入菜单名称';
    if (menuForm.menuType === 'OPERATE') return '请输入权限名称';
    return '请输入名称';
};

// 获取添加菜单文本
const getAddMenuText = () => {
    if (!selectedNode.value) return '添加根菜单';
    
    // 根据选中节点的层级决定添加的是菜单还是操作
    const level = getNodeLevel(selectedNode.value);
    if (level === 0 ) {
        return '添加菜单';
    } else if (level === 1) {
        return '添加操作';
    }
    
    return '添加菜单';
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
    resetMenuForm();
    isEdit.value = false;
    menuModalVisible.value = true;
    
    if (selectedNode.value) {
        const node = selectedNode.value;
        const level = getNodeLevel(node);
        
        menuForm.menuParentId = node.key;
        
        // 根据层级自动设置类型：1、2级为菜单，3级为操作
        if (level === 0 ) {
            menuForm.menuType = 'MENU';
        } else if (level === 1) {
            menuForm.menuType = 'OPERATE';
        }
    } else {
        // 添加根菜单
        menuForm.menuParentId = null;
        menuForm.menuType = 'MENU';
    }
    
    console.log('添加菜单表单数据:', menuForm);
};

// 编辑菜单
const handleEdit = () => {
    if (!selectedNode.value) return;
    
    isEdit.value = true;
    menuModalVisible.value = true;
    
    const node = selectedNode.value;
    const level = getNodeLevel(node);
    
    // 根据层级自动设置类型：1、2级为菜单，3级为操作
    const menuType = level >= 2 ? 'OPERATE' : 'MENU';
    
    Object.assign(menuForm, {
        id: node.key,
        menuParentId: node.parentId,
        menuName: node.title,
        menuType: menuType, // 使用根据层级计算的类型，而不是节点原有的类型
        menuUrl: node.path,
        menuPermissionstrs: node.menuPermissionstrs,
        menuOrdernum: node.sort
    });
    
    console.log('编辑菜单表单数据:', menuForm);
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
        
        // 准备API数据
        const apiData = {
            id: menuForm.id,
            menuParentId: menuForm.menuParentId,
            menuName: menuForm.menuName,
            menuType: menuForm.menuType.toUpperCase(), // 转为大写以匹配后端枚举
            menuUrl: menuForm.menuUrl,
            menuPermissionstrs: menuForm.menuPermissionstrs,
            menuOrdernum: menuForm.menuOrdernum,
            menuLevel: menuForm.menuParentId ? (findNodeById(menuTreeData.value, menuForm.menuParentId)?.level + 1 || 1) : 0
        };
        
        // 移除id字段，因为创建时不需要
        if (!isEdit.value) {
            delete apiData.id;
        }
        
        if (isEdit.value) {
            await updateMenu(menuForm.id, apiData);
            message.success('更新成功');
        } else {
            await createMenu(apiData);
            message.success('创建成功');
        }
        
        menuModalVisible.value = false;
        fetchMenuList();
    } catch (error) {
        console.error('提交失败:', error);
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
        menuParentId: null,
        menuName: '',
        menuType: 'MENU',
        menuUrl: '',
        menuPermissionstrs: '',
        menuOrdernum: 0
    });
    menuFormRef.value?.resetFields();
    
    console.log('重置菜单表单');
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