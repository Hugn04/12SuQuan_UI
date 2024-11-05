import axios from 'axios';

const request = axios.create({
    baseURL: import.meta.env.VITE_SOME_SERVER + '/api',
    timeout: 1000,
    headers: { Bearer: localStorage.getItem('asset_token') },
});

// Request Interceptor
request.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    },
);

// Response Interceptor
request.interceptors.response.use(
    (response) => {
        return response.data; // Trả về response data nếu bạn chỉ cần dữ liệu
    },
    (error) => {
        //console.log(error);

        return Promise.reject(error); // Trả lỗi về cho người gọi
    },
);

export default request;
