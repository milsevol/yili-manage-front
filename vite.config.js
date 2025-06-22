// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import eslint from 'vite-plugin-eslint';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
    resolve: {
        alias: {
            // eslint-disable-next-line no-undef
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 9000,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:29502/yili-manage',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    plugins: [
        vue(),
        vueJsx(),
        viteCommonjs(),
        Components({
            resolvers: [AntDesignVueResolver({importStyle: false})],
        }),
        eslint(),
    ],
    css: {
        preprocessorOptions: {
            less: {
                // 全局注入 Less 文件
                additionalData: `@import "@/style/global.less";`,
            },
        },
    },
});