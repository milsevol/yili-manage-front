<template>
  <div class="menu-not-found">
    <div class="content-container">
      <!-- 404图标 -->
      <div class="icon-container">
        <svg class="not-found-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#e6f7ff" stroke-width="2"/>
          <text x="100" y="110" text-anchor="middle" font-size="36" font-weight="bold" fill="#1890ff">404</text>
          <path d="M60 60 L140 140 M140 60 L60 140" stroke="#ff4d4f" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      
      <!-- 错误信息 -->
      <div class="error-content">
        <h2 class="error-title">页面未找到</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或正在开发中
        </p>
        <p class="error-suggestion">
          请检查URL是否正确，或从左侧菜单选择其他页面
        </p>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="goToDashboard">
          <HomeOutlined />
          返回首页
        </a-button>
        <a-button @click="goBack" style="margin-left: 12px;">
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
const goToDashboard = () => {
  router.push('/dashboard');
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.menu-not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin: 20px;
}

.content-container {
  text-align: center;
  max-width: 500px;
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.icon-container {
  margin-bottom: 30px;
}

.not-found-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: block;
}

.error-content {
  margin-bottom: 30px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #595959;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.error-suggestion {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .menu-not-found {
    margin: 10px;
    padding: 20px 10px;
    min-height: 300px;
  }
  
  .content-container {
    padding: 30px 20px;
  }
  
  .not-found-icon {
    width: 100px;
    height: 100px;
  }
  
  .error-title {
    font-size: 20px;
  }
  
  .error-description {
    font-size: 14px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-buttons .ant-btn {
    margin-left: 0 !important;
    width: 100%;
  }
}

/* 动画效果 */
.content-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.not-found-icon {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>