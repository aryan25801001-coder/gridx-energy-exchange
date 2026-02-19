
# 🚀 Push GridX to GitHub

Follow these steps to publish your GridX project to GitHub:

---

## 1. Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click `+` icon → **New Repository**
3. Name it: `gridx` (or `gridx-energy`, `defi-energy`, etc.)
4. Add description:
   ```
   Decentralized AI-powered renewable energy trading platform with blockchain verification and smart microgrids
   ```
5. **Choose:**
   - ✅ **Public** (to showcase on portfolio)
   - ✅ **Add a README** → Skip (we have one)
   - ✅ **Add .gitignore** → Skip (we have one)
   - ✅ **Choose a license** → MIT
6. Click **Create Repository**

---

## 2. Initialize Git in Your Local Folder (If Not Already Done)

```bash
cd C:\Users\aarya\Desktop\haryana

# Check if git is already initialized
git status

# If not initialized, run:
git init
git config user.name "Your Name"
git config user.email "your.email@gmail.com"
```

---

## 3. Add Remote Repository

Copy the **HTTPS** URL from your GitHub repo (looks like: `https://github.com/your-username/gridx.git`)

```bash
cd C:\Users\aarya\Desktop\haryana

# Add remote
git remote add origin https://github.com/YOUR-USERNAME/gridx.git

# Verify
git remote -v
```

---

## 4. Add All Files & Create First Commit

```bash
# Stage all files
git add .

# Create first commit
git commit -m "Initial commit: GridX platform with authentication, energy trading, and blockchain integration"

# Verify commit
git log --oneline
```

---

## 5. Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main

# Enter GitHub credentials or use Personal Access Token if prompted
```

### If You Get Authentication Error:
Use a **Personal Access Token** instead of password:

1. Go to GitHub → **Settings** → **Developer Settings** → **Personal Access Tokens**
2. Click **Generate new token**
3. Select scopes: `repo`, `workflow`
4. Copy the token
5. When prompted for password, paste the token instead

---

## 6. Verify on GitHub

1. Refresh your GitHub repository page
2. You should see all your files:
   - `gridx-frontend/`
   - `gridx-backend/`
   - `gridx-contract/`
   - `README.md`
   - `.gitignore`
   - `docker-compose.yml`
   - etc.

---

## 7. (Optional) Add Project Metadata

### Create `CONTRIBUTE.md`

```bash
# Contributing to GridX

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make changes
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request
```

### Create `LICENSE` (MIT)

```
MIT License

Copyright (c) 2026 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

---

## 8. Daily Development Workflow

After making changes:

```bash
# See what changed
git status

# Stage changes
git add .

# Commit with message
git commit -m "feat: add energy transfer feature"

# Push to GitHub
git push origin main
```

---

## 9. Share Your Project

Once pushed, share these links:

- **Repo:** `https://github.com/your-username/gridx`
- **Issues:** `https://github.com/your-username/gridx/issues`
- **Discussions:** `https://github.com/your-username/gridx/discussions`

---

## 10. Add GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: |
          cd gridx-frontend && npm install
          cd ../gridx-backend && npm install
      
      - name: Build
        run: |
          cd gridx-frontend && npm run build
          cd ../gridx-backend && npm run build
```

---

## ✅ Checklist Before Pushing

- [ ] All `node_modules/` excluded in `.gitignore`
- [ ] All `.env` files excluded in `.gitignore`
- [ ] README.md is comprehensive
- [ ] No API keys or secrets in code
- [ ] License file present (MIT)
- [ ] `package.json` scripts working
- [ ] Docker files included
- [ ] Comments explaining complex logic

---

## 📊 After Publishing

### Cool GitHub Features to Use:

1. **Add Topics** (makes repo searchable)
   - `energy-trading`
   - `blockchain`
   - `renewable-energy`
   - `web3`
   - `polygon`
   - `solidity`

2. **Enable Discussions** (Settings → Discussions)

3. **Create Releases** (for major versions)
   ```bash
   git tag -a v1.0.0 -m "Initial release"
   git push origin v1.0.0
   ```

4. **Add to Portfolio**
   - Link on your website: `github.com/your-username/gridx`
   - Add to LinkedIn projects
   - Use in portfolio projects section

---

## 🎯 Commands Quick Reference

```bash
# Check status
git status

# See commits
git log --oneline

# See branches
git branch -a

# Switch branch
git checkout feature/my-feature

# Create new branch
git checkout -b feature/new-feature

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Revert last commit (keep changes)
git reset --soft HEAD~1

# Revert last commit (discard changes)
git reset --hard HEAD~1

# Pull latest from GitHub
git pull origin main

# Force push (use carefully!)
git push -f origin main
```

---

## 🚀 Deploy to Production (Later)

- **Frontend:** Deploy on [Vercel](https://vercel.com) (free, GitHub connected)
- **Backend:** Deploy on [Railway](https://railway.app) or [Heroku](https://heroku.com)
- **Smart Contract:** Already on Polygon Mumbai testnet

---

## 💡 Tips

- Write clear commit messages (helps with project history)
- Use branches for features (`feature/auth`, `feature/transfer`, etc.)
- Create pull requests for code review
- Keep main branch production-ready
- Add CI/CD checks before merging

---

**Happy coding! 🎉**
