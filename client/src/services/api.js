import axios from 'axios'

// Use environment-specific API URL
const API_BASE_URL = import.meta.env.PROD
  ? 'REPLACE_WITH_YOUR_RAILWAY_URL/api'  // Production: Railway backend
  : '/api'  // Development: use proxy from vite.config.js

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
  // Calculate fitment score for a specific job
  calculateFitment: (studentPhone, jobId) =>
    api.get(`/fitment/${studentPhone}/${jobId}`),

  // Get all matched jobs for a student
  getMatchedJobs: (studentPhone, params = {}) =>
    api.get(`/fitment/${studentPhone}`, { params }),
}

// Recommendations API
export const recommendationsAPI = {
  // Generate job recommendations using OpenAI
  generateRecommendations: (assessmentData) =>
    api.post('/recommendations/generate', { assessmentData }),

  // Process voice input using OpenAI Whisper
  processVoiceInput: (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'voice-input.webm')

    return api.post('/recommendations/voice-process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// Voice API
export const voiceAPI = {
  // Transcribe audio using OpenAI Whisper
  transcribe: (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.webm')

    return api.post('/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Extract form fields from transcript
  extractFields: (transcript, formType = 'student_assessment') =>
    api.post('/voice/extract-fields', { transcript, formType })
}

// Admin API
export const adminAPI = {
  // Get all jobs for admin dashboard
  getAllJobs: (params = {}) => api.get('/admin/jobs', { params }),

  // Delete a job
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),

  // Toggle job status
  toggleJobStatus: (id, isActive) => api.put(`/admin/jobs/${id}/status`, { isActive }),

  // Search student by phone
  searchStudent: (phone) => api.get(`/admin/students/search/${phone}`),

  // Generate student summary
  generateStudentSummary: (phone) => api.post(`/admin/students/${phone}/summary`),

  // Delete student profile (role deletion)
  deleteStudent: (phone) => api.delete(`/admin/students/${phone}`)
}

// Job Application API
export const jobApplicationAPI = {
  // Apply for a job
  applyForJob: (studentPhone, jobId, fitmentScore) =>
    api.post('/job-application/apply', { studentPhone, jobId, fitmentScore }),

  // Save a job
  saveJob: (studentPhone, jobId) =>
    api.post('/job-application/save', { studentPhone, jobId }),

  // Get saved jobs for a student
  getSavedJobs: (phone) =>
    api.get(`/job-application/saved/${phone}`),

  // Get all applications for a company
  getCompanyApplications: (companyName) =>
    api.get(`/job-application/company/${companyName}`),

  // Remove a saved job
  removeSavedJob: (phone, jobId) =>
    api.delete(`/job-application/saved/${phone}/${jobId}`)
}

// College API
export const collegeAPI = {
  // Search colleges
  search: (query, limit = 10) => api.get('/college/search', { params: { q: query, limit } }),

  // Get popular colleges
  getPopular: (limit = 15) => api.get('/college/popular', { params: { limit } }),

  // Get colleges by region
  getByRegion: (region, limit = 20) => api.get(`/college/region/${region}`, { params: { limit } }),

  // Add new college
  add: (data) => api.post('/college/add', data),

  // Bulk add colleges
  bulkAdd: (colleges) => api.post('/college/bulk-add', { colleges }),

  // Get statistics
  getStats: () => api.get('/college/stats'),

  // Verify college (admin)
  verify: (id, verified = true) => api.put(`/college/${id}/verify`, { verified })
}

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
}

export default api