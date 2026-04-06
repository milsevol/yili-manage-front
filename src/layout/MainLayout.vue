<template>
    <a-layout class="main-layout">
        <!-- 侧边栏 -->
        <a-layout-sider
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
            <a-menu
                v-model:selectedKeys="selectedKeys"
                v-model:openKeys="openKeys"
                mode="inline"
                theme="dark"
                :items="menuItems"
                @click="handleMenuClick"
            />
        </a-layout-sider>
        
        <!-- 主内容区 -->
        <a-layout>
            <!-- 顶部导航 -->
            <a-layout-header class="header">
                <div class="header-left">
                    <a-button
                        type="text"
                        :icon="h(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)"
                        @click="() => (collapsed = !collapsed)"
                        class="trigger"
                    />
                    <a-breadcrumb class="breadcrumb">
                        <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
                            {{ item.title }}
                        </a-breadcrumb-item>
                    </a-breadcrumb>
                </div>
                <div class="header-right">
                    <a-dropdown>
                        <a-button type="text" class="user-info">
                            <UserOutlined />
                            <span class="username">{{ currentUser.username || 'Admin' }}</span>
                            <DownOutlined />
                        </a-button>
                        <template #overlay>
                            <a-menu>
                                <a-menu-item key="profile">
                                    <UserOutlined />
                                    个人信息
                                </a-menu-item>
                                <a-menu-item key="settings">
                                    <SettingOutlined />
                                    系统设置
                                </a-menu-item>
                                <a-menu-divider />
                                <a-menu-item key="logout" @click="handleLogout">
                                    <LogoutOutlined />
                                    退出登录
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </div>
            </a-layout-header>
            
            <!-- 内容区域 -->
            <a-layout-content class="content">
                <div class="content-wrapper">
                    <router-view />
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>
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
import { getMenuTree } from '@/api/menu.js';

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref([]);
const openKeys = ref([]);
const currentUser = reactive({ username: '' });
const userMenus = ref([]);

// 图标映射
const iconMap = {
    'DashboardOutlined': DashboardOutlined,
    'TeamOutlined': TeamOutlined,
    'SafetyOutlined': SafetyOutlined,
    'KeyOutlined': KeyOutlined,
    'SettingOutlined': SettingOutlined,
    'UserOutlined': UserOutlined
};

// 获取图标组件
const getMenuIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? h(IconComponent) : h(SettingOutlined);
};

const getMenuKey = (menu) => menu.menuUrl || menu.menuId;

const normalizeMenuSegment = (segment) => (segment || '').replace(/^\/+|\/+$/g, '');

const joinMenuPath = (segments) => {
    const cleanSegments = segments
        .map(normalizeMenuSegment)
        .filter(Boolean);

    if (cleanSegments.length === 0) {
        return '/';
    }

    return `/${cleanSegments.join('/')}`;
};

const buildPathFromTrail = (trail) => {
    if (!trail || trail.length === 0) {
        return '';
    }

    if (trail.length === 1 && trail[0].menuUrl === 'dashboard') {
        return '/dashboard';
    }

    return joinMenuPath(trail.map(item => item.menuUrl || item.menuId));
};

// 转换菜单数据格式
const transformMenuData = (menus) => {
    return menus.map(menu => {
        // 只处理MENU类型的菜单项，跳过OPERATE类型
        if (menu.menuType !== 'MENU') {
            return null;
        }
        
        const item = {
            key: getMenuKey(menu),
            icon: getMenuIcon(menu.menuIcon),
            label: menu.menuName,
            title: menu.menuName
        };
        
        if (menu.children && menu.children.length > 0) {
            // 递归处理子菜单，过滤掉null值
            const childItems = transformMenuData(menu.children).filter(child => child !== null);
            if (childItems.length > 0) {
                item.children = childItems;
            }
        }
        
        return item;
    }).filter(item => item !== null); // 过滤掉null值
};

// 菜单配置（动态获取）
const menuItems = computed(() => {
    return transformMenuData(userMenus.value);
});

const findMenuTrailByKey = (menus, key, parentTrail = []) => {
    for (const menu of menus) {
        const currentTrail = [...parentTrail, menu];
        if (getMenuKey(menu) === key) {
            return currentTrail;
        }
        if (menu.children && menu.children.length > 0) {
            const found = findMenuTrailByKey(menu.children, key, currentTrail);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

const findMenuTrailByPath = (menus, targetPath, parentTrail = []) => {
    for (const menu of menus) {
        if (menu.menuType !== 'MENU') {
            continue;
        }

        const currentTrail = [...parentTrail, menu];
        if (buildPathFromTrail(currentTrail) === targetPath) {
            return currentTrail;
        }

        if (menu.children && menu.children.length > 0) {
            const found = findMenuTrailByPath(menu.children, targetPath, currentTrail);
            if (found) {
                return found;
            }
        }
    }

    return null;
};

// 面包屑导航
const breadcrumbItems = computed(() => {
    const items = [{ title: '数据看板', path: '/dashboard' }];
    
    if (route.path !== '/dashboard') {
        const currentTrail = findMenuTrailByPath(userMenus.value, route.path)
            || findMenuTrailByKey(userMenus.value, selectedKeys.value[0]);
        if (currentTrail) {
            currentTrail.forEach((menu, index) => {
                items.push({
                    title: menu.menuName,
                    path: buildPathFromTrail(currentTrail.slice(0, index + 1))
                });
            });
        }
    }
    
    return items;
});

// 构建完整的菜单路径（包含父菜单路径）
const buildMenuPath = (key) => {
    const menuTrail = findMenuTrailByKey(userMenus.value, key);
    if (menuTrail) {
        return buildPathFromTrail(menuTrail);
    }

    return key.startsWith('/') ? key : `/${key}`;
};

// 菜单点击处理
const handleMenuClick = ({ key }) => {
    selectedKeys.value = [key];
    
    // 动态构建路由路径
    let targetRoute = '';
    if (key === 'dashboard') {
        targetRoute = '/dashboard';
    } else {
        targetRoute = buildMenuPath(key);
    }
    
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

// 获取当前用户信息和菜单
const fetchCurrentUser = async () => {
    try {
        const response = await getCurrentUser();
        // 处理用户信息
        Object.assign(currentUser, response.data);
        // 处理菜单数据
        if (response.data && response.data.menus) {
            userMenus.value = response.data.menus;
        } else {
            // 如果没有菜单数据，使用默认菜单
            userMenus.value = [
                {
                    menuId: 'dashboard',
                    menuName: '数据看板',
                    menuUrl: 'dashboard',
                    menuIcon: 'DashboardOutlined'
                }
            ];
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        // 如果获取失败，使用默认菜单
        userMenus.value = [
            {
                menuId: 'dashboard',
                menuName: '数据看板',
                menuUrl: 'dashboard',
                menuIcon: 'DashboardOutlined'
            }
        ];
    }
};

// 根据当前路由设置选中的菜单
const setSelectedMenuByRoute = () => {
    const menuTrail = findMenuTrailByPath(userMenus.value, route.path);

    if (menuTrail && menuTrail.length > 0) {
        selectedKeys.value = [getMenuKey(menuTrail[menuTrail.length - 1])];
        openKeys.value = menuTrail
            .slice(0, -1)
            .map(item => getMenuKey(item));
    } else {
        selectedKeys.value = [];
        openKeys.value = [];
    }
};

onMounted(async () => {
    await fetchCurrentUser();
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
    transition: margin-left 0.2s;
    
    .header-left {
        display: flex;
        align-items: center;
        
        .trigger {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            margin-right: 16px;
            border-radius: 6px;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.3s;
            background: transparent;
            border: none;
            
            &:hover {
                color: #1890ff;
                background: rgba(24, 144, 255, 0.1);
            }
            
            &:active {
                background: rgba(24, 144, 255, 0.15);
            }
            
            // 确保图标居中对齐
            :deep(.anticon) {
                display: flex;
                align-items: center;
                justify-content: center;
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
    transition: margin-left 0.2s;
    
    .content-wrapper {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        min-height: calc(100vh - 112px);
    }
}

// 侧边栏折叠时的样式调整
.main-layout :deep(.ant-layout-sider-collapsed) + .ant-layout {
    .header,
    .content {
        margin-left: 80px;
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
    
    // 移动端不需要折叠样式调整
    .main-layout :deep(.ant-layout-sider-collapsed) + .ant-layout {
        .header,
        .content {
            margin-left: 0;
        }
    }
}
</style>
