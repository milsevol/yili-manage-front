import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/home/Home.vue';
import About from '@/pages/about/About.vue';
import NotFound from '@/pages/404/Error404.vue';
import MenuNotFound from '@/pages/404/MenuNotFound.vue';
import Login from '@/pages/login/Login.vue';
import MainLayout from '@/layout/MainLayout.vue';
import Dashboard from '@/views/Dashboard.vue';
import UserManagement from '@/views/system/UserManagement.vue';
import RoleManagement from '@/views/system/RoleManagement.vue';
import MenuManagement from '@/views/system/MenuManagement.vue';

const routes = [
    {
        path: '/login',
        component: Login,
        meta: { title: '登录', requiresAuth: false },
    },
    {
        path: '/',
        component: MainLayout,
        redirect: '/dashboard',
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                component: Dashboard,
                meta: { title: '首页' },
            },
            {
                path: 'system',
                meta: { title: '系统管理' },
                children: [
                    {
                        path: 'user',
                        component: UserManagement,
                        meta: { title: '用户管理' },
                    },
                    {
                        path: 'role',
                        component: RoleManagement,
                        meta: { title: '角色管理' },
                    },
                    {
                        path: 'menus',
                        component: MenuManagement,
                        meta: { title: '菜单管理' },
                    },
                    // 捕获 system 路径下的未匹配子路由
                    {
                        path: ':pathMatch(.*)*',
                        component: MenuNotFound,
                        meta: { title: '页面未找到' },
                    },
                ],
            },
            // 在布局内显示404页面，捕获所有未匹配的子路由
            {
                path: ':pathMatch(.*)*',
                component: MenuNotFound,
                meta: { title: '页面未找到' },
            },
        ],
    },
    // 兼容旧路由
    {
        path: '/home',
        component: Home,
        meta: { title: 'Home' },
    },
    {
        path: '/About',
        component: About,
        meta: { title: 'About' },
    },
    // 全局404，只处理完全不匹配的路径
    { path: '/:path(.*)', component: NotFound },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由全局前置守卫
router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
        document.title = `${to.meta.title} - 管理后台`;
    }
    
    // 检查是否需要登录验证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
    const token = localStorage.getItem('token');
    
    if (requiresAuth && !token) {
        // 需要登录但没有token，跳转到登录页
        next('/login');
    } else if (to.path === '/login' && token) {
        // 已登录用户访问登录页，跳转到首页
        next('/dashboard');
    } else {
        next();
    }
});


export default router;