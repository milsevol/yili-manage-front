<template>
    <div>
        <AButton @click="toAbout">跳转 about</AButton>
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
