import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor: Tự động đính kèm Bearer token vào Header
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('hrm_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý dữ liệu trả về và bắt lỗi 401 Unauthorized
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            if (!['/login', '/register', '/verify-otp'].includes(currentPath)) {
                localStorage.removeItem('hrm_token');
                localStorage.removeItem('hrm_user');
                window.location.href = '/login';
            }
        }
        const customError = {
            message: error.response?.data?.message || error.message || 'Lỗi kết nối máy chủ!',
            status: error.response?.status,
            data: error.response?.data,
        };
        return Promise.reject(customError);
    }
);

export default axiosClient;
