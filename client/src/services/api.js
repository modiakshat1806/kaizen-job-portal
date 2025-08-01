import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Student API
export const studentAPI = {
  // Save student assessment
  saveAssessment: (data) => api.post('/student', data),
  
  // Get student by phone
  getByPhone: (phone) => api.get(`/student/${phone}`),
  
  // Update student assessment
  updateAssessment: (phone, data) => api.put(`/student/${phone}`, data),
}

// Job API
export const jobAPI = {
  // Create new job posting
  createJob: (data) => api.post('/job', data),
  
  // Get job by ID
  getById: (id) => api.get(`/job/${id}`),
  
  // Get all jobs
  getAll: (params = {}) => api.get('/job', { params }),
  
  // Update job
  updateJob: (id, data) => api.put(`/job/${id}`, data),
}

// Fitment API
export const fitmentAPI = {
  // Calculate fitment score
  calculateFitment: (studentPhone, jobId) => 
    api.get(`/fitment/${studentPhone}/${jobId}`),
}

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
}

export default api 