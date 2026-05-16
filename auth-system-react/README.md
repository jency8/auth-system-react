# AuthSystem — React Frontend + Express Backend



## Project Structure

```
auth-system/
├── frontend/          ← React (converted)
│   ├── src/
│   │   ├── components/
│   │   │   └── PasswordInput.tsx    ← Reusable password toggle input
│   │   ├── context/
│   │   │   └── AuthContext.tsx      ← Global auth state (useState/useEffect)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx        ← Login page component
│   │   │   ├── RegisterPage.tsx     ← Register page component
│   │   │   └── DashboardPage.tsx    ← Dashboard page component
│   │   ├── utils/
│   │   │   ├── apiClient.ts         ← Fetch wrapper + auto token refresh
│   │   │   └── tokenManager.ts     ← localStorage token management
│   │   ├── App.tsx                  ← Page router (login/register/dashboard)
│   │   ├── main.tsx                 ← React entry point
│   │   └── index.css               ← All Tailwind + custom styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts              ← Dev proxy: /api → localhost:5000
└── backend/           ← Express (unchanged)
    ├── config/
    │   ├── db.js                   ← MongoDB connection
    │   └── jwt.js                  ← Token generation/verification
    ├── controllers/
    │   └── authController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── validateMiddleware.js
    ├── models/
    │   └── User.js
    ├── routes/
    │   └── authRoutes.js
    ├── server.js
    ├── package.json
    └── .env.example

```

## Quick Start

### 1. Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env — fill in your MONGODB_URI and JWT secrets
npm install
npm run dev
# Backend runs on http://localhost:5000
```

### 2. Set up the React frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
# Vite proxies /api requests to http://localhost:5000 automatically
```

Open http://localhost:3000 in your browser.


