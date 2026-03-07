# Employee Leave Management System

A full-stack Web Application built using the **MEVN Stack** (MongoDB, Express, Vue.js, Node.js). It provides an intuitive platform where employees can request time off, and employers can seamlessly review, approve, or reject these requests with actionable insights.

![Dashboard Preview](https://dribbble.com/shots/26984320-Time-Tracking-Dashboard-UI-UX-Design-for-Team-Management)

## 🚀 Features
- **Role-based Access Control:** Distinct experiences for `Employee` and `Employer` accounts.
- **Dynamic Stats Board:** Rich real-time visualizations for leave statuses, limits, and totals.
- **JWT Authentication:** Stateful and secure authorization tokens.
- **MongoDB Atlas Integration:** Fully scaled cloud NoSQL infrastructure.
- **RESTful API Architecture:** Robust decoupled Node.js/Express.js backend.
- **Premium Dribbble UI:** Glassmorphism, smooth animations, and top-tier aesthetic implementation utilizing Tailwind CSS.
- **Global Error Handling:** Complete validation on both forms and backend routes.

---

## 💻 Tech Stack
- **Frontend**: Vue.js 3 (Composition API), Vite, Tailwind CSS, Pinia (State Management), Vue Router.
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs, express-validator.
- **Database**: MongoDB Atlas (Cloud NoSQL), Mongoose ORM.

---

## 🛠️ Project Setup & Installation

Follow these steps to set up the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/leave-management-system.git
cd leave-management-system
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file based on the .env.example
cp .env.example .env
```
Ensure your `backend/.env` file looks like this:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```
Start the backend server:
```bash
# Run in development mode
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```
Access the application locally at: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Endpoint Details

### **Auth Routes**
- `POST /api/auth/register` - Create a new user (employee or employer).
- `POST /api/auth/login` - Authenticate a user and receive a JWT.
- `GET /api/auth/me` - Get profile of the currently authenticated user.

### **Leave Routes**
- `POST /api/leaves` - [Employee] Apply for a new leave request.
- `GET /api/leaves/my` - [Employee] Get personal leave history.
- `GET /api/leaves` - [Employer] Get all employee leave requests.
- `PATCH /api/leaves/:id/review` - [Employer] Approve or Reject a leave application.
- `GET /api/leaves/stats` - [Both] Get mathematical aggregations of leave approvals/rejections.

---

## 🌍 Deployment Instructions

The application uses a separated architecture, requiring two deployment environments.

### 1. Database (MongoDB Atlas)
- Create a Free Tier cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Go to "Network Access" and whitelist `0.0.0.0/0` (for deployment access).
- Go to "Database Access" and create a database user.
- Copy your connection string into your Backend Environment Variables.

### 2. Backend Deployment (Render / Railway)
1. Push your code to GitHub.
2. Link your repository to a free platform like **Render** or **Railway**.
3. Set the root directory to `backend`.
4. Add your `.env` variables to the host's Environment Variables section.
5. Build Command: `npm install`
6. Start Command: `npm start` (or `node server.js`)

### 3. Frontend Deployment (Vercel / Netlify)
1. Link your repository to **Vercel** or **Netlify**.
2. Set the root directory to `frontend`.
3. Set the environment variable: `VITE_API_URL` to point to the live backend URL you got from Render (e.g., `https://your-backend-api.onrender.com/api`).
4. Build Command: `npm run build`
5. Vercel/Netlify will deploy the static Vue compiled directory seamlessly.

---

## 📋 Example Accounts

**Employer/Admin:**
- Email: `employer@test.com`
- Password: `password123`

**Employee (Standard):**
- Email: `employee@test.com`
- Password: `password123`
