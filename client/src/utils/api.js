import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transfast_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('transfast_token');
      localStorage.removeItem('transfast_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// API service methods
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => API.put('/auth/change-password', data),
  verifyEmail: (token) => API.get(`/auth/verify-email/${token}`),
};

export const transferAPI = {
  getQuote: (params) => API.get('/transfers/quote', { params }),
  initiate: (data) => API.post('/transfers', data),
  getAll: (params) => API.get('/transfers', { params }),
  getOne: (id) => API.get(`/transfers/${id}`),
  cancel: (id) => API.put(`/transfers/${id}/cancel`),
};

export const beneficiaryAPI = {
  getAll: () => API.get('/beneficiaries'),
  add: (data) => API.post('/beneficiaries', data),
  update: (id, data) => API.put(`/beneficiaries/${id}`, data),
  remove: (id) => API.delete(`/beneficiaries/${id}`),
};

export const kycAPI = {
  submit: (data) => API.post('/kyc/submit', data),
  getStatus: () => API.get('/kyc/status'),
};

export const exchangeAPI = {
  getRates: (params) => API.get('/exchange/rates', { params }),
  getCountries: () => API.get('/exchange/countries'),
};

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUserStatus: (id, data) => API.put(`/admin/users/${id}/status`, data),
  getTransactions: (params) => API.get('/admin/transactions', { params }),
  updateTransactionStatus: (id, data) => API.put(`/admin/transactions/${id}/status`, data),
  getKYCList: (params) => API.get('/admin/kyc', { params }),
  reviewKYC: (id, data) => API.put(`/admin/kyc/${id}/review`, data),
  getAuditLogs: (params) => API.get('/admin/audit-logs', { params }),
};
