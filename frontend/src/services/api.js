/**
 * API Service
 * Handles all HTTP requests to the backend.
 * Centralizes API calls for consistency.
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - adds auth token to every request
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - handles errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken')
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login'
                toast.error('Your session has expired. Please login again.')
            }
        }

        // Handle other errors
        if (error.response?.data?.error) {
            toast.error(error.response.data.error)
        }

        return Promise.reject(error)
    }
)

// API functions for Products
export const productAPI = {
    // Get all products with optional filters
    getAll: (params) => api.get('/products/', { params }),

    // Get a single product by ID
    getOne: (id) => api.get(`/products/${id}/`),

    // Create a new product
    create: (data) => api.post('/products/', data),

    // Update a product
    update: (id, data) => api.put(`/products/${id}/`, data),

    // Delete a product
    delete: (id) => api.delete(`/products/${id}/`),

    // Update stock
    updateStock: (id, data) => api.post(`/products/${id}/update_stock/`, data),

    // Get low stock products
    getLowStock: () => api.get('/products/low_stock/'),

    // Get product statistics
    getStats: () => api.get('/products/statistics/'),
}

// API functions for Categories
export const categoryAPI = {
    getAll: () => api.get('/categories/'),
    create: (data) => api.post('/categories/', data),
    update: (id, data) => api.put(`/categories/${id}/`, data),
    delete: (id) => api.delete(`/categories/${id}/`),
}

// API functions for Suppliers
export const supplierAPI = {
    getAll: () => api.get('/suppliers/'),
    create: (data) => api.post('/suppliers/', data),
    update: (id, data) => api.put(`/suppliers/${id}/`, data),
    delete: (id) => api.delete(`/suppliers/${id}/`),
}

// API functions for Sales
export const salesAPI = {
    getAll: (params) => api.get('/sales/', { params }),
    create: (data) => api.post('/sales/', data),
    getSummary: () => api.get('/sales/sales_summary/'),
}

// API functions for Purchase Orders
export const purchaseOrderAPI = {
    getAll: (params) => api.get('/purchase-orders/', { params }),
    create: (data) => api.post('/purchase-orders/', data),
    receive: (id) => api.post(`/purchase-orders/${id}/receive_order/`),
}

// API functions for Stock Transactions
export const transactionAPI = {
    getAll: (params) => api.get('/transactions/', { params }),
}

// API functions for Users
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Get auth token from localStorage
export const getAuthToken = () => {
    return localStorage.getItem('authToken')
}

// Set auth token in localStorage
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token)
    } else {
        localStorage.removeItem('authToken')
    }
}

// Fetch user role from backend
export const fetchUserRole = async () => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('No auth token found')
    }

    try {
        const response = await fetch(`${API_URL}/user/role/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching user role:', error)
        throw error
    }
}

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken()

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
}


export default api
