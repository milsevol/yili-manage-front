<template>
    <div class="greeting-container">
        <h1>Hello，Vite！</h1>
        <h2>Pinia 计数器：{{ counter.count }} </h2>
        <p class="mini-block-narrow"><a-button @click="addNum">加一</a-button></p>
        <JumpBtn class="big-block-narrow" />
    </div>
</template>
<script setup>
import JumpBtn from '@/components/JumpBtn.vue'
import { useCounterStore } from '@/store/counter';
const counter = useCounterStore();

const addNum = () => {
    counter.increment();
}

console.log(counter.count);
</script>

<style scoped lang="less">
.greeting-container {
    padding-top: 200px;
    text-align: center;
    width: 100%;
    font-size: 30px;
    margin-bottom: 0.5em;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
}

h2 {
    margin-top: 40px;
}
</style>
