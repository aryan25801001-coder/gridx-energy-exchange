# Deployment Guide - GridX

Complete guide to deploy GridX to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Smart Contract Deployment](#smart-contract-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Docker Production](#docker-production)
7. [Environment Configuration](#environment-configuration)
8. [Post-Deployment Checks](#post-deployment-checks)

---

## Prerequisites

### Required Tools
- Node.js 18+
- Python 3.8+
- Docker & Docker Compose
- Git
- PostgreSQL 14+

### Accounts
- GitHub (for version control)
- Alchemy or Infura (for RPC endpoints)
- AWS/GCP/Azure/DigitalOcean (for hosting)

### Testnet Setup
- MetaMask wallet with >5 MATIC on Mumbai
- Mumbai testnet network added to MetaMask

---

## Smart Contract Deployment

### Step 1: Compile Contract
```bash
cd gridx-contract
npm install
npx hardhat compile
```

### Step 2: Create Deployment Script
Create `scripts/deploy.js`:
```javascript
const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.deployContract("GridXEnergyTrading");
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`✅ Deployed to: ${address}`);
  
  // Save address
  require('fs').writeFileSync('.deployments.json', JSON.stringify({
    mumbai: address
  }, null, 2));
}

main().catch(console.error);
```

### Step 3: Deploy to Mumbai
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

### Step 4: Verify Contract (Optional)
```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

### Step 5: Get Contract Address
Update in `.env` files:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
CONTRACT_ADDRESS=0x...
```

---

## Backend Deployment

### Option A: Heroku

#### Step 1: Create Heroku App
```bash
cd gridx-backend
heroku create gridx-backend
heroku addons:create heroku-postgresql:standard-0
```

#### Step 2: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set AI_SERVICE_URL=https://gridx-ai.herokuapp.com
heroku config:set POLYGON_RPC_URL=https://polygon-rpc.com
```

#### Step 3: Deploy
```bash
git push heroku main
```

#### Step 4: Run Migrations
```bash
heroku run npm run migrate
heroku run npm run seed
```

### Option B: DigitalOcean App Platform

#### Step 1: Create App
```bash
doctl apps create --spec gridx-backend.yaml
```

#### Step 2: Deploy
```bash
git push origin main  # Triggers auto-deploy
```

### Option C: AWS EC2

#### Step 1: Launch EC2 Instance
```bash
# Ubuntu 22.04 LTS, t3.medium
```

#### Step 2: Install Node.js
```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 3: Setup PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Step 4: Deploy Backend
```bash
git clone <repo>
cd gridx-backend
npm install
npm run build
npm run migrate
npm run seed
npm start
```

#### Step 5: Setup Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.gridx.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

---

## Frontend Deployment

### Option A: Vercel (Recommended)

#### Step 1: Connect Repository
```bash
vercel link
```

#### Step 2: Set Environment Variables
```bash
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_POLYGON_RPC_URL
```

#### Step 3: Deploy
```bash
vercel deploy --prod
```

### Option B: Netlify

#### Step 1: Build
```bash
npm run build
```

#### Step 2: Configure
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 3: Deploy
```bash
netlify deploy --prod --dir=.next
```

### Option C: GitHub Pages

#### Step 1: Export Frontend
```bash
npm run export
```

#### Step 2: Push to gh-pages Branch
```bash
git push origin gh-pages
```

---

## Database Setup

### PostgreSQL RDS (AWS)

#### Step 1: Create RDS Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier gridx-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --allocated-storage 20
```

#### Step 2: Get Endpoint
```bash
aws rds describe-db-instances --db-instance-identifier gridx-db
```

#### Step 3: Update Backend
```env
DB_HOST=gridx-db.xxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=gridx
DB_USER=postgres
DB_PASSWORD=<strong-password>
```

#### Step 4: Run Migrations
```bash
npm run migrate
npm run seed
```

---

## Docker Production

### Step 1: Create Production Compose File
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    image: gridx-backend:latest
    environment:
      NODE_ENV: production
      DB_HOST: postgres
    depends_on:
      - postgres

  ai:
    image: gridx-ai:latest
    environment:
      - PYTHONUNBUFFERED=1

  frontend:
    image: gridx-frontend:latest
    environment:
      NEXT_PUBLIC_API_URL: https://api.gridx.com

secrets:
  db_password:
    external: true
```

### Step 2: Build Images
```bash
docker build -t gridx-backend:latest ./gridx-backend
docker build -t gridx-ai:latest ./gridx-ai
docker build -t gridx-frontend:latest ./gridx-frontend
```

### Step 3: Push to Registry
```bash
docker login
docker tag gridx-backend:latest username/gridx-backend:latest
docker push username/gridx-backend:latest
```

### Step 4: Deploy to Server
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Environment Configuration

### Production .env (Backend)
```env
NODE_ENV=production
DB_HOST=gridx-db.rds.amazonaws.com
DB_PORT=5432
DB_NAME=gridx_prod
DB_USER=postgres
DB_PASSWORD=<secure-password>
PORT=3001
JWT_SECRET=<random-secret-32-chars>
POLYGON_RPC_URL=https://polygon-rpc.com/
CONTRACT_ADDRESS=0x<deployed-address>
AI_SERVICE_URL=https://ai.gridx.com
```

### Production .env (Frontend)
```env
NEXT_PUBLIC_API_URL=https://api.gridx.com
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com/
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<deployed-address>
NEXT_PUBLIC_CHAIN_ID=137
```

---

## Post-Deployment Checks

### Health Checks
```bash
# Backend
curl https://api.gridx.com/health

# Database
psql -h <db-host> -U postgres -d gridx -c "SELECT 1"

# Frontend
curl https://gridx.com/
```

### User Acceptance Testing
- [ ] Create user account
- [ ] Buy energy from marketplace
- [ ] MetaMask transaction
- [ ] Carbon tokens earned
- [ ] Leaderboard updated
- [ ] Disaster mode accessible

### Performance Testing
```bash
# Load test backend
ab -n 1000 -c 10 https://api.gridx.com/health

# Check AI response time
time curl https://ai.gridx.com/api/forecast
```

### Security Audit
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Environment variables not exposed
- [ ] Database backups active
- [ ] Logs monitored

### Monitoring Setup
```bash
# CloudWatch (AWS)
aws logs tail /gridx/backend --follow

# DataDog
DD_AGENT_MAJOR_VERSION=7 bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_agent.sh)"

# Sentry
pip install sentry-sdk
```

---

## Scaling Recommendations

### Database
- Use Read Replicas for analytics queries
- Enable automated backups
- Monitor connection pool usage

### Backend
- Use load balancer (ALB/NLB)
- Configure auto-scaling groups
- Enable CloudFront caching

### Frontend
- CDN cache with 24h TTL
- Compress assets with Gzip
- Enable HTTP/2 push

### AI Service
- Horizontal scaling with multiple instances
- Queue system for forecasts
- Cache results for 5 minutes

---

## Maintenance

### Daily Tasks
- Monitor error logs
- Check database size
- Verify blockchain sync

### Weekly Tasks
- Database backup verification
- Performance metrics review
- User feedback analysis

### Monthly Tasks
- Security updates
- Dependency updates
- Cost optimization analysis

---

## Rollback Procedure

```bash
# Previous deployment
heroku releases:rollback
# or
git revert <commit-hash>
git push heroku main

# Docker
docker-compose pull
docker-compose up -d
```

---

## Support & Troubleshooting

### Backend won't start
```bash
# Check logs
heroku logs --tail

# Verify environment
heroku config

# Test database
heroku run npm run migrate:status
```

### Frontend not loading
- Check CORS headers
- Verify API URL is correct
- Clear browser cache

### Smart contract issues
- Verify gas limits
- Check RPC endpoint
- Use Polygon faucet for MATIC

---

## Estimated Costs (Monthly)

| Service | Testnet | Production |
|---------|---------|------------|
| Heroku (Backend) | Free | $50 |
| Vercel (Frontend) | Free | Free |
| RDS Database | Free Tier | $20 |
| AI Service | Free | $30 |
| Total | $0 | ~$100 |

---

## Success Indicators

✅ All 3 services responding  
✅ Database connection successful  
✅ Smart contract verified on block explorer  
✅ Trades logging to blockchain  
✅ Carbon wallet accumulating correctly  
✅ UI loads in <2s  
✅ No error logs in 24h  

---

More questions? Check [README.md](../README.md) or raise an issue!
