import { axiosGet, axiosPost, axiosPut, axiosDelete } from '@/utils/axios.js';

// 登录接口
export function login(data) {
    return axiosPost('/system/login', data);
}

// 退出登录
export function logout() {
    return axiosPost('/system/logout');
}

// 获取用户列表
export function getUserList(params) {
    return axiosGet('/system/users', params);
}

// 获取用户详情
export function getUserDetail(userId) {
    return axiosGet(`/system/users/${userId}`);
}

// 创建用户
export function createUser(data) {
    return axiosPost('/system/users', data);
}

// 更新用户
export function updateUser(userId, data) {
    return axiosPut(`/system/users/${userId}`, data);
}

// 删除用户
export function deleteUser(userId) {
    return axiosDelete(`/system/users/${userId}`);
}

// 重置用户密码
export function resetUserPassword(userId, data) {
    return axiosPost(`/system/users/${userId}/password/reset`, data);
}

// 修改个人密码
export function changePassword(data) {
    return axiosPut('/system/users/password', data);
}

// 获取当前用户信息
export function getCurrentUser() {
    return axiosGet('/system/users/current');
}

// 批量删除用户
export function batchDeleteUsers(data) {
    return axiosDelete('/system/users/batch', data);
}

// 分配用户角色
export function assignUserRoles(userId, data) {
    return axiosPost(`/system/users/${userId}/roles`, data);
}

// 获取用户角色列表
export function getUserRoles(userId) {
    return axiosGet(`/system/users/${userId}/roles`);
}

// 获取用户权限列表
export function getUserPermissions(userId) {
    return axiosGet(`/system/users/${userId}/permissions`);
}