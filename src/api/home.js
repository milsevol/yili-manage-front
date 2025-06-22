import { axiosGet, axiosPost } from '@/utils/axios.js';

function getList(data) {
    let url = '/getList';
    return axiosGet(url, data);
}

function addItem(data) {
    let url = '/addItem';
    return axiosPost(url, data);
}

export { getList, addItem };
