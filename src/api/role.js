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