import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";

// 创建 axios 实例
const instance = axios.create({
    baseURL: "/api",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // 使用 Authorization 头传递 token
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
        if (code === 200) {
            return data; // 成功时解析数据
        } else if (code === 401) {
            message.error("登录过期，请重新登录！");
            router.push("/login"); // 跳转到登录页
            return Promise.reject(msg || "Unauthorized");
        } else {
            message.error(msg || "请求失败");
            return Promise.reject(msg || "Error");
        }
    },
    (error) => {
        message.error(error.message || "请求失败");
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