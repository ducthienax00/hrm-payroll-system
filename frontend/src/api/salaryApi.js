import axiosClient from './axiosClient';

const salaryApi = {
    getAll: (params) => axiosClient.get('/salaries', { params }),
    calculate: (data) => axiosClient.post('/salaries/calculate', data),
    updateStatus: (id, data) => axiosClient.patch(`/salaries/${id}/status`, data),
    delete: (id) => axiosClient.delete(`/salaries/${id}`),
};

export default salaryApi;
