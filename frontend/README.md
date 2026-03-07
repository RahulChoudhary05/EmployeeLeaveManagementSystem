# Employee Leave Management - Frontend

Vue 3 + Vite + Tailwind CSS frontend for employee/employer leave workflow.

## Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:5000`

## Setup

1. Install dependencies:
	```bash
	npm install
	```
2. Create env file:
	```bash
	cp .env.example .env
	```
3. Update `.env` if your API URL is different:
	```env
	VITE_API_URL=http://localhost:5000/api
	```

## Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Features

- Authentication (Employee / Employer)
- Employee leave application and status tracking
- Employer review dashboard (approve/reject)
- API integration via Axios with JWT token interceptor
