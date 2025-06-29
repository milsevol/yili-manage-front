import { axiosGet, axiosPost, axiosPut, axiosDelete } from '@/utils/axios.js';

// 获取菜单树
export function getMenuTree() {
    return axiosGet('/system/menus/tree');
}

// 获取用户菜单树（包含权限标记）
export function getUserMenuTree(userId) {
    return axiosGet(`/system/users/${userId}/menuTrees`);
}

// 获取菜单列表
export function getMenuList(params) {
    return axiosGet('/system/menus', params);
}

// 创建菜单
export function createMenu(data) {
    return axiosPost('/system/menus', data);
}

// 更新菜单
export function updateMenu(menuId, data) {
    return axiosPut(`/system/menus/${menuId}`, data);
}

// 删除菜单
export function deleteMenu(menuId) {
    return axiosDelete(`/system/menus/${menuId}`);
}