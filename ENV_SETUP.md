# 🔧 Environment Variables Setup Guide

Complete guide to configuring environment variables for GridX project.

---

## 📁 .env File Locations

```
haryana/
├── gridx-frontend/.env.local          # Frontend configuration
├── gridx-backend/.env                 # Backend configuration
└── .env.example                       # Reference template
```

---

## 🚀 Quick Setup

### 1. Frontend Configuration (`gridx-frontend/.env.local`)

```bash
cd gridx-frontend
cp .env.example .env.local
```

**Key Variables:**
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend API endpoint |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x...` | Deployed smart contract address |
| `NEXT_PUBLIC_CHAIN_ID` | `80001` | Polygon Mumbai chain ID |

### 2. Backend Configuration (`gridx-backend/.env`)

```bash
cd gridx-backend
cp .env.example .env
```

**Key Variables:**
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_NAME` | `gridx` | Database name |
| `JWT_SECRET` | `your-key` | Session token secret |
| `CONTRACT_ADDRESS` | `0x...` | Smart contract address |

---

## 📋 Complete Variables Reference

### Frontend (`NEXT_PUBLIC_*`)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000

# Blockchain
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_CHAIN_NAME=Polygon Mumbai

# App
NEXT_PUBLIC_APP_NAME=GridX Energy Exchange
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_TRADING=true
NEXT_PUBLIC_ENABLE_DISASTER_MODE=true
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
```

### Backend

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gridx
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_SIZE=10
DB_IDLE_TIMEOUT=30000

# Auth
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3003

# Blockchain
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=30000

# External Services
STRIPE_SECRET_KEY=sk_test_your_key_here
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

---

## 🔐 Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong JWT_SECRET** - Generate with: 
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Rotate PRIVATE_KEY** - Use a dedicated wallet for contract interactions
4. **Change defaults in production**:
   - `NODE_ENV=production`
   - `JWT_SECRET` → random 32+ char string
   - `DB_PASSWORD` → strong password
   - `CORS_ORIGIN` → your domain

5. **External Service Keys**:
   - Get Stripe key from: https://dashboard.stripe.com/apikeys
   - Get SendGrid key from: https://app.sendgrid.com/settings/api_keys
   - Never share or commit these keys

---

## 🔑 Getting API Keys

### Polygon RPC URL
```
Free: https://rpc-mumbai.maticvigil.com
Or use Alchemy/Infura for better reliability
```

### Smart Contract Address
Deploy contract first:
```bash
cd gridx-contract
npx hardhat run scripts/deploy.js --network mumbai
# Copy ADDRESS from output → NEXT_PUBLIC_CONTRACT_ADDRESS
```

### JWT Secret (Backend)
```bash
# Generate secure random key
openssl rand -hex 32
# or with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Private Key (For Owner Transfers)
⚠️ **DANGER: Only for development!**
- Never use mainnet private key
- Use throwaway testnet wallet
- Format: `0x<64-hex-chars>`

---

## 🗄️ Database Setup

### Local PostgreSQL

**Windows (using PostgreSQL installer):**
```powershell
# Default credentials
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres  # Change this!
```

**MacOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Docker:**
```bash
docker-compose up -d db
```

### Create Database
```bash
createdb gridx
# or
psql -U postgres -c "CREATE DATABASE gridx;"
```

---

## 🚀 Development Workflow

### 1. Clone Repository
```bash
git clone https://github.com/aryan25801001-coder/gridx-energy-exchange.git
cd gridx
```

### 2. Setup Frontend
```bash
cd gridx-frontend
cp .env.example .env.local
npm install
npm run dev
# Opens http://localhost:3003
```

### 3. Setup Backend
```bash
cd ../gridx-backend
cp .env.example .env
npm install
npm run dev
# Runs on http://localhost:3001
```

### 4. Verify Configuration
```bash
# Check frontend is using correct API
curl http://localhost:3001/health

# Check backend is running
curl -X GET http://localhost:3001/api/auth/me
```

---

## ⚡ Environment-Specific Configs

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
JWT_SECRET=dev-secret-key-not-secure
CORS_ORIGIN=http://localhost:*
```

### Staging
```env
NODE_ENV=staging
NEXT_PUBLIC_ENVIRONMENT=staging
JWT_SECRET=<generate-secure-key>
CORS_ORIGIN=https://staging.example.com
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
JWT_SECRET=<generate-secure-key>
CORS_ORIGIN=https://gridx.example.com
CONTRACT_ADDRESS=<mainnet-address>
```

---

## 🐛 Troubleshooting

### "Cannot find module or its corresponding type declarations"
**Solution:** Check `.env` file is in correct directory and variables are loaded

### "ECONNREFUSED localhost:5432"
**Solution:** PostgreSQL not running - start with:
```bash
# Windows
net start PostgreSQL-x64-15

# MacOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Docker
docker-compose up -d db
```

### "Network error: Cannot connect to API"
**Solution:** Check `NEXT_PUBLIC_API_URL` matches backend `PORT`

### "Contract address invalid"
**Solution:** Deploy contract and update `CONTRACT_ADDRESS`:
```bash
cd gridx-contract
npx hardhat run scripts/deploy.js --network mumbai
```

---

## ✅ Verification Checklist

- [ ] Frontend `.env.local` created with `NEXT_PUBLIC_API_URL`
- [ ] Backend `.env` created with database credentials
- [ ] Both files NOT committed to git (in `.gitignore`)
- [ ] PostgreSQL running on correct host:port
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] Contract address set after deployment
- [ ] CORS_ORIGIN includes all client URLs
- [ ] External service keys (if used) are set

---

## 📚 Related Documentation

- [AUTH_SETUP.md](./AUTH_SETUP.md) - Authentication configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [README.md](./README.md) - Project overview

---

**Happy coding! 🚀**
