# Employee Leave Management System

A modern full-stack web application for managing employee leave requests with role-based access control, built with Vue.js, Node.js, Express, and MongoDB Atlas.

## 🎯 Assignment Overview

This project is developed as an internship assignment for HuskyVoice.ai, demonstrating proficiency in:
- Vue.js 3 with Tailwind CSS
- Node.js/Express REST API
- MongoDB Atlas integration  
- JWT authentication and role-based access
- Clean code structure and deployment readiness

## ✨ Key Features

### For Employees
- 🔐 Secure signup and login
- 📝 Apply for leave with date range, type, and detailed reason
- 📊 Personal dashboard with leave statistics
- 📋 View leave application history with status tracking
- ✅ Real-time status updates (Pending/Approved/Rejected)

### For Employers
- 👥 View all employee leave requests
- ✅ Approve or reject applications with manager notes
- 🔍 Search and filter by employee, department, or status
- 📈 Company-wide leave analytics
- 💬 Add feedback/remarks for employees

## 🛠️ Tech Stack

### Frontend (Mandatory)
- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Pinia** - Intuitive state management
- **Vue Router** - Client-side routing with guards
- **Axios** - HTTP client with interceptors
- **Lucide Icons** - Beautiful, consistent icons
- **date-fns** - Modern date utility library

### Backend (Node.js)
- **Express.js** - Minimalist web framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - Stateless authentication
- **bcryptjs** - Secure password hashing  
- **express-validator** - Request validation middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js v18+ (v20.11.1 recommended)
- npm or yarn package manager
- MongoDB Atlas account (free tier)
- Git for version control

## 🚀 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/RahulChoudhary05/EmployeeLeaveManagementSystem.git
cd EmployeeLeaveManagementSystem
```

### 2. Backend Configuration

```bash
cd backend
npm install
```

Create `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/leave-management?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> **Important:** Replace `MONGO_URI` with your actual MongoDB Atlas connection string.

**Start backend server:**

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Configuration

Open a new terminal:

```bash
cd frontend
npm install
```

**Optional:** Create `.env` file in `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

**Start development server:**

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Access Application

Open browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user (employee/employer) |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| GET | `/api/auth/me` | Private | Get current user profile |

### Leave Management Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/leaves` | Employee | Apply for new leave |
| GET | `/api/leaves/my` | Employee | Get own leave history |
| GET | `/api/leaves` | Employer | Get all employee leaves |
| GET | `/api/leaves/stats` | Both | Get leave statistics |
| GET | `/api/leaves/:id` | Both | Get specific leave details |
| PATCH | `/api/leaves/:id/review` | Employer | Approve/Reject leave |
| DELETE | `/api/leaves/:id` | Employee | Delete own leave request |


## 🏗️ Project Structure

```
EmployeeLeaveManagementSystem/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Auth logic
│   │   │   ├── leave.controller.js      # Leave CRUD operations
│   │   │   └── user.controller.js       # User management
│   │   ├── middleware/
│   │   │   └── auth.middleware.js       # JWT verification & RBAC
│   │   ├── models/
│   │   │   ├── User.model.js            # User schema
│   │   │   └── Leave.model.js           # Leave schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── leave.routes.js
│   │   │   └── user.routes.js
│   │   └── app.js                       # Express app config
│   ├── server.js                        # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js                 # Axios config with interceptors
│   │   ├── components/
│   │   ├── layouts/
│   │   │   └── DashboardLayout.vue      # Main layout with sidebar
│   │   ├── router/
│   │   │   └── index.js                 # Route definitions & guards
│   │   ├── stores/
│   │   │   ├── auth.js                  # Auth state (Pinia)
│   │   │   └── leave.js                 # Leave state (Pinia)
│   │   ├── views/
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   ├── EmployeeDashboard.vue    # Employee interface
│   │   │   └── EmployerDashboard.vue    # Employer interface
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css                    # Tailwind imports
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

## 🎨 UI/UX Enhancements

### Employee Dashboard
- 🌈 Modern gradient header with clear CTAs
- 📊 Color-coded statistics cards with icons
- 📋 Professional data table with status badges
- ✨ Enhanced leave application modal
- ✅ Form validation (date range, required fields)
- 🎯 Loading and empty states
- 📱 Fully responsive design

### Employer Dashboard
- 🎯 Clean, functional interface
- 🔍 Real-time search across name/department
- 🔽 Status filter (All/Pending/Approved/Rejected)
- ⚡ Quick approve/reject action buttons
- 📝 Detailed review modal with employee context
- 🎨 Status-based visual feedback
- 💡 Mobile-optimized layout

## 🔒 Security Features

✅ **Authentication**
- JWT-based stateless authentication
- 7-day token expiration (configurable)
- HTTP-only token storage recommended for production
  
✅ **Authorization**
- Role-based access control (RBAC)
- Protected routes with middleware
- Employee/Employer route restrictions

✅ **Data Protection**
- Password hashing with bcryptjs (10 rounds)
- Input sanitization via express-validator
- CORS configuration for trusted origins
- MongoDB injection prevention via Mongoose

## 🌐 Deployment Guide

### MongoDB Atlas Setup

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Network Access:** Add `0.0.0.0/0` (allow from anywhere)
3. **Database Access:** Create user with read/write privileges
4. Copy connection string for `.env`

### Backend Deployment (Render/Railway)

**Platform:** [Render](https://render.com) (Free Tier)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. **Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add all from `.env`
5. Deploy and copy live URL

**Alternative Platforms:**
- Railway.app
- Heroku
- AWS EC2 (Elastic Beanstalk)
- Azure App Service
- Google Cloud Run

### Frontend Deployment (Vercel/Netlify)

**Platform:** [Vercel](https://vercel.com) (Recommended)

1. Connect GitHub repository to Vercel
2. **Settings:**
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables:**
   - `VITE_API_URL`: Your backend URL from Render (e.g., `https://your-app.onrender.com/api`)
4. Deploy automatically

**Alternative Platforms:**
- Netlify
- AWS Amplify
- Azure Static Web Apps
- GitHub Pages (with router config)

### Production Environment Variables

**Backend `.env`:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=<secure-random-string-min-32-chars>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-vercel-url.vercel.app
```

**Frontend `.env`:**
```env
VITE_API_URL=https://your-backend-render-url.onrender.com/api
```

## 🧪 Testing the Application

### Create Test Accounts

**Employee:**
1. Go to Register page
2. Select "Employee" role
3. Fill in details and sign up
4. Login and apply for leaves

**Employer:**
1. Register with "Employer" role
2. Login to access employer dashboard
3. View/approve/reject employee requests

### Test Workflow

1. **Employee Flow:**
   - Register → Login → Apply Leave → Check Status
2. **Employer Flow:**
   - Register → Login → View Requests → Approve/Reject → Add Notes

## 🐛 Troubleshooting

### Common Issues

**Frontend won't build:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Backend connection error:**
- ✅ Check MongoDB Atlas IP whitelist
- ✅ Verify `.env` MONGO_URI format
- ✅ Ensure database user has correct permissions

**Authentication fails:**
- ✅ Clear browser localStorage
- ✅ Check JWT_SECRET consistency
- ✅ Verify token hasn't expired

**Vite proxy error:**
- Ensure backend is running on port 5000
- Check `vite.config.js` proxy settings
- Or set `VITE_API_URL` to direct backend URL

## ✅ Assignment Compliance Checklist

- [x] Vue.js frontend with Tailwind CSS
- [x] Node.js backend with REST APIs
- [x] MongoDB Atlas database integration
- [x] Employee signup, login, leave application, status viewing
- [x] Employer signup, login, view requests, approve/reject
- [x] JWT-based authentication
- [x] Role-based access control
- [x] Input validation (dates, required fields)
- [x] Clean folder structure
- [x] Environment variables for sensitive data
- [x] Basic error handling
- [x] Comprehensive README
- [x] Deployment ready
- [x] Public URL capability

## 📝 Submission Details

**Repository:** https://github.com/RahulChoudhary05/EmployeeLeaveManagementSystem

**Live Demo:** [Add deployment URL here after deployment]

**Estimated Development Time:** 8-10 hours

**AI Tools Used:** GitHub Copilot for code assistance and syntax reference

## 👤 Developer

**Rahul Choudhary**
- GitHub: [@RahulChoudhary05](https://github.com/RahulChoudhary05)
- Email: hiring@huskyvoice.ai (Submission)

## 📄 License

This is an assignment project for HuskyVoice.ai internship application.

---

**Note:** This application demonstrates full-stack development proficiency with modern web technologies and is ready for immediate deployment on free-tier cloud platforms.
