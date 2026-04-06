import { axiosGet } from "@/utils/axios";

/**
 * 获取核心指标卡片数据
 * @returns {Promise<any>}
 */
export const getDashboardSummary = () => {
    return axiosGet("/dashboard/summary");
};

/**
 * 获取近7天用户增长趋势
 * @returns {Promise<any>}
 */
export const getUserTrend = () => {
    return axiosGet("/dashboard/user-trend");
};

/**
 * 获取文章分类占比统计
 * @returns {Promise<any>}
 */
export const getArticleCategory = () => {
    return axiosGet("/dashboard/article-category");
};
