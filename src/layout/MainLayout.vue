<template>
    <ALayout class="main-layout">
        <!-- 侧边栏 -->
        <ALayoutSider
            v-model:collapsed="collapsed"
            :trigger="null"
            collapsible
            width="240"
            class="sidebar"
        >
            <div class="logo">
                <h3 v-if="!collapsed">管理后台</h3>
                <h3 v-else>后台</h3>
            </div>
            <AMenu
                v-model:selectedKeys="selectedKeys"
                v-model:openKeys="openKeys"
                mode="inline"
                theme="dark"
                :items="menuItems"
                @click="handleMenuClick"
            />
        </ALayoutSider>
        
        <!-- 主内容区 -->
        <ALayout>
            <!-- 顶部导航 -->
            <ALayoutHeader class="header">
                <div class="header-left">
                    <AButton
                        type="text"
                        :icon="h(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)"
                        @click="() => (collapsed = !collapsed)"
                        class="trigger"
                    />
                    <ABreadcrumb class="breadcrumb">
                        <ABreadcrumbItem v-for="item in breadcrumbItems" :key="item.path">
                            {{ item.title }}
                        </ABreadcrumbItem>
                    </ABreadcrumb>
                </div>
                <div class="header-right">
                    <ADropdown>
                        <AButton type="text" class="user-info">
                            <UserOutlined />
                            <span class="username">{{ currentUser.username || 'Admin' }}</span>
                            <DownOutlined />
                        </AButton>
                        <template #overlay>
                            <AMenu>
                                <AMenuItem key="profile">
                                    <UserOutlined />
                                    个人信息
                                </AMenuItem>
                                <AMenuItem key="settings">
                                    <SettingOutlined />
                                    系统设置
                                </AMenuItem>
                                <AMenuDivider />
                                <AMenuItem key="logout" @click="handleLogout">
                                    <LogoutOutlined />
                                    退出登录
                                </AMenuItem>
                            </AMenu>
                        </template>
                    </ADropdown>
                </div>
            </ALayoutHeader>
            
            <!-- 内容区域 -->
            <ALayoutContent class="content">
                <div class="content-wrapper">
                    <router-view />
                </div>
            </ALayoutContent>
        </ALayout>
    </ALayout>
</template>

<script setup>
import { ref, reactive, h, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DownOutlined,
    SettingOutlined,
    LogoutOutlined,
    DashboardOutlined,
    TeamOutlined,
    SafetyOutlined,
    KeyOutlined
} from '@ant-design/icons-vue';
import { logout, getCurrentUser } from '@/api/user.js';

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref([]);
const openKeys = ref(['system']);
const currentUser = reactive({ username: '' });

// 菜单配置
const menuItems = [
    {
        key: 'dashboard',
        icon: h(DashboardOutlined),
        label: '首页',
        title: '首页'
    },
    {
        key: 'system',
        icon: h(SettingOutlined),
        label: '系统管理',
        title: '系统管理',
        children: [
            {
                key: 'user-management',
                icon: h(TeamOutlined),
                label: '用户管理',
                title: '用户管理'
            },
            {
                key: 'role-management',
                icon: h(SafetyOutlined),
                label: '角色管理',
                title: '角色管理'
            },
            {
                key: 'permission-management',
                icon: h(KeyOutlined),
                label: '权限管理',
                title: '权限管理'
            }
        ]
    }
];

// 面包屑导航
const breadcrumbItems = computed(() => {
    const items = [{ title: '首页', path: '/dashboard' }];
    
    if (route.path !== '/dashboard') {
        const currentMenu = findMenuByKey(selectedKeys.value[0]);
        if (currentMenu) {
            // 如果是子菜单，添加父菜单
            const parentMenu = findParentMenu(selectedKeys.value[0]);
            if (parentMenu) {
                items.push({ title: parentMenu.title, path: parentMenu.key });
            }
            items.push({ title: currentMenu.title, path: currentMenu.key });
        }
    }
    
    return items;
});

// 查找菜单项
const findMenuByKey = (key) => {
    for (const item of menuItems) {
        if (item.key === key) return item;
        if (item.children) {
            for (const child of item.children) {
                if (child.key === key) return child;
            }
        }
    }
    return null;
};

// 查找父菜单
const findParentMenu = (key) => {
    for (const item of menuItems) {
        if (item.children) {
            for (const child of item.children) {
                if (child.key === key) return item;
            }
        }
    }
    return null;
};

// 菜单点击处理
const handleMenuClick = ({ key }) => {
    selectedKeys.value = [key];
    
    // 路由映射
    const routeMap = {
        'dashboard': '/dashboard',
        'user-management': '/system/user',
        'role-management': '/system/role',
        'permission-management': '/system/permission'
    };
    
    const targetRoute = routeMap[key];
    if (targetRoute && route.path !== targetRoute) {
        router.push(targetRoute);
    }
};

// 退出登录
const handleLogout = async () => {
    try {
        await logout();
        localStorage.removeItem('token');
        message.success('退出登录成功');
        router.push('/login');
    } catch (error) {
        console.error('退出登录失败:', error);
        // 即使接口失败也清除本地token
        localStorage.removeItem('token');
        router.push('/login');
    }
};

// 获取当前用户信息
const fetchCurrentUser = async () => {
    try {
        const user = await getCurrentUser();
        Object.assign(currentUser, user);
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
};

// 根据当前路由设置选中的菜单
const setSelectedMenuByRoute = () => {
    const path = route.path;
    const routeMenuMap = {
        '/dashboard': 'dashboard',
        '/system/user': 'user-management',
        '/system/role': 'role-management',
        '/system/permission': 'permission-management'
    };
    
    const menuKey = routeMenuMap[path];
    if (menuKey) {
        selectedKeys.value = [menuKey];
        
        // 如果是系统管理下的子菜单，确保父菜单展开
        if (menuKey.includes('management')) {
            openKeys.value = ['system'];
        }
    }
};

onMounted(() => {
    fetchCurrentUser();
    setSelectedMenuByRoute();
});

// 监听路由变化
router.afterEach(() => {
    setSelectedMenuByRoute();
});
</script>

<style scoped lang="less">
.main-layout {
    min-height: 100vh;
}

.sidebar {
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    
    .logo {
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        
        h3 {
            color: white;
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
    }
}

.header {
    background: white;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    margin-left: 240px;
    
    .header-left {
        display: flex;
        align-items: center;
        
        .trigger {
            font-size: 18px;
            line-height: 64px;
            padding: 0 24px;
            cursor: pointer;
            transition: color 0.3s;
            
            &:hover {
                color: #1890ff;
            }
        }
        
        .breadcrumb {
            margin-left: 16px;
        }
    }
    
    .header-right {
        .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 64px;
            padding: 0 16px;
            
            .username {
                margin-left: 4px;
            }
        }
    }
}

.content {
    margin-left: 240px;
    padding: 24px;
    background: #f0f2f5;
    min-height: calc(100vh - 64px);
    
    .content-wrapper {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        min-height: calc(100vh - 112px);
    }
}

// 响应式处理
@media (max-width: 768px) {
    .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
        
        &.ant-layout-sider-collapsed {
            transform: translateX(0);
        }
    }
    
    .header,
    .content {
        margin-left: 0;
    }
}
</style>