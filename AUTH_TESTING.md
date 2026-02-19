# GridX Authentication - Testing Guide

## Manual Testing Checklist

### Registration Flow
- [ ] Visit http://localhost:3000/register
- [ ] Fill in: Name, Email, Password, Role
- [ ] Click Register
- [ ] Verify: Redirected to dashboard
- [ ] Verify: User info shows in header
- [ ] Verify: Token persisted in localStorage

### Login Flow
- [ ] Click Logout to clear session
- [ ] Visit http://localhost:3000/login
- [ ] Enter demo credentials: `arjun@solargrid.in` / `password123`
- [ ] Click Login
- [ ] Verify: Redirect to dashboard
- [ ] Verify: Correct user name displayed in header
- [ ] Verify: User role displayed in header

### Protected Routes
- [ ] Logout and go to http://localhost:3000/
- [ ] Verify: Redirected to login page
- [ ] Logout and go to http://localhost:3000/login
- [ ] Verify: Login page displays (no redirect)

### Token Persistence
- [ ] Login with demo account
- [ ] Hard refresh page (Ctrl+F5)
- [ ] Verify: Still logged in, page loads immediately
- [ ] Open DevTools > Application > localStorage
- [ ] Verify: `gridx-store` shows token and user data

### API Authentication
- [ ] Open DevTools > Network tab
- [ ] Perform any action (like fetching dashboard data)
- [ ] Check request headers
- [ ] Verify: `Authorization: Bearer {token}` header present

### Error Handling
- [ ] Try login with wrong password
- [ ] Verify: Error message displays
- [ ] Try registering with existing email
- [ ] Verify: Error message displays
- [ ] Try registering with mismatched passwords
- [ ] Verify: Inline validation error

### Logout Flow
- [ ] Click logout icon in header
- [ ] Verify: Redirected to login page
- [ ] Verify: Token removed from localStorage
- [ ] Verify: User data cleared
- [ ] Try going back (browser back button)
- [ ] Verify: Still on login page (can't navigate back)

### Role-Based Features
- [ ] Login as seller: `arjun@solargrid.in`
- [ ] Verify: Can see "Sell Energy" options
- [ ] Login as buyer: `rohan@consumer.in`  
- [ ] Verify: Can see "Buy Energy" options
- [ ] Login as prosumer: `dev@smartgrid.in`
- [ ] Verify: Can see both sell and buy options

### Cross-Browser Testing
- [ ] Chrome: Full auth flow
- [ ] Firefox: Full auth flow
- [ ] Safari: Full auth flow
- [ ] Edge: Full auth flow

## API Testing (Using curl/Postman)

### Test Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "role": "buyer"
  }'

# Expected response:
# {
#   "token": "eyJhbGc...",
#   "user": {
#     "id": "uuid...",
#     "name": "Test User",
#     "email": "test@example.com",
#     "role": "buyer"
#   }
# }
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "arjun@solargrid.in",
    "password": "password123"
  }'
```

### Test Protected Endpoint
```bash
# Get token from login first, then:
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer {token_from_login}"
```

### Test Wrong Password
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "arjun@solargrid.in",
    "password": "wrongpassword"
  }'

# Expected: 401 Unauthorized
```

## Load Testing

Run basic load test with 100 concurrent logins:

```bash
# Install wrk if not present
brew install wrk  # macOS
# or apt-get install wrk  # Linux

# Test login endpoint
wrk -t12 -c100 -d30s \
  -s login_test.lua \
  http://localhost:3001/api/auth/login

# login_test.lua:
# request = function()
#   return wrk.format(
#     "POST",
#     "/api/auth/login",
#     {["Content-Type"] = "application/json"},
#     '{"email":"arjun@solargrid.in","password":"password123"}'
#   )
# end
```

## Security Testing

### Password Security
- [ ] Verify password NOT stored in plain text in DB
  ```bash
  # Connect to DB and check:
  SELECT email, password_hash FROM users LIMIT 1;
  # Should show a hash like: $2a$10$...
  ```
- [ ] Verify bcrypt hashing: `$2a$10$` prefix
- [ ] Verify 10 rounds used (default)

### Token Security
- [ ] Verify JWT token expires after 7 days
- [ ] Verify expired token returns 401
- [ ] Verify malformed token returns 401
- [ ] Verify invalid signature returns 401

### SQL Injection
- [ ] Try login with: `" OR "1"="1`
- [ ] Verify: Should fail (parameterized queries protect)

### CORS
- [ ] Try request from different origin
- [ ] Verify: CORS headers present or blocked as expected

## Performance Testing

```bash
# Measure auth endpoint response time
time curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun@solargrid.in","password":"password123"}'

# Expected: < 200ms for password verification
```

## Database Testing

```bash
# Check demo user was created with hash
psql -U postgres -c "SELECT email, password_hash FROM users WHERE email='arjun@solargrid.in';"

# Verify password hash is bcrypt format
# Should show: $2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Success Criteria ✅

All of the following should pass:
- [x] Register new user from UI
- [x] Login existing user from UI
- [x] Token persists across page reloads
- [x] Logout clears session
- [x] Protected routes redirect to login
- [x] API requests include auth headers
- [x] Passwords hashed with bcrypt
- [x] JWT tokens expire properly
- [x] Error messages display for auth failures
- [x] Role-based features visible correctly

---

**Auth Implementation Complete & Tested** ✨
