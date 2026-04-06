<template>
    <div class="dashboard-container">
        <!-- 欢迎区域 -->
        <div class="welcome-section">
            <a-card class="welcome-card" :bordered="false">
                <div class="welcome-content">
                    <div class="welcome-text">
                        <h2>数据看板，{{ currentUser.username || 'Admin' }}！</h2>
                        <p class="welcome-desc">当前日期：{{ currentDate }}，以下是系统最新运行情况</p>
                    </div>
                </div>
            </a-card>
        </div>

        <!-- 核心指标卡片 -->
        <div class="stats-section">
            <a-row :gutter="[16, 16]">
                <a-col :xs="24" :sm="12" :md="8" :lg="4">
                    <a-card class="stat-card" :bordered="false" :loading="loading.summary">
                        <a-statistic
                            title="总用户数"
                            :value="summaryData.totalUser || 0"
                            :precision="0"
                            suffix="人"
                            :value-style="{ color: '#1890ff' }"
                        >
                            <template #prefix>
                                <TeamOutlined />
                            </template>
                        </a-statistic>
                    </a-card>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8" :lg="5">
                    <a-card class="stat-card" :bordered="false" :loading="loading.summary">
                        <a-statistic
                            title="今日新增用户"
                            :value="summaryData.todayNewUser || 0"
                            :precision="0"
                            suffix="人"
                            :value-style="{ color: '#52c41a' }"
                        >
                            <template #prefix>
                                <UserAddOutlined />
                            </template>
                        </a-statistic>
                    </a-card>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8" :lg="5">
                    <a-card class="stat-card" :bordered="false" :loading="loading.summary">
                        <a-statistic
                            title="今日访问量(PV)"
                            :value="summaryData.todayPv || 0"
                            :precision="0"
                            suffix="次"
                            :value-style="{ color: '#722ed1' }"
                        >
                            <template #prefix>
                                <EyeOutlined />
                            </template>
                        </a-statistic>
                    </a-card>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8" :lg="5">
                    <a-card class="stat-card" :bordered="false" :loading="loading.summary">
                        <a-statistic
                            title="今日独立访客(UV)"
                            :value="summaryData.todayUv || 0"
                            :precision="0"
                            suffix="人"
                            :value-style="{ color: '#eb2f96' }"
                        >
                            <template #prefix>
                                <UserOutlined />
                            </template>
                        </a-statistic>
                    </a-card>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8" :lg="5">
                    <a-card class="stat-card" :bordered="false" :loading="loading.summary">
                        <a-statistic
                            title="文章总数"
                            :value="summaryData.totalArticle || 0"
                            :precision="0"
                            suffix="篇"
                            :value-style="{ color: '#faad14' }"
                        >
                            <template #prefix>
                                <FileTextOutlined />
                            </template>
                        </a-statistic>
                    </a-card>
                </a-col>
            </a-row>
        </div>

        <!-- 图表展示区 -->
        <div class="charts-section">
            <a-row :gutter="[16, 16]">
                <a-col :xs="24" :lg="16">
                    <a-card title="近7天新增注册用户趋势" :bordered="false" class="chart-card">
                        <div ref="trendChartRef" class="chart-container" v-if="!loading.trend"></div>
                        <a-skeleton active v-else />
                    </a-card>
                </a-col>
                <a-col :xs="24" :lg="8">
                    <a-card title="文章分类占比分布" :bordered="false" class="chart-card">
                        <div ref="categoryChartRef" class="chart-container" v-if="!loading.category"></div>
                        <a-skeleton active v-else />
                    </a-card>
                </a-col>
            </a-row>
        </div>

        <!-- 快捷操作区 -->
        <div class="quick-actions">
            <a-card title="快捷操作" :bordered="false" class="action-card">
                <a-row :gutter="[16, 16]">
                    <a-col :xs="24" :sm="12" :md="6">
                        <a-card hoverable class="action-item" @click="() => router.push('/system/user')">
                            <div class="action-content">
                                <TeamOutlined class="action-icon" />
                                <div class="action-text">
                                    <h4>用户管理</h4>
                                </div>
                            </div>
                        </a-card>
                    </a-col>
                    <a-col :xs="24" :sm="12" :md="6">
                        <a-card hoverable class="action-item" @click="() => router.push('/system/role')">
                            <div class="action-content">
                                <SafetyOutlined class="action-icon" />
                                <div class="action-text">
                                    <h4>角色管理</h4>
                                </div>
                            </div>
                        </a-card>
                    </a-col>
                    <a-col :xs="24" :sm="12" :md="6">
                        <a-card hoverable class="action-item" @click="() => router.push('/blog/blogArticle')">
                            <div class="action-content">
                                <FileTextOutlined class="action-icon" />
                                <div class="action-text">
                                    <h4>博客文章</h4>
                                </div>
                            </div>
                        </a-card>
                    </a-col>
                    <a-col :xs="24" :sm="12" :md="6">
                        <a-card hoverable class="action-item" @click="() => router.push('/blog/blogCategory')">
                            <div class="action-content">
                                <AppstoreOutlined class="action-icon" />
                                <div class="action-text">
                                    <h4>博客栏目</h4>
                                </div>
                            </div>
                        </a-card>
                    </a-col>
                </a-row>
            </a-card>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    TeamOutlined,
    UserAddOutlined,
    EyeOutlined,
    UserOutlined,
    FileTextOutlined,
    SafetyOutlined,
    AppstoreOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';
import { getCurrentUser } from '@/api/user.js';
import { getDashboardSummary, getUserTrend, getArticleCategory } from '@/api/dashboard.js';

const router = useRouter();

const currentUser = reactive({ username: '' });
const loading = reactive({
    summary: true,
    trend: true,
    category: true
});

const summaryData = ref({});
const trendChartRef = ref(null);
const categoryChartRef = ref(null);
let trendChartInstance = null;
let categoryChartInstance = null;

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
        const res = await getCurrentUser();
        if (res.code === '0000') {
            Object.assign(currentUser, res.data);
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
};

// 获取核心指标
const fetchSummary = async () => {
    try {
        const res = await getDashboardSummary();
        if (res.code === '0000') {
            summaryData.value = res.data;
        }
    } catch (error) {
        message.error('获取看板数据失败');
    } finally {
        loading.summary = false;
    }
};

// 获取用户趋势
const fetchUserTrend = async () => {
    try {
        const res = await getUserTrend();
        if (res.code === '0000') {
            initTrendChart(res.data || []);
        }
    } catch (error) {
        message.error('获取用户趋势数据失败');
    } finally {
        loading.trend = false;
    }
};

// 获取分类占比
const fetchArticleCategory = async () => {
    try {
        const res = await getArticleCategory();
        if (res.code === '0000') {
            initCategoryChart(res.data || []);
        }
    } catch (error) {
        message.error('获取文章分类数据失败');
    } finally {
        loading.category = false;
    }
};

const initTrendChart = (data) => {
    if (!trendChartRef.value) return;
    const dates = data.map(item => item.date);
    const counts = data.map(item => item.count);

    trendChartInstance = echarts.init(trendChartRef.value);
    const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: '新增用户数',
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                        { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
                    ])
                },
                itemStyle: { color: '#1890ff' },
                data: counts
            }
        ]
    };
    trendChartInstance.setOption(option);
};

const initCategoryChart = (data) => {
    if (!categoryChartRef.value) return;
    const chartData = data.map(item => ({
        name: item.categoryName,
        value: item.count
    }));

    categoryChartInstance = echarts.init(categoryChartRef.value);
    const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
            {
                name: '文章分类',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: { show: false },
                data: chartData
            }
        ]
    };
    categoryChartInstance.setOption(option);
};

const handleResize = () => {
    if (trendChartInstance) trendChartInstance.resize();
    if (categoryChartInstance) categoryChartInstance.resize();
};

onMounted(async () => {
    fetchCurrentUser();
    await Promise.all([
        fetchSummary(),
        fetchUserTrend(),
        fetchArticleCategory()
    ]);
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (trendChartInstance) trendChartInstance.dispose();
    if (categoryChartInstance) categoryChartInstance.dispose();
});
</script>

<style scoped lang="less">
.dashboard-container {
    .welcome-section {
        margin-bottom: 16px;
        
        .welcome-card {
            background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
            border-radius: 8px;
            
            .welcome-content {
                .welcome-text {
                    color: white;
                    
                    h2 {
                        color: white;
                        margin: 0 0 8px 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    
                    .welcome-desc {
                        color: rgba(255, 255, 255, 0.85);
                        margin: 0;
                        font-size: 14px;
                    }
                }
            }
        }
    }
    
    .stats-section {
        margin-bottom: 16px;
        
        .stat-card {
            border-radius: 8px;
            text-align: center;
            
            :deep(.ant-statistic-title) {
                color: #8c8c8c;
                font-weight: 500;
            }
            
            :deep(.ant-statistic-content) {
                font-size: 24px;
                font-weight: 600;
            }
        }
    }

    .charts-section {
        margin-bottom: 16px;

        .chart-card {
            border-radius: 8px;
            
            .chart-container {
                height: 350px;
                width: 100%;
            }
        }
    }
    
    .quick-actions {
        .action-card {
            border-radius: 8px;

            .action-item {
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.3s;
                
                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                .action-content {
                    display: flex;
                    align-items: center;
                    
                    .action-icon {
                        font-size: 28px;
                        color: #1890ff;
                        margin-right: 16px;
                    }
                    
                    .action-text {
                        h4 {
                            margin: 0;
                            color: #262626;
                            font-size: 16px;
                            font-weight: 600;
                        }
                    }
                }
            }
        }
    }
}
</style>
