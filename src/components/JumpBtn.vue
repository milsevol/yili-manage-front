<template>
    <div>
        <a-button @click="toAbout">跳转 about</a-button>
    </div>
</template>

<script setup>
import router from '@/router/router';

const toAbout = () => {
    router.push('./about');
};

</script>

<style scoped>
.msg {
    font-size: 14px;
}
</style>
