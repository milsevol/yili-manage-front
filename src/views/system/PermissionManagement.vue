<template>
    <div class="permission-management">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2>权限管理</h2>
            <p>管理系统权限信息，配置菜单权限和操作权限</p>
        </div>

        <!-- 搜索和操作区域 -->
        <a-card class="search-card">
            <a-form
                :model="searchForm"
                layout="inline"
                class="search-form"
            >
                <a-form-item label="权限名称">
                    <a-input
                        v-model:value="searchForm.name"
                        placeholder="请输入权限名称"
                        allow-clear
                        style="width: 200px"
                    />
                </a-form-item>
                <a-form-item label="权限编码">
                    <a-input
                        v-model:value="searchForm.code"
                        placeholder="请输入权限编码"
                        allow-clear
                        style="width: 200px"
                    />
                </a-form-item>
                <a-form-item label="权限类型">
                    <a-select
                        v-model:value="searchForm.type"
                        placeholder="请选择权限类型"
                        allow-clear
                        style="width: 150px"
                    >
                        <a-select-option value="menu">菜单权限</a-select-option>
                        <a-select-option value="button">按钮权限</a-select-option>
                        <a-select-option value="api">接口权限</a-select-option>
                    </a-select>
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
                        新增权限
                    </a-button>
                    <a-button @click="handleExpandAll">
                        <ApartmentOutlined />
                        展开全部
                    </a-button>
                </a-space>
            </div>
        </a-card>

        <!-- 权限树形表格 -->
        <a-card class="table-card">
            <a-table
                :columns="columns"
                :data-source="permissionList"
                :loading="loading"
                :pagination="false"
                :expanded-row-keys="expandedRowKeys"
                row-key="id"
                @expand="handleExpand"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'name'">
                        <div class="permission-name">
                            <component 
                                :is="getPermissionIcon(record.type)" 
                                class="permission-icon"
                            />
                            {{ record.name }}
                        </div>
                    </template>
                    
                    <template v-else-if="column.key === 'type'">
                        <a-tag :color="getTypeColor(record.type)">
                            {{ getTypeText(record.type) }}
                        </a-tag>
                    </template>
                    
                    <template v-else-if="column.key === 'status'">
                        <a-tag :color="record.status === 1 ? 'green' : 'red'">
                            {{ record.status === 1 ? '启用' : '禁用' }}
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
                                @click="handleAddChild(record)"
                                v-if="record.type === 'menu'"
                            >
                                <PlusOutlined />
                                添加子权限
                            </a-button>
                            <a-popconfirm
                                title="确定要删除这个权限吗？"
                                @confirm="handleDelete(record)"
                            >
                                <a-button 
                                    type="link" 
                                    size="small" 
                                    danger
                                    :disabled="record.children?.length > 0"
                                >
                                    <DeleteOutlined />
                                    删除
                                </a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <!-- 权限表单弹窗 -->
        <a-modal
            v-model:open="permissionModalVisible"
            :title="isEdit ? '编辑权限' : '新增权限'"
            width="600px"
            @ok="handlePermissionSubmit"
            @cancel="handlePermissionCancel"
        >
            <a-form
                ref="permissionFormRef"
                :model="permissionForm"
                :rules="permissionFormRules"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
            >
                <a-form-item label="上级权限" name="parentId" v-if="permissionForm.parentId">
                    <a-tree-select
                        v-model:value="permissionForm.parentId"
                        :tree-data="permissionTreeData"
                        placeholder="请选择上级权限"
                        tree-default-expand-all
                        :field-names="{ children: 'children', label: 'name', value: 'id' }"
                        disabled
                    />
                </a-form-item>
                
                <a-form-item label="权限名称" name="name">
                    <a-input v-model:value="permissionForm.name" placeholder="请输入权限名称" />
                </a-form-item>
                
                <a-form-item label="权限编码" name="code">
                    <a-input
                        v-model:value="permissionForm.code"
                        placeholder="请输入权限编码"
                        :disabled="isEdit"
                    />
                </a-form-item>
                
                <a-form-item label="权限类型" name="type">
                    <a-select
                        v-model:value="permissionForm.type"
                        placeholder="请选择权限类型"
                        :disabled="isEdit"
                    >
                        <a-select-option value="menu">菜单权限</a-select-option>
                        <a-select-option value="button">按钮权限</a-select-option>
                        <a-select-option value="api">接口权限</a-select-option>
                    </a-select>
                </a-form-item>
                
                <a-form-item label="路由路径" name="path" v-if="permissionForm.type === 'menu'">
                    <a-input v-model:value="permissionForm.path" placeholder="请输入路由路径" />
                </a-form-item>
                
                <a-form-item label="组件路径" name="component" v-if="permissionForm.type === 'menu'">
                    <a-input v-model:value="permissionForm.component" placeholder="请输入组件路径" />
                </a-form-item>
                
                <a-form-item label="图标" name="icon" v-if="permissionForm.type === 'menu'">
                    <a-input v-model:value="permissionForm.icon" placeholder="请输入图标名称" />
                </a-form-item>
                
                <a-form-item label="API路径" name="apiPath" v-if="permissionForm.type === 'api'">
                    <a-input v-model:value="permissionForm.apiPath" placeholder="请输入API路径" />
                </a-form-item>
                
                <a-form-item label="HTTP方法" name="method" v-if="permissionForm.type === 'api'">
                    <a-select v-model:value="permissionForm.method" placeholder="请选择HTTP方法">
                        <a-select-option value="GET">GET</a-select-option>
                        <a-select-option value="POST">POST</a-select-option>
                        <a-select-option value="PUT">PUT</a-select-option>
                        <a-select-option value="DELETE">DELETE</a-select-option>
                    </a-select>
                </a-form-item>
                
                <a-form-item label="排序" name="sort">
                    <a-input-number
                        v-model:value="permissionForm.sort"
                        :min="0"
                        :max="9999"
                        placeholder="请输入排序值"
                        style="width: 100%"
                    />
                </a-form-item>
                
                <a-form-item label="状态" name="status">
                    <a-radio-group v-model:value="permissionForm.status">
                        <a-radio :value="1">启用</a-radio>
                        <a-radio :value="0">禁用</a-radio>
                    </a-radio-group>
                </a-form-item>
                
                <a-form-item label="描述" name="description">
                    <a-textarea
                        v-model:value="permissionForm.description"
                        placeholder="请输入权限描述"
                        :rows="3"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, h } from 'vue';
import { message } from 'ant-design-vue';
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ApartmentOutlined,
    MenuOutlined,
    AppstoreOutlined,
    ApiOutlined,
    KeyOutlined
} from '@ant-design/icons-vue';
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu.js';

// 搜索表单
const searchForm = reactive({
    name: '',
    code: '',
    type: undefined
});

// 权限列表
const permissionList = ref([]);
const loading = ref(false);
const expandedRowKeys = ref([]);
const expandedAll = ref(false);

// 表格列配置
const columns = [
    {
        title: '权限名称',
        key: 'name',
        width: 250
    },
    {
        title: '权限编码',
        dataIndex: 'code',
        key: 'code',
        width: 200
    },
    {
        title: '权限类型',
        key: 'type',
        width: 120,
        align: 'center'
    },
    {
        title: '路由路径',
        dataIndex: 'path',
        key: 'path',
        width: 200
    },
    {
        title: '排序',
        dataIndex: 'sort',
        key: 'sort',
        width: 80,
        align: 'center'
    },
    {
        title: '状态',
        key: 'status',
        width: 100,
        align: 'center'
    },
    {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180
    },
    {
        title: '操作',
        key: 'action',
        width: 250,
        fixed: 'right'
    }
];

// 权限表单
const permissionModalVisible = ref(false);
const isEdit = ref(false);
const isAddChild = ref(false);
const permissionFormRef = ref();
const permissionForm = reactive({
    id: null,
    parentId: null,
    name: '',
    code: '',
    type: 'menu',
    path: '',
    component: '',
    icon: '',
    apiPath: '',
    method: 'GET',
    sort: 0,
    status: 1,
    description: ''
});

// 弹窗标题
const modalTitle = computed(() => {
    if (isAddChild.value) return '添加子权限';
    return isEdit.value ? '编辑权限' : '新增权限';
});

// 上级权限选项
const parentPermissionOptions = computed(() => {
    const buildOptions = (list, level = 0) => {
        return list.map(item => ({
            title: item.name,
            value: item.id,
            key: item.id,
            disabled: item.type !== 'menu' || level >= 2, // 只允许菜单类型且最多2级
            children: item.children ? buildOptions(item.children, level + 1) : undefined
        }));
    };
    return buildOptions(permissionList.value.filter(item => item.type === 'menu'));
});

// 表单验证规则
const permissionFormRules = {
    name: [
        { required: true, message: '请输入权限名称', trigger: 'blur' },
        { min: 2, max: 50, message: '权限名称长度为2-50个字符', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入权限编码', trigger: 'blur' },
        { pattern: /^[a-zA-Z][a-zA-Z0-9_:]*$/, message: '权限编码只能包含字母、数字、下划线和冒号，且以字母开头', trigger: 'blur' }
    ],
    type: [
        { required: true, message: '请选择权限类型', trigger: 'change' }
    ],
    path: [
        { required: true, message: '请输入路由路径', trigger: 'blur' }
    ],
    apiPath: [
        { required: true, message: '请输入API路径', trigger: 'blur' }
    ],
    method: [
        { required: true, message: '请选择HTTP方法', trigger: 'change' }
    ],
    sort: [
        { required: true, message: '请输入排序', trigger: 'blur' },
        { type: 'number', min: 0, message: '排序必须大于等于0', trigger: 'blur' }
    ]
};

// 获取权限图标
const getPermissionIcon = (type) => {
    const iconMap = {
        menu: MenuOutlined,
        button: AppstoreOutlined,
        api: ApiOutlined
    };
    return iconMap[type] || KeyOutlined;
};

// 获取类型颜色
const getTypeColor = (type) => {
    const colorMap = {
        menu: 'blue',
        button: 'green',
        api: 'orange'
    };
    return colorMap[type] || 'default';
};

// 获取类型文本
const getTypeText = (type) => {
    const textMap = {
        menu: '菜单权限',
        button: '按钮权限',
        api: '接口权限'
    };
    return textMap[type] || '未知类型';
};

// 获取权限树
const fetchPermissionList = async () => {
    loading.value = true;
    try {
        const response = await getMenuTree(searchForm);
        permissionList.value = response.data || [];
        
        // 如果是展开全部状态，重新设置展开的行
        if (expandedAll.value) {
            setAllExpanded(true);
        }
    } catch (error) {
        message.error('获取权限列表失败');
    } finally {
        loading.value = false;
    }
};

// 搜索
const handleSearch = () => {
    fetchPermissionList();
};

// 重置
const handleReset = () => {
    Object.assign(searchForm, {
        name: '',
        code: '',
        type: undefined
    });
    fetchPermissionList();
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
                keys.push(item.id);
                keys = keys.concat(getAllKeys(item.children));
            }
        });
        return keys;
    };
    
    expandedRowKeys.value = expanded ? getAllKeys(permissionList.value) : [];
};

// 展开/收起行
const handleExpand = (expanded, record) => {
    if (expanded) {
        expandedRowKeys.value.push(record.id);
    } else {
        const index = expandedRowKeys.value.indexOf(record.id);
        if (index > -1) {
            expandedRowKeys.value.splice(index, 1);
        }
    }
};

// 新增权限
const handleAdd = () => {
    isEdit.value = false;
    isAddChild.value = false;
    permissionModalVisible.value = true;
    resetPermissionForm();
};

// 添加子权限
const handleAddChild = (record) => {
    isEdit.value = false;
    isAddChild.value = true;
    permissionModalVisible.value = true;
    resetPermissionForm();
    permissionForm.parentId = record.id;
};

// 编辑权限
const handleEdit = (record) => {
    isEdit.value = true;
    isAddChild.value = false;
    permissionModalVisible.value = true;
    Object.assign(permissionForm, record);
};

// 删除权限
const handleDelete = async (record) => {
    try {
        await deleteMenu(record.id);
        message.success('删除成功');
        fetchPermissionList();
    } catch (error) {
        message.error('删除失败');
    }
};

// 权限表单提交
const handlePermissionSubmit = async () => {
    try {
        await permissionFormRef.value.validate();
        
        if (isEdit.value) {
            await updateMenu(permissionForm.id, permissionForm);
            message.success('更新成功');
        } else {
            await createMenu(permissionForm);
            message.success('创建成功');
        }
        
        permissionModalVisible.value = false;
        fetchPermissionList();
    } catch (error) {
        if (error.errorFields) {
            message.error('请检查表单输入');
        } else {
            message.error(isEdit.value ? '更新失败' : '创建失败');
        }
    }
};

// 权限表单取消
const handlePermissionCancel = () => {
    permissionModalVisible.value = false;
    resetPermissionForm();
};

// 重置权限表单
const resetPermissionForm = () => {
    Object.assign(permissionForm, {
        id: null,
        parentId: null,
        name: '',
        code: '',
        type: 'menu',
        path: '',
        component: '',
        icon: '',
        apiPath: '',
        method: 'GET',
        sort: 0,
        status: 1,
        description: ''
    });
    permissionFormRef.value?.resetFields();
};

onMounted(() => {
    fetchPermissionList();
});
</script>

<style scoped lang="less">
.permission-management {
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
        
        .permission-name {
            display: flex;
            align-items: center;
            
            .permission-icon {
                margin-right: 8px;
                color: #1890ff;
            }
        }
    }
}

// 响应式处理
@media (max-width: 768px) {
    .permission-management {
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