// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parser: '@babel/eslint-parser',
        ecmaFeatures: {
            jsx: true,
        },
        babelOptions: {
            parserOpts: {
                plugins: ['jsx'],
            },
        },
        requireConfigFile: false,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'prettier',
    ],
    rules: {
        'vue/no-empty-component-block': 'off',
        'no-unused-vars': 'off',
        'vue/no-unused-vars': 'off',
        'vue/attributes-order': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/attribute-hyphenation': 'off',
    },
    globals: {
        // 自定义全局变量
    },
};