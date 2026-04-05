import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/utils/axios.js';

export function getBlogCategoryList(params) {
    return axiosGet('/blog/categories', params);
}

export function getEnabledBlogCategories() {
    return axiosGet('/blog/categories/enabled');
}

export function createBlogCategory(data) {
    return axiosPost('/blog/categories', data);
}

export function updateBlogCategory(categoryId, data) {
    return axiosPut(`/blog/categories/${categoryId}`, data);
}

export function deleteBlogCategory(categoryId) {
    return axiosDelete(`/blog/categories/${categoryId}`);
}
