import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
    })
    return response
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => {
    console.log("🔄 Logging in user...")
    return api.post("/auth/login", credentials)
  },
  register: (userData) => {
    console.log("🔄 Registering user...")
    return api.post("/auth/register", userData)
  },
  getMe: () => {
    console.log("🔄 Fetching current user...")
    return api.get("/auth/me")
  },
  refreshToken: () => {
    console.log("🔄 Refreshing token...")
    return api.post("/auth/refresh")
  },
  updateProfile: (userData) => {
    console.log("🔄 Updating auth profile...")
    return api.put("/auth/profile", userData)
  },
  uploadAvatar: (formData) =>
    api.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

// Blog API
export const blogAPI = {
  getAllBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/blogs${queryString ? `?${queryString}` : ""}`)
  },
  getBlogs: (params = {}) => {
    console.log("🔄 Fetching blogs with params:", params)
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/blogs${queryString ? `?${queryString}` : ""}`)
  },
  getBlogBySlug: (slug) => {
    console.log("🔄 Fetching blog by slug:", slug)
    return api.get(`/blogs/${slug}`)
  },
  getBlogById: (id) => {
    console.log("🔄 Fetching blog by ID:", id)
    return api.get(`/blogs/edit/${id}`)
  },
  getMyBlogs: (params = {}) => {
    console.log("🔄 Fetching my blogs...")
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/blogs/my-blogs${queryString ? `?${queryString}` : ""}`)
  },
  getUserBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/blogs/user/me${queryString ? `?${queryString}` : ""}`)
  },
  createBlog: (formData) => {
    console.log("🔄 Creating blog...")
    return api.post("/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  updateBlog: (id, formData) => {
    console.log("🔄 Updating blog:", id)
    return api.put(`/blogs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  deleteBlog: (id) => {
    console.log("🔄 Deleting blog:", id)
    return api.delete(`/blogs/${id}`)
  },
  likeBlog: (id) => {
    console.log("🔄 Toggling like for blog:", id)
    return api.post(`/blogs/${id}/like`)
  },
  uploadImage: (formData) =>
    api.post("/blogs/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

// Comment API
export const commentAPI = {
  getComments: (blogId) => {
    console.log("🔄 Fetching comments for blog:", blogId)
    return api.get(`/comments/${blogId}`)
  },
  createComment: (commentData) => {
    console.log("🔄 Creating comment...")
    return api.post("/comments", commentData)
  },
  updateComment: (id, commentData) => {
    console.log("🔄 Updating comment:", id)
    return api.put(`/comments/${id}`, commentData)
  },
  deleteComment: (id) => {
    console.log("🔄 Deleting comment:", id)
    return api.delete(`/comments/${id}`)
  },
  likeComment: (id) => {
    console.log("🔄 Toggling like for comment:", id)
    return api.post(`/comments/${id}/like`)
  },
}

// Admin API with enhanced logging
export const adminAPI = {
  getDashboardStats: async () => {
    console.log("🔄 Fetching admin dashboard stats...")
    try {
      const response = await api.get("/admin/stats")
      console.log("✅ Admin stats received:", {
        success: response.data.success,
        statsKeys: Object.keys(response.data.data?.stats || {}),
        stats: response.data.data?.stats,
        recentActivityKeys: Object.keys(response.data.data?.recentActivity || {}),
      })
      return response
    } catch (error) {
      console.error("❌ Admin stats error:", error.response?.data || error.message)
      throw error
    }
  },
  getDetailedStats: async (type, params = {}) => {
    console.log(`🔄 Fetching detailed ${type} stats...`)
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/stats/${type}${queryString ? `?${queryString}` : ""}`)
      console.log(`✅ Detailed ${type} stats received:`, {
        success: response.data.success,
        itemCount: response.data.data?.items?.length || 0,
        total: response.data.data?.pagination?.total || 0,
      })
      return response
    } catch (error) {
      console.error(`❌ Detailed ${type} stats error:`, error.response?.data || error.message)
      throw error
    }
  },
  getAllUsers: async (params = {}) => {
    console.log("🔄 Fetching admin users...")
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/users${queryString ? `?${queryString}` : ""}`)
      console.log("✅ Admin users received:", {
        success: response.data.success,
        userCount: response.data.data?.users?.length || 0,
        totalUsers: response.data.data?.pagination?.totalUsers || 0,
      })
      return response
    } catch (error) {
      console.error("❌ Admin users error:", error.response?.data || error.message)
      throw error
    }
  },
  getAllBlogs: async (params = {}) => {
    console.log("🔄 Fetching admin blogs...")
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/blogs${queryString ? `?${queryString}` : ""}`)
      console.log("✅ Admin blogs received:", {
        success: response.data.success,
        blogCount: response.data.data?.blogs?.length || 0,
        totalBlogs: response.data.data?.pagination?.totalBlogs || 0,
      })
      return response
    } catch (error) {
      console.error("❌ Admin blogs error:", error.response?.data || error.message)
      throw error
    }
  },
  updateUserStatus: (userId, statusData) => api.put(`/admin/users/${userId}/status`, statusData),
  updateUserRole: (userId, roleData) => {
    console.log(`🔄 Updating user ${userId} role to ${roleData.role}`)
    return api.put(`/admin/users/${userId}/role`, roleData)
  },
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateBlogStatus: (blogId, statusData) => api.put(`/admin/blogs/${blogId}/status`, statusData),
}

// User API
export const userAPI = {
  getUserProfile: (username) => {
    console.log("🔄 Fetching user profile for:", username)
    return api.get(`/users/${username}`)
  },
  updateProfile: (formData) => {
    console.log("🔄 Updating user profile...")
    return api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  followUser: (userId) => {
    console.log("🔄 Following/unfollowing user:", userId)
    return api.post(`/users/${userId}/follow`)
  },
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
}

export default api
