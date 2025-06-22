<template>
    <div class="dashboard">
        <!-- 欢迎区域 -->
        <div class="welcome-section">
            <ACard class="welcome-card">
                <div class="welcome-content">
                    <div class="welcome-text">
                        <h2>欢迎回来，{{ currentUser.username || 'Admin' }}！</h2>
                        <p class="welcome-desc">今天是 {{ currentDate }}，祝您工作愉快！</p>
                    </div>
                    <div class="welcome-icon">
                        <SmileOutlined class="icon" />
                    </div>
                </div>
            </ACard>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-section">
            <ARow :gutter="[16, 16]">
                <ACol :xs="24" :sm="12" :md="6">
                    <ACard class="stat-card">
                        <AStat
                            title="用户总数"
                            :value="stats.userCount"
                            :precision="0"
                            suffix="人"
                            :value-style="{ color: '#3f8600' }"
                        >
                            <template #prefix>
                                <TeamOutlined />
                            </template>
                        </AStat>
                    </ACard>
                </ACol>
                <ACol :xs="24" :sm="12" :md="6">
                    <ACard class="stat-card">
                        <AStat
                            title="角色总数"
                            :value="stats.roleCount"
                            :precision="0"
                            suffix="个"
                            :value-style="{ color: '#1890ff' }"
                        >
                            <template #prefix>
                                <SafetyOutlined />
                            </template>
                        </AStat>
                    </ACard>
                </ACol>
                <ACol :xs="24" :sm="12" :md="6">
                    <ACard class="stat-card">
                        <AStat
                            title="权限总数"
                            :value="stats.permissionCount"
                            :precision="0"
                            suffix="个"
                            :value-style="{ color: '#722ed1' }"
                        >
                            <template #prefix>
                                <KeyOutlined />
                            </template>
                        </AStat>
                    </ACard>
                </ACol>
                <ACol :xs="24" :sm="12" :md="6">
                    <ACard class="stat-card">
                        <AStat
                            title="今日登录"
                            :value="stats.todayLoginCount"
                            :precision="0"
                            suffix="次"
                            :value-style="{ color: '#eb2f96' }"
                        >
                            <template #prefix>
                                <LoginOutlined />
                            </template>
                        </AStat>
                    </ACard>
                </ACol>
            </ARow>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
            <ACard title="快捷操作" class="action-card">
                <ARow :gutter="[16, 16]">
                    <ACol :xs="24" :sm="12" :md="8">
                        <ACard hoverable class="action-item" @click="() => router.push('/system/user')">
                            <div class="action-content">
                                <TeamOutlined class="action-icon" />
                                <div class="action-text">
                                    <h4>用户管理</h4>
                                    <p>管理系统用户信息</p>
                                </div>
                            </div>
                        </ACard>
                    </ACol>
                    <ACol :xs="24" :sm="12" :md="8">
                        <ACard hoverable class="action-item" @click="() => router.push('/system/role')">
                            <div class="action-content">
                                <SafetyOutlined class="action-icon" />
                                <div class="action-text">
                                    <h4>角色管理</h4>
                                    <p>配置用户角色权限</p>
                                </div>
                            </div>
                        </ACard>
                    </ACol>
                    <ACol :xs="24" :sm="12" :md="8">
                        <ACard hoverable class="action-item" @click="() => router.push('/system/permission')">
                            <div class="action-content">
                                <KeyOutlined class="action-icon" />
                                <div class="action-text">
                                    <h4>权限管理</h4>
                                    <p>设置系统访问权限</p>
                                </div>
                            </div>
                        </ACard>
                    </ACol>
                </ARow>
            </ACard>
        </div>

        <!-- 系统信息 -->
        <div class="system-info">
            <ARow :gutter="16">
                <ACol :xs="24" :md="12">
                    <ACard title="系统信息" class="info-card">
                        <ADescriptions :column="1" size="small">
                            <ADescriptionsItem label="系统版本">
                                v1.0.0
                            </ADescriptionsItem>
                            <ADescriptionsItem label="运行环境">
                                {{ systemInfo.environment }}
                            </ADescriptionsItem>
                            <ADescriptionsItem label="数据库">
                                {{ systemInfo.database }}
                            </ADescriptionsItem>
                            <ADescriptionsItem label="服务器时间">
                                {{ systemInfo.serverTime }}
                            </ADescriptionsItem>
                        </ADescriptions>
                    </ACard>
                </ACol>
                <ACol :xs="24" :md="12">
                    <ACard title="最近活动" class="activity-card">
                        <AList
                            :data-source="recentActivities"
                            size="small"
                        >
                            <template #renderItem="{ item }">
                                <AListItem>
                                    <AListItemMeta
                                        :description="item.time"
                                    >
                                        <template #title>
                                            {{ item.action }}
                                        </template>
                                        <template #avatar>
                                            <AAvatar :style="{ backgroundColor: item.color }">
                                                {{ item.user.charAt(0) }}
                                            </AAvatar>
                                        </template>
                                    </AListItemMeta>
                                </AListItem>
                            </template>
                        </AList>
                    </ACard>
                </ACol>
            </ARow>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
    SmileOutlined,
    TeamOutlined,
    SafetyOutlined,
    KeyOutlined,
    LoginOutlined
} from '@ant-design/icons-vue';
import { getCurrentUser } from '@/api/user.js';

const router = useRouter();

const currentUser = reactive({ username: '' });

// 统计数据
const stats = reactive({
    userCount: 156,
    roleCount: 8,
    permissionCount: 24,
    todayLoginCount: 42
});

// 系统信息
const systemInfo = reactive({
    environment: 'Production',
    database: 'MySQL 8.0',
    serverTime: ''
});

// 最近活动
const recentActivities = ref([
    {
        user: 'Admin',
        action: '创建了新用户 "张三"',
        time: '2分钟前',
        color: '#1890ff'
    },
    {
        user: 'Manager',
        action: '修改了角色权限',
        time: '10分钟前',
        color: '#52c41a'
    },
    {
        user: 'Admin',
        action: '删除了过期数据',
        time: '1小时前',
        color: '#faad14'
    },
    {
        user: 'System',
        action: '系统自动备份完成',
        time: '2小时前',
        color: '#722ed1'
    }
]);

// 当前日期
const currentDate = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
});

// 获取当前用户信息
const fetchCurrentUser = async () => {
    try {
        const user = await getCurrentUser();
        Object.assign(currentUser, user);
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
};

// 更新服务器时间
const updateServerTime = () => {
    systemInfo.serverTime = new Date().toLocaleString('zh-CN');
};

// 模拟获取统计数据
const fetchStats = async () => {
    // 这里可以调用实际的API获取统计数据
    // const data = await getSystemStats();
    // Object.assign(stats, data);
};

onMounted(() => {
    fetchCurrentUser();
    fetchStats();
    updateServerTime();
    
    // 每分钟更新一次服务器时间
    setInterval(updateServerTime, 60000);
});
</script>

<style scoped lang="less">
.dashboard {
    .welcome-section {
        margin-bottom: 24px;
        
        .welcome-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            
            :deep(.ant-card-body) {
                padding: 32px;
            }
            
            .welcome-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                
                .welcome-text {
                    color: white;
                    
                    h2 {
                        color: white;
                        margin: 0 0 8px 0;
                        font-size: 28px;
                        font-weight: 600;
                    }
                    
                    .welcome-desc {
                        color: rgba(255, 255, 255, 0.8);
                        margin: 0;
                        font-size: 16px;
                    }
                }
                
                .welcome-icon {
                    .icon {
                        font-size: 48px;
                        color: rgba(255, 255, 255, 0.8);
                    }
                }
            }
        }
    }
    
    .stats-section {
        margin-bottom: 24px;
        
        .stat-card {
            text-align: center;
            
            :deep(.ant-statistic-title) {
                color: #666;
                font-weight: 500;
            }
            
            :deep(.ant-statistic-content) {
                font-size: 24px;
                font-weight: 600;
            }
        }
    }
    
    .quick-actions {
        margin-bottom: 24px;
        
        .action-card {
            .action-item {
                cursor: pointer;
                transition: all 0.3s;
                
                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .action-content {
                    display: flex;
                    align-items: center;
                    
                    .action-icon {
                        font-size: 32px;
                        color: #1890ff;
                        margin-right: 16px;
                    }
                    
                    .action-text {
                        h4 {
                            margin: 0 0 4px 0;
                            color: #262626;
                            font-size: 16px;
                            font-weight: 600;
                        }
                        
                        p {
                            margin: 0;
                            color: #8c8c8c;
                            font-size: 14px;
                        }
                    }
                }
            }
        }
    }
    
    .system-info {
        .info-card,
        .activity-card {
            height: 300px;
            
            :deep(.ant-card-body) {
                height: calc(100% - 57px);
                overflow-y: auto;
            }
        }
        
        .activity-card {
            :deep(.ant-list-item) {
                padding: 12px 0;
                border-bottom: 1px solid #f0f0f0;
                
                &:last-child {
                    border-bottom: none;
                }
            }
        }
    }
}

// 响应式处理
@media (max-width: 768px) {
    .dashboard {
        .welcome-section {
            .welcome-content {
                flex-direction: column;
                text-align: center;
                
                .welcome-icon {
                    margin-top: 16px;
                }
            }
        }
        
        .quick-actions {
            .action-content {
                flex-direction: column;
                text-align: center;
                
                .action-icon {
                    margin-right: 0;
                    margin-bottom: 8px;
                }
            }
        }
    }
}
</style>