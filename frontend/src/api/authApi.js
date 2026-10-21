import axiosClient from './axiosClient';

const authApi = {
    login: (data) => axiosClient.post('/auth/login', data),
    register: (data) => axiosClient.post('/auth/register', data),
    verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),
    resendOtp: (data) => axiosClient.post('/auth/resend-otp', data),
    getMe: () => axiosClient.get('/auth/me'),
};

export default authApi;
