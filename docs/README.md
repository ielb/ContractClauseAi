# ContractClauseAI API Documentation

This folder contains comprehensive API documentation for the ContractClauseAI backend service.

## 📁 Contents

### Postman Collections

- **`postman/ContractClauseAI-Complete.postman_collection.json`** - Complete API collection with all endpoints
- **`postman/ContractClauseAI-Auth.postman_collection.json`** - Authentication-focused collection with automatic token management

## 🚀 Getting Started

### Prerequisites

1. **API Server Running**: Ensure the ContractClauseAI API server is running locally on port 3000
2. **Postman Installed**: Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
3. **Environment Setup**: Configure required environment variables (see below)

### Import Collections

1. Open Postman
2. Click "Import" in the top left
3. Select the collection file(s) you want to import
4. The collections will include pre-configured variables and automatic token management

## 🔧 Configuration

### Collection Variables

Both collections include these pre-configured variables:

| Variable       | Default Value           | Description                       |
| -------------- | ----------------------- | --------------------------------- |
| `baseUrl`      | `http://localhost:3000` | API server base URL               |
| `token`        | _(auto-set)_            | JWT token (automatically managed) |
| `userEmail`    | `john.doe@example.com`  | Test user email                   |
| `userPassword` | `SecurePassword123!`    | Test user password                |

### Environment Variables

Update the `baseUrl` variable if your API server runs on a different host/port:

- **Local Development**: `http://localhost:3000`
- **Docker Compose**: `http://localhost:3000`
- **Production**: Update to your production API URL

## 📚 API Endpoints Overview

### Authentication Endpoints (`/auth`)

| Method  | Endpoint                | Description               | Auth Required |
| ------- | ----------------------- | ------------------------- | ------------- |
| `POST`  | `/auth/register`        | Register new user account | ❌            |
| `POST`  | `/auth/login`           | Login with email/password | ❌            |
| `GET`   | `/auth/profile`         | Get current user profile  | ✅            |
| `POST`  | `/auth/refresh`         | Refresh JWT token         | ✅            |
| `PATCH` | `/auth/change-password` | Change user password      | ✅            |

### Health Check Endpoints

| Method | Endpoint  | Description            | Auth Required |
| ------ | --------- | ---------------------- | ------------- |
| `GET`  | `/`       | Basic health check     | ❌            |
| `GET`  | `/health` | Detailed health status | ❌            |

### Testing Endpoints (`/test`)

#### S3 Storage Tests

| Method | Endpoint                        | Description               | Auth Required |
| ------ | ------------------------------- | ------------------------- | ------------- |
| `POST` | `/test/s3/upload`               | Test S3 file upload       | ❌            |
| `GET`  | `/test/s3/download/{fileName}`  | Test S3 file download     | ❌            |
| `GET`  | `/test/s3/presigned/{fileName}` | Generate S3 presigned URL | ❌            |

#### Redis Cache Tests

| Method | Endpoint                       | Description                 | Auth Required |
| ------ | ------------------------------ | --------------------------- | ------------- |
| `POST` | `/test/redis/set`              | Test Redis key-value set    | ❌            |
| `GET`  | `/test/redis/get/{key}`        | Test Redis key-value get    | ❌            |
| `POST` | `/test/redis/set-object`       | Test Redis object storage   | ❌            |
| `GET`  | `/test/redis/get-object/{key}` | Test Redis object retrieval | ❌            |

#### System Tests

| Method | Endpoint             | Description                  | Auth Required |
| ------ | -------------------- | ---------------------------- | ------------- |
| `GET`  | `/test/connectivity` | Test all service connections | ❌            |

## 🔐 Authentication Flow

### 1. Register or Login

Use either the **Register User** or **Login User** endpoints. Both will automatically:

- Return a JWT token in the response
- Save the token to the collection's `token` variable
- Configure subsequent requests to use this token

### 2. Access Protected Routes

All authenticated endpoints will automatically use the stored token via the collection's auth configuration.

### 3. Token Refresh

Use the **Refresh Token** endpoint to get a new token. The new token will automatically replace the old one.

## 🧪 Testing Workflows

### Complete Authentication Flow

1. **Register**: `POST /auth/register` → Creates account and sets token
2. **Profile**: `GET /auth/profile` → Verifies token works
3. **Change Password**: `PATCH /auth/change-password` → Tests password update
4. **Refresh**: `POST /auth/refresh` → Gets new token
5. **Login**: `POST /auth/login` → Alternative authentication method

### Error Testing

The collections include error test cases:

- Invalid credentials login
- Accessing protected routes without token
- Proper HTTP status codes validation

### System Integration Tests

Use the `/test` endpoints to verify:

- **S3 Storage**: File upload/download functionality
- **Redis Cache**: Key-value and object storage
- **Database**: Connection and basic operations
- **Overall System**: End-to-end connectivity

## 📝 Request/Response Examples

### Authentication

#### Register User

```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "user": {
    "_id": "...",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "user",
    "isVerified": false,
    "isActive": true,
    "subscriptionPlan": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User

```json
POST /auth/login
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** _(Same as register)_

### Testing

#### S3 Upload Test

```json
POST /test/s3/upload
{
  "fileName": "test-document.txt",
  "content": "This is test content for S3 upload."
}
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "s3Url": "https://bucket.s3.region.amazonaws.com/test/test-document.txt",
  "fileName": "test-document.txt"
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **401 Unauthorized**

   - Ensure you've logged in and the token is set
   - Check if the token has expired (default: 24 hours)
   - Try refreshing the token

2. **Connection Refused**

   - Verify the API server is running
   - Check the `baseUrl` variable matches your server
   - Ensure no firewall is blocking the connection

3. **500 Internal Server Error**
   - Check server logs for detailed error information
   - Verify environment variables are properly configured
   - Ensure database and external services are accessible

### Debug Steps

1. **Check Collection Variables**: Verify `baseUrl` and `token` are set correctly
2. **Test Health Endpoint**: Start with `GET /health` to verify basic connectivity
3. **Review Console Logs**: Postman console shows token management and test results
4. **Server Logs**: Check the API server console for detailed error information

## 🔄 Continuous Integration

These collections can be used with Newman (Postman CLI) for automated testing:

```bash
# Install Newman
npm install -g newman

# Run authentication tests
newman run "ContractClauseAI-Auth.postman_collection.json"

# Run complete test suite
newman run "ContractClauseAI-Complete.postman_collection.json"
```

## 📋 Next Steps

As new endpoints are added to the API:

1. Update the appropriate Postman collection
2. Add new endpoints to this README
3. Include request/response examples
4. Update any testing workflows
5. Verify authentication requirements

---

**Need Help?** Check the API server logs or contact the development team for assistance.
