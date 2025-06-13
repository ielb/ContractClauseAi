# ContractClauseAI API - Quick Start Guide

Get up and running with the ContractClauseAI API in 5 minutes.

## ⚡ Quick Setup

### 1. Start the API Server

```bash
# Navigate to the contract-api directory
cd contract-api

# Install dependencies (if not already done)
npm install

# Start the development server
npm run start:dev
```

The API will be available at `http://localhost:3000`

### 2. Import Postman Collections

1. **Download Postman**: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

2. **Import Collections**:

   - Open Postman
   - Click "Import" → "Upload Files"
   - Select these files from the `docs/postman/` folder:
     - `ContractClauseAI-Auth.postman_collection.json` (recommended for beginners)
     - `ContractClauseAI-Environment.postman_environment.json` (optional environment)

3. **Set Environment** (optional):
   - Click the environment dropdown (top right)
   - Select "ContractClauseAI - Local Development"

## 🚀 Test Authentication (2 minutes)

### Step 1: Register a New User

1. Open the **"ContractClauseAI API - Authentication"** collection
2. Click **"Register User"**
3. Click **"Send"**

**Expected Result**: ✅ Status 201, user created, token automatically saved

### Step 2: Get User Profile

1. Click **"Get User Profile"**
2. Click **"Send"**

**Expected Result**: ✅ Status 200, your user profile information

### Step 3: Test Error Handling

1. Click **"Login with Invalid Credentials (Error Test)"**
2. Click **"Send"**

**Expected Result**: ✅ Status 401, proper error message

## 🧪 Test System Integration (3 minutes)

### Health Checks

Use the complete collection for these tests:

1. **Basic Health**: `GET /` → Should return "Hello World!"
2. **Detailed Health**: `GET /health` → Shows system status

### Storage & Cache Tests

1. **S3 Upload Test**: `POST /test/s3/upload` → Tests file storage
2. **Redis Cache Test**: `POST /test/redis/set` → Tests caching
3. **Connectivity Test**: `GET /test/connectivity` → Tests all services

## 🔧 Configuration Variables

The collections include these pre-set variables:

| Variable       | Value                   | Purpose            |
| -------------- | ----------------------- | ------------------ |
| `baseUrl`      | `http://localhost:3000` | API server URL     |
| `userEmail`    | `john.doe@example.com`  | Test user email    |
| `userPassword` | `SecurePassword123!`    | Test user password |
| `token`        | _(auto-set)_            | JWT token          |

**To change these**: Click the collection → Variables tab → Update values

## 📋 Common API Testing Workflow

### Full Authentication Flow

1. **Register** → Creates account + sets token
2. **Login** → Alternative authentication
3. **Profile** → Verify authentication
4. **Refresh Token** → Get new token
5. **Change Password** → Update credentials

### Error Testing

1. **Invalid Login** → Test error handling
2. **No Token Access** → Test protection
3. **Invalid Data** → Test validation

## 🛠️ Troubleshooting

### API Server Not Running

**Problem**: Connection refused errors

**Solution**:

```bash
cd contract-api
npm run start:dev
```

Verify output shows: `Application is running on: http://[::1]:3000`

### 401 Unauthorized Errors

**Problem**: Protected routes return 401

**Solution**:

1. Run "Register User" or "Login User" first
2. Verify the `token` variable is set (check collection variables)
3. Ensure you're using the collection-level auth

### Token Expired

**Problem**: Suddenly getting 401 errors

**Solution**:

1. Use "Refresh Token" endpoint
2. Or login again to get a new token

### Wrong Base URL

**Problem**: Connection refused or wrong server

**Solution**:

1. Check collection variables → Update `baseUrl`
2. Verify your API server address and port

## 🎯 Next Steps

Once basic authentication is working:

1. **Explore all endpoints** using the complete collection
2. **Test different user roles** (when admin features are added)
3. **Try integration tests** with real file uploads
4. **Set up different environments** (staging, production)

## 📞 Support

If you encounter issues:

1. **Check API server logs** in your terminal
2. **Review Postman console** for detailed error information
3. **Verify environment variables** are correctly set
4. **Test with curl** to isolate Postman-specific issues:

```bash
# Test basic connectivity
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"SecurePassword123!"}'
```

---

**🎉 You're Ready!** Start testing the ContractClauseAI API with confidence.
