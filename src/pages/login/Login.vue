<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <h2>系统登录</h2>
                <p>欢迎使用管理后台系统</p>
            </div>
            <AForm
                :model="loginForm"
                :rules="rules"
                @finish="handleLogin"
                @finish-failed="handleLoginFailed"
                class="login-form"
            >
                <AFormItem name="username">
                    <AInput
                        v-model:value="loginForm.username"
                        size="large"
                        placeholder="请输入用户名"
                        :prefix="h(UserOutlined)"
                    />
                </AFormItem>
                <AFormItem name="password">
                    <AInputPassword
                        v-model:value="loginForm.password"
                        size="large"
                        placeholder="请输入密码"
                        :prefix="h(LockOutlined)"
                    />
                </AFormItem>
                <AFormItem>
                    <AButton
                        type="primary"
                        html-type="submit"
                        size="large"
                        :loading="loading"
                        class="login-btn"
                    >
                        登录
                    </AButton>
                </AFormItem>
            </AForm>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, h } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { login } from '@/api/user.js';

const router = useRouter();
const loading = ref(false);

// 登录表单数据
const loginForm = reactive({
    username: '',
    password: ''
});

// 表单验证规则
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
    ]
};

// 登录处理
const handleLogin = async (values) => {
    try {
        loading.value = true;
        const result = await login(values);
        console.log('登录结果:', result);
        // 保存token（后端返回的token在data字段中）
        if (result.code =='0000' && result.data) {
            localStorage.setItem('token', result.data);
            message.success('登录成功');
            
            // 跳转到首页
            router.push('/dashboard');
        } else {
            message.error('登录失败，请检查用户名和密码');
        }
    } catch (error) {
        console.error('登录错误:', error);
        // axios拦截器已经处理了错误提示，这里不再重复提示
        // 只在特殊情况下提示
        if (!error.response) {
            message.error('网络连接失败，请检查网络设置');
        }
    } finally {
        loading.value = false;
    }
};

// 登录失败处理
const handleLoginFailed = (errorInfo) => {
    console.log('登录表单验证失败:', errorInfo);
};
</script>

<style scoped lang="less">
.login-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-box {
    width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: 40px;
    backdrop-filter: blur(10px);
}

.login-header {
    text-align: center;
    margin-bottom: 32px;
    
    h2 {
        color: #333;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    p {
        color: #666;
        font-size: 14px;
        margin: 0;
    }
}

.login-form {
    .ant-form-item {
        margin-bottom: 24px;
    }
    
    .login-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 6px;
    }
}

.ant-input-affix-wrapper,
.ant-input {
    border-radius: 6px;
}

.ant-input-affix-wrapper:focus,
.ant-input-affix-wrapper-focused {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}
</style>