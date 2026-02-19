# GridX Platform - Enhanced Quick Start Guide

## 🚀 Complete Setup with Authentication

> **Last Updated**: JWT Authentication Implementation Complete

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- Git

### Installation & Running

#### 1. Backend Setup
```bash
cd gridx-backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gridx_db
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
JWT_SECRET=your-secret-key-change-this-in-production
EOF

# Run database migrations and seed demo data
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:3001
```

#### 2. Frontend Setup
```bash
cd gridx-frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
# App runs on http://localhost:3000
```

#### 3. Access the Application

| Feature | URL | Login |
|---------|-----|-------|
| Dashboard | http://localhost:3000 | Demo or Register |
| Login | http://localhost:3000/login | See below |
| Register | http://localhost:3000/register | Create account |
| API Docs | http://localhost:3001/health | N/A |

### Demo Credentials (Pre-seeded)

**Seller Account:**
```
Email: arjun@solargrid.in
Password: password123
Role: Solar Seller
```

**Buyer Account:**
```
Email: rohan@consumer.in
Password: password123
Role: Energy Buyer
```

**Prosumer Account:**
```
Email: dev@smartgrid.in
Password: password123
Role: Both Seller & Buyer
```

### Features Implemented ✅

#### Phase 1: Foundation (Completed)
- [x] Multi-tenant user system
- [x] Role-based access (seller/buyer/prosumer)
- [x] Energy production tracking
- [x] P2P energy trading system
- [x] Carbon credit tracking
- [x] AI-powered price forecasting
- [x] Blockchain trade logging
- [x] Dark neon theme UI
- [x] Docker deployment ready

#### Phase 2: Authentication (✨ NEW - Just Completed)
- [x] User registration with email validation
- [x] Secure login with bcrypt hashing
- [x] JWT token generation (7-day expiry)
- [x] Protected dashboard routes
- [x] Token persistence (localStorage)
- [x] Auto-login on page reload
- [x] Logout functionality
- [x] Demo user seed data with hashed passwords
- [x] API authentication interceptor

### API Endpoints

#### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login with email/password
GET    /api/auth/me            # Get current user (protected)
```

#### User-Authenticated Endpoints (Add Authorization header)
```
Headers: Authorization: Bearer {token}

GET    /api/users              # All users
GET    /api/houses             # All houses
POST   /api/energy-trades      # Create trade
GET    /api/carbon-wallet/me   # Carbon balance
```

### Architecture Overview

```
FRONTEND                    BACKEND                    DATABASE
─────────────────────────────────────────────────────────────────
Next.js 14                  Express.js                 PostgreSQL
├─ Login/Register      ────> JWT Auth Routes    ────> Users (hashed pw)
├─ Dashboard           <──── Protected Routes  <────> Energy Data  
├─ Store (Zustand)     ──┐   WebSockets Setup  <────> Trades
└─ API Client (axios)  ──┼─> AI Service (FastAPI)    Carbon Credits
                       ──┘   Smart Contracts          ...
                             (Polygon Mumbai)
```

### Troubleshooting

**"Cannot connect to database"**
```bash
# Ensure PostgreSQL is running
sudo service postgresql status
# Or use Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
```

**"Token expired during use"**
- Visit login page to refresh token
- Tokens expire after 7 days
- Future: Implement token refresh endpoint

**"CORS errors"**
- Ensure CORS_ORIGIN env var includes frontend URL
- Check `http://localhost:3000` is included

**"Module not found errors"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Services start on:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:3001
# Database:  localhost:5432
```

### Environment Variables

**Backend (.env)**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gridx_db
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=dev-secret-key
PORT=3001
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Performance Tips

- Frontend auto-redirects unauthenticated users to login
- Tokens are cached in localStorage for offline use
- Dashboard lazy-loads components for better performance
- API requests include auth headers automatically

### Support & Documentation

- **Full API Reference**: See API_REFERENCE.md
- **Architecture Details**: See ARCHITECTURE.md  
- **Deployment Guide**: See DEPLOYMENT.md
- **Auth Implementation**: See AUTH_SETUP.md

---

**GridX v2.0 - Enterprise Ready 🚀**

Next Features Coming:
- Real-time WebSocket updates
- Payment processing (Stripe)
- Email notifications
- Advanced analytics
- Mobile responsive design
