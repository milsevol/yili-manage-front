import { axiosGet, axiosPost, axiosPut, axiosDelete } from '@/utils/axios.js';

// 获取角色列表
export function getRoleList(params) {
    return axiosGet('/system/roles', params);
}

// 获取角色详情
export function getRoleDetail(roleId) {
    return axiosGet(`/system/roles/${roleId}`);
}

// 创建角色
export function createRole(data) {
    return axiosPost('/system/roles', data);
}

// 更新角色
export function updateRole(roleId, data) {
    return axiosPut(`/system/roles/${roleId}`, data);
}

// 删除角色
export function deleteRole(roleId) {
    return axiosDelete(`/system/roles/${roleId}`);
}

// 获取角色菜单树
export function getRoleMenuTrees(roleId) {
    return axiosGet(`/system/roles/${roleId}/menuTrees`);
}

// 分配角色菜单权限
export function assignRoleMenus(roleId, data) {
    return axiosPost(`/system/roles/${roleId}/menus`, data);
}