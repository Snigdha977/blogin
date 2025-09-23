import User from "../models/User.js"
import Blog from "../models/Blog.js"
import Comment from "../models/Comment.js"
import mongoose from "mongoose"

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    console.log("🔍 Admin dashboard stats requested by:", req.user.username)

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ Database not connected")
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      })
    }

    console.log("✅ Database connected, fetching stats...")

    // Get collection stats first
    const userCollection = mongoose.connection.db.collection("users")
    const blogCollection = mongoose.connection.db.collection("blogs")
    const commentCollection = mongoose.connection.db.collection("comments")

    const [userCount, blogCount, commentCount] = await Promise.all([
      userCollection.countDocuments(),
      blogCollection.countDocuments(),
      commentCollection.countDocuments(),
    ])

    console.log("📊 Raw collection counts:")
    console.log("- Users:", userCount)
    console.log("- Blogs:", blogCount)
    console.log("- Comments:", commentCount)

    // Get published blogs count
    const publishedCount = await blogCollection.countDocuments({ status: "published" })
    console.log("- Published blogs:", publishedCount)

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username firstName lastName createdAt avatar")
      .lean()

    console.log("👥 Recent users found:", recentUsers.length)

    // Get recent blogs
    const recentBlogs = await Blog.find()
      .populate("author", "username firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title slug status createdAt")
      .lean()

    console.log("📝 Recent blogs found:", recentBlogs.length)

    // Prepare response
    const responseData = {
      success: true,
      data: {
        stats: {
          totalUsers: userCount,
          totalBlogs: blogCount,
          totalComments: commentCount,
          publishedBlogs: publishedCount,
          draftBlogs: blogCount - publishedCount,
        },
        recentActivity: {
          users: recentUsers,
          blogs: recentBlogs,
        },
        charts: {
          monthlyBlogs: [],
          userGrowth: [],
        },
      },
    }

    console.log("✅ Sending admin stats response:", {
      totalUsers: userCount,
      totalBlogs: blogCount,
      totalComments: commentCount,
      publishedBlogs: publishedCount,
    })

    res.json(responseData)
  } catch (error) {
    console.error("❌ Admin stats error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    console.log("🔍 Admin users requested by:", req.user.username)

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { search, role, status } = req.query

    // Build query
    const query = {}

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ]
    }

    if (role && role !== "all") {
      query.role = role
    }

    if (status && status !== "all") {
      query.isActive = status === "active"
    }

    console.log("🔍 User query:", query)

    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-password").lean()

    const total = await User.countDocuments(query)

    console.log(`✅ Found ${users.length} users out of ${total} total`)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("❌ Admin get users error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    })
  }
}

// @desc    Get all blogs with pagination
// @route   GET /api/admin/blogs
// @access  Private/Admin
export const getAllBlogs = async (req, res) => {
  try {
    console.log("🔍 Admin blogs requested by:", req.user.username)

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { search, status, category } = req.query

    // Build query
    const query = {}

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
    }

    if (status && status !== "all") {
      query.status = status
    }

    if (category && category !== "all") {
      query.category = category
    }

    console.log("🔍 Blog query:", query)

    const blogs = await Blog.find(query)
      .populate("author", "username firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Blog.countDocuments(query)

    console.log(`✅ Found ${blogs.length} blogs out of ${total} total`)

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("❌ Admin get blogs error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    })
  }
}

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message,
    })
  }
}

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body

    // Validate role
    const validRoles = ["user", "admin", "moderator"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: user, admin, moderator",
      })
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      })
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    console.log(`Admin ${req.user.username} changed user ${user.username} role to ${role}`)

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: user,
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message,
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      })
    }

    // Delete user's blogs and comments
    await Promise.all([
      Blog.deleteMany({ author: req.params.id }),
      Comment.deleteMany({ author: req.params.id }),
      User.findByIdAndDelete(req.params.id),
    ])

    console.log(`Admin ${req.user.username} deleted user ${user.username}`)

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    })
  }
}

// @desc    Update blog status
// @route   PUT /api/admin/blogs/:id/status
// @access  Private/Admin
export const updateBlogStatus = async (req, res) => {
  try {
    const { status } = req.body

    const blog = await Blog.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      "author",
      "username firstName lastName",
    )

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      })
    }

    res.json({
      success: true,
      message: "Blog status updated successfully",
      data: blog,
    })
  } catch (error) {
    console.error("Update blog status error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating blog status",
      error: error.message,
    })
  }
}

// @desc    Get detailed stats for specific category
// @route   GET /api/admin/stats/:type
// @access  Private/Admin
export const getDetailedStats = async (req, res) => {
  try {
    const { type } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    console.log(`🔍 Admin requesting detailed ${type} stats`)

    let data = []
    let total = 0

    switch (type) {
      case "users":
        data = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select("-password").lean()
        total = await User.countDocuments()
        break

      case "blogs":
        data = await Blog.find()
          .populate("author", "username firstName lastName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
        total = await Blog.countDocuments()
        break

      case "published-blogs":
        data = await Blog.find({ status: "published" })
          .populate("author", "username firstName lastName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
        total = await Blog.countDocuments({ status: "published" })
        break

      case "comments":
        data = await Comment.find()
          .populate("author", "username firstName lastName")
          .populate("blog", "title slug")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
        total = await Comment.countDocuments()
        break

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid stats type",
        })
    }

    console.log(`✅ Found ${data.length} ${type} out of ${total} total`)

    res.json({
      success: true,
      data: {
        items: data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        type,
      },
    })
  } catch (error) {
    console.error(`❌ Admin detailed ${req.params.type} stats error:`, error)
    res.status(500).json({
      success: false,
      message: `Error fetching detailed ${req.params.type} stats`,
      error: error.message,
    })
  }
}
