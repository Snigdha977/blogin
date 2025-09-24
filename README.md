# 📝 Blogin

**Blogin** is a modern full-stack blogging platform built using the **MERN stack** (MongoDB, Express.js, React, Node.js).  
It provides a smooth writing and reading experience with features like rich text editing, authentication, image uploads, search, and an admin panel — everything you need to build and manage blogs in one place.

---

## 🚀 Features

- 🔐 **Authentication & Authorization** – Secure login/register with JWT, role-based access (users, admins)  
- ✍️ **Rich Text Editor** – Format blog posts beautifully with React Quill  
- 🖼️ **Media Uploads** – Cloudinary integration for image handling  
- 📱 **Responsive Design** – Works on desktop, tablet, and mobile  
- 💬 **User Engagement** – Like, comment, follow, bookmark posts  
- 🔍 **Search & Tags** – Find blogs by keywords, categories, or tags  
- 🧩 **Admin Panel** – Manage users, blogs, and site activity  
- ⚡ **Performance** – Optimized with lazy loading, caching, and route splitting  

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Auth & Security:** JWT, Bcrypt, Helmet, CORS  
**Storage:** Cloudinary, Multer  
**Frontend:** React, Vite, React Router, React Query  
**UI / Styling:** Tailwind CSS, shadcn/ui, Lucide React, Framer Motion  
**Forms & Data:** React Hook Form, Axios  
**Notifications:** React Hot Toast  

---

## 📂 Project Structure

blogin/
├── server/ # Backend (APIs, models, controllers, routes)
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ └── server.js
├── client/ # Frontend (React app)
│ ├── public/
│ └── src/
│ ├── components/
│ ├── pages/
│ ├── hooks/
│ ├── contexts/
│ └── services/
└── README.md

yaml
Copy code

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)  
- MongoDB (local or Atlas)  
- Cloudinary account for media uploads  

### Setup Instructions

1. **Clone the repo**
   ```bash
   git clone https://github.com/Snigdha977/blogin.git
   cd blogin
Install dependencies
Backend:

bash
Copy code
cd server
npm install
Frontend:

bash
Copy code
cd ../client
npm install
Configure environment variables

In server/.env:

ini
Copy code
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
CLIENT_URL=http://localhost:5173
In client/.env:

bash
Copy code
VITE_API_URL=http://localhost:5000/api
Run the app
Backend:

bash
Copy code
cd server
npm run dev
Frontend:

bash
Copy code
cd ../client
npm run dev
Open in browser:

Frontend → http://localhost:5173

Backend API → http://localhost:5000/api

🔗 Example API Endpoints
Endpoint	Method	Description
/api/auth/register	POST	Register a new user
/api/auth/login	POST	User login with JWT
/api/blogs	GET	Fetch all blogs
/api/blogs/:slug	GET	Get blog by slug
/api/blogs	POST	Create a new blog
/api/blogs/:id	PUT	Update a blog
/api/blogs/:id	DELETE	Delete a blog
/api/comments/:blogId	GET	Fetch blog comments
/api/users/:username	GET	Get user profile
/api/admin/users	GET	Admin: view all users

🎯 Why Blogin?
✅ End-to-end solution – from writing to publishing, engagement, and admin tools
✅ Rich media support – blogs with images and formatted text
✅ Role-based access – secure privileges for users & admins
✅ Built-in engagement – comments, likes, bookmarks, and following
✅ Modern & responsive – clean design, fast loading, works everywhere

🧪 Testing
Backend tests:

bash
Copy code
cd server
npm test
Frontend tests:

bash
Copy code
cd client
npm test
🌍 Deployment
Backend → Railway / Heroku / AWS

Frontend → Vercel / Netlify

Database → MongoDB Atlas

Images → Cloudinary

🤝 Contributing
Contributions are welcome!

Fork the repo

Create a feature branch (git checkout -b feature/your-feature)

Commit changes (git commit -m "Add new feature")

Push branch (git push origin feature/your-feature)

Open a Pull Request

📜 License
This project is licensed under the MIT License.
#Support
For queries contact
email-snigdhasaha.student@gmail.com


