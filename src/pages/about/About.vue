<template>
    <div class="btn-container">
        <p>展示 home 添加的计数器结果: {{ counter.count }}</p>
        <a-button class="big-block-narrow" @click="toHome">toHome</a-button>
    </div>
</template>

<script setup>
import router from '@/router/router';
import { useCounterStore } from '@/store/counter';
const counter = useCounterStore();
const toHome = () => {
    router.push('/');
};
</script>
<style scoped lang="less">
.btn-container {
    margin-top: 300px;
    text-align: center;
}
</style>
