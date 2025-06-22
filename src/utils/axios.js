import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router/router";

// 创建 axios 实例
const instance = axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = token; // 直接使用 token，不添加 Bearer 前缀
        }
        return config;
    },
    (error) => {
        message.error("请求发送失败！");
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    (response) => {
        const { code, data, message: msg } = response.data;
        if (code === "0000") {
            return { code, message: msg, data }; // 成功时返回完整信息
        } else if (code === "0002" || code === "1002") {
            // token错误或用户未登录
            message.error("登录过期，请重新登录！");
            localStorage.removeItem("token"); // 清除本地token
            router.push("/login"); // 跳转到登录页
            return Promise.reject(msg || "登录过期");
        } else if (code === "1003") {
            // 用户没有权限
            message.error("您没有权限执行此操作！");
            return Promise.reject(msg || "权限不足");
        } else {
            // 其他业务错误
            message.error(msg || "请求失败");
            return Promise.reject(msg || "Error");
        }
    },
    (error) => {
        // HTTP状态码错误处理
        if (error.response) {
            const status = error.response.status;
            if (status === 500) {
                const errorMsg = error.response.data?.message || "服务器内部错误，请稍后重试！";
                message.error(errorMsg);
            } else if (status === 401) {
                message.error("登录过期，请重新登录！");
                localStorage.removeItem("token");
                router.push("/login");
            } else if (status === 403) {
                message.error("您没有权限访问此资源！");
            } else if (status === 404) {
                message.error("请求的资源不存在！");
            } else {
                message.error(error.response.data?.message || "请求失败");
            }
        } else {
            message.error(error.message || "网络连接失败");
        }
        return Promise.reject(error);
    }
);

// 封装 GET 请求
export const axiosGet = (url, params = {}, config = {}) => {
    return instance.get(url, { params, ...config })
};

// 封装 POST 请求
export const axiosPost = (url, data = {}, config = {}) => {
    return instance.post(url, data, { ...config })
};

// 封装 PUT 请求
export const axiosPut = (url, data = {}, config = {}) => {
    return instance.put(url, data, { ...config })
};

// 封装 DELETE 请求
export const axiosDelete = (url, data = {}, config = {}) => {
    return instance.delete(url, { data, ...config })
};