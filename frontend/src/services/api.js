// src/services/api.js
import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD
        ? 'https://stockpulse-backend-2iy4.onrender.com/api'
        : 'http://localhost:8000/api'),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - adds auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - handles errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken')
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login'
                toast.error('Your session has expired. Please login again.')
            }
        }
        return Promise.reject(error)
    }
)

// Product API
export const productAPI = {
    getAll: (params) => api.get('/products/', { params }),
    getOne: (id) => api.get(`/products/${id}/`),
    create: (data) => api.post('/products/', data),
    update: (id, data) => api.put(`/products/${id}/`, data),
    delete: (id) => api.delete(`/products/${id}/`),
    updateStock: (id, data) => api.post(`/products/${id}/update_stock/`, data),
    getLowStock: () => api.get('/products/low_stock/'),
    getStats: () => api.get('/products/statistics/'),
    getSalesSummary: () => api.get('/sales/sales_summary/'),
}

// Sales API - ADD THIS
export const salesAPI = {
    getAll: (params) => api.get('/sales/', { params }),
    getOne: (id) => api.get(`/sales/${id}/`),
    create: (data) => api.post('/sales/', data),
    update: (id, data) => api.put(`/sales/${id}/`, data),
    delete: (id) => api.delete(`/sales/${id}/`),
    getSummary: () => api.get('/sales/sales_summary/'),
}

// Category API
export const categoryAPI = {
    getAll: () => api.get('/categories/'),
    create: (data) => api.post('/categories/', data),
    update: (id, data) => api.put(`/categories/${id}/`, data),
    delete: (id) => api.delete(`/categories/${id}/`),
}

// Supplier API
export const supplierAPI = {
    getAll: () => api.get('/suppliers/'),
    create: (data) => api.post('/suppliers/', data),
    update: (id, data) => api.put(`/suppliers/${id}/`, data),
    delete: (id) => api.delete(`/suppliers/${id}/`),
}

// User API
export const userAPI = {
    getProfile: async (token) => {
        const response = await api.get('/users/me/', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response
    },
    getAll: () => api.get('/users/'),
    setRole: (userId, role) => api.post(`/users/${userId}/set_role/`, { role }),
}

export default api
