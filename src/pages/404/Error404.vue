<template>
    <div class="error-404">
        <div class="error-content">
            <!-- 404图标 -->
            <div class="error-icon">
                <svg viewBox="0 0 1024 1024" width="200" height="200">
                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="#f5f5f5"/>
                    <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.4-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.8 41.3-19.8 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5 0-39.3-17.2-76-48.4-103.3z" fill="#bfbfbf"/>
                    <circle cx="512" cy="708" r="48" fill="#bfbfbf"/>
                </svg>
            </div>
            
            <!-- 错误信息 -->
            <div class="error-info">
                <h1 class="error-title">404</h1>
                <h2 class="error-subtitle">页面未找到</h2>
                <p class="error-description">
                    抱歉，您访问的页面不存在或正在开发中。
                    <br>
                    请检查URL是否正确，或返回首页继续浏览。
                </p>
            </div>
            
            <!-- 操作按钮 -->
            <div class="error-actions">
                <a-button type="primary" size="large" @click="goHome">
                    <HomeOutlined />
                    返回首页
                </a-button>
                <a-button size="large" @click="goBack" style="margin-left: 16px;">
                    <ArrowLeftOutlined />
                    返回上页
                </a-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';

const router = useRouter();

// 返回首页
const goHome = () => {
    router.push('/dashboard');
};

// 返回上一页
const goBack = () => {
    if (window.history.length > 1) {
        router.go(-1);
    } else {
        router.push('/dashboard');
    }
};
</script>

<style scoped>
.error-404 {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 8px;
}

.error-content {
    text-align: center;
    max-width: 500px;
    padding: 40px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-icon {
    margin-bottom: 30px;
    opacity: 0.8;
}

.error-icon svg {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    display: block;
}

.error-title {
    font-size: 72px;
    font-weight: bold;
    color: #1890ff;
    margin: 0 0 16px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-subtitle {
    font-size: 24px;
    color: #595959;
    margin: 0 0 20px 0;
    font-weight: 500;
}

.error-description {
    font-size: 16px;
    color: #8c8c8c;
    line-height: 1.6;
    margin: 0 0 40px 0;
}

.error-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.error-actions .ant-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.error-actions .ant-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .error-404 {
        padding: 20px 10px;
        min-height: 50vh;
    }
    
    .error-content {
        padding: 30px 20px;
    }
    
    .error-title {
        font-size: 56px;
    }
    
    .error-subtitle {
        font-size: 20px;
    }
    
    .error-description {
        font-size: 14px;
    }
    
    .error-actions {
        flex-direction: column;
    }
    
    .error-actions .ant-btn {
        width: 100%;
        margin-left: 0 !important;
    }
}
</style>