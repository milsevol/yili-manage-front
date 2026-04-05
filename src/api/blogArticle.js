import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/utils/axios.js';

export function getBlogArticleList(params) {
    return axiosGet('/blog/articles', params);
}

export function getBlogArticleDetail(articleId) {
    return axiosGet(`/blog/articles/${articleId}`);
}

export function createBlogArticle(data) {
    return axiosPost('/blog/articles', data);
}

export function updateBlogArticle(articleId, data) {
    return axiosPut(`/blog/articles/${articleId}`, data);
}

export function publishBlogArticle(articleId) {
    return axiosPost(`/blog/articles/${articleId}/publish`);
}

export function offlineBlogArticle(articleId) {
    return axiosPost(`/blog/articles/${articleId}/offline`);
}

export function deleteBlogArticle(articleId) {
    return axiosDelete(`/blog/articles/${articleId}`);
}
