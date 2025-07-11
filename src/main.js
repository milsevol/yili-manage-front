import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './style/reset.css'
import './style.css'
import '@/style/global.less'
import App from './App.vue'
import router from '@/router/router'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');
