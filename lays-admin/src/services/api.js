import axios from 'axios'

const API_BASE_URL = 'https://eindproject-node.onrender.com/api/v1'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401/403 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API Functions
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/user/auth', { email, password })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getBags = async () => {
  try {
    const response = await apiClient.get('/bag')
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteBag = async (id) => {
  try {
    const response = await apiClient.delete(`/bag/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getVotes = async (bagId) => {
  try {
    const response = await apiClient.get(`/votes/${bagId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllVotes = async () => {
  try {
    const response = await apiClient.get('/votes')
    return response.data
  } catch (error) {
    throw error
  }
}

export default apiClient
