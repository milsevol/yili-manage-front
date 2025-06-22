# Vue 3 + Vite 3 + Ant Design Vue

![Vue](https://img.shields.io/badge/Vue-3.3.4-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-4.5.0-646CFF?style=flat-square&logo=vite)
![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.2.6-0170FE?style=flat-square&logo=ant-design)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

🚀 **最简单纯粹，生产可用的 Vue3 + Vite 脚手架**

一个现代化的前端开发模板，集成了最新的技术栈和最佳实践，帮助你快速搭建高质量的 Vue3 应用。

## ✨ 特性

- 🎯 **Vue 3** - 使用 Composition API，更好的 TypeScript 支持
- ⚡ **Vite** - 极速的开发体验，HMR 热更新
- 🎨 **Ant Design Vue 4.2.6** - 企业级 UI 组件库，按需加载
- 🗂 **文件路由** - 基于 Vue Router 4 的路由管理
- 📦 **状态管理** - 使用 Pinia 替代 Vuex
- 🎭 **JSX 支持** - 支持 JSX 语法编写组件
- 📱 **响应式设计** - 移动端友好的响应式布局
- 🔧 **开发工具** - ESLint + Prettier 代码规范
- 🌍 **现代浏览器** - 支持现代浏览器和 IE11+

## 🚀 快速开始

### 环境要求
- **Node.js**: 22.15.0+
- **npm**: 最新版本
- **nvm**: 1.1.9 (可选)

### 安装与启动

```bash
# 克隆项目
git clone <repository-url>
cd yili-manage-front

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

项目将在 `http://localhost:9000` 启动

## 📦 构建部署

```bash
# 清除构建目录
npm run clean

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🛠 技术栈

### 核心框架
- **Vue 3.3.4** - 渐进式 JavaScript 框架
- **Vite 4.5.0** - 下一代前端构建工具
- **Vue Router 4.2.5** - 官方路由管理器

### UI 与样式
- **Ant Design Vue 4.2.6** - 企业级 UI 设计语言
- **Less 4.1.3** - CSS 预处理器
- **CSS Reset** - 使用 Meyer's Reset CSS

### 状态管理与工具
- **Pinia 2.1.7** - 符合直觉的 Vue.js 状态管理库
- **Axios 1.8.2** - HTTP 客户端
- **ESLint + Prettier** - 代码质量与格式化

### 构建与开发
- **JSX 支持** - 通过 @vitejs/plugin-vue-jsx
- **组件自动导入** - unplugin-vue-components
- **开发服务器代理** - 内置 API 代理配置

## 📁 项目结构

```
src/
├── api/              # API 接口管理
│   └── home.js       # 示例接口
├── assets/           # 静态资源
│   ├── img/          # 图片资源
│   └── vue.svg       # Vue logo
├── components/       # 公共组件
│   └── JumpBtn.vue   # 示例组件
├── pages/            # 页面组件
│   ├── 404/          # 404 页面
│   ├── about/        # 关于页面
│   └── home/         # 首页
├── router/           # 路由配置
│   └── router.js     # 路由定义
├── store/            # 状态管理 (Pinia)
│   └── counter.js    # 示例 store
├── style/            # 样式文件
│   ├── global.less   # 全局样式
│   └── reset.css     # 样式重置
├── utils/            # 工具函数
│   ├── axios.js      # HTTP 请求封装
│   └── tool.js       # 通用工具
├── App.vue           # 根组件
├── main.js           # 应用入口
└── style.css         # 图标字体样式
```

## 🔧 开发配置

### 代理配置
项目已配置开发服务器代理，支持 API 请求转发：
```javascript
proxy: {
  '/api': {
    target: 'http://jsonplaceholder.typicode.com',
    changeOrigin: true
  }
}
```

### 路径别名
```javascript
'@': path.resolve(__dirname, 'src')
```

## 📝 开发指南

### 添加新页面
1. 在 `src/pages/` 下创建页面组件
2. 在 `src/router/router.js` 中添加路由配置
3. 如需要，在 `src/api/` 中添加对应的接口函数

### 状态管理
使用 Pinia 进行状态管理，示例：
```javascript
// stores/example.js
import { defineStore } from 'pinia'

export const useExampleStore = defineStore('example', {
  state: () => ({
    data: []
  }),
  actions: {
    async fetchData() {
      // 异步操作
    }
  }
})
```

## ❓ 常见问题

### 为什么选择 Pinia 而不是 Vuex？
Pinia 是 Vue 官方推荐的状态管理库，相比 Vuex 4：
- 更好的 TypeScript 支持
- 更简洁的 API
- 更好的开发者体验
- Vue 3 Composition API 友好

### 为什么使用 Meyer's Reset CSS？
相比 Ant Design Vue 自带的重置样式：
- 更彻底的样式重置
- 避免组件库默认样式干扰
- 更好的跨浏览器兼容性

### ESLint 配置说明
项目使用自定义 ESLint 配置而非 Alloy 规则，原因：
- Alloy 规则不再维护
- 避免 TypeScript 相关依赖冲突
- 更适合纯 JavaScript 项目

## 📄 许可证

[MIT License](./LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！