# ContractClauseAI - Deployment Guide

This document provides comprehensive instructions for deploying the ContractClauseAI application in different environments.

## 🏗️ Infrastructure Overview

### Architecture

- **Backend**: NestJS API with TypeScript
- **Database**: MongoDB with Redis caching
- **Storage**: AWS S3 for file storage
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local, Kubernetes for production
- **CI/CD**: GitHub Actions with automated testing and deployment

### Environments

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

## 🔧 Prerequisites

### Required Tools

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git
- curl (for health checks)

### Required Accounts & Credentials

- GitHub account (for CI/CD)
- AWS account (for S3 storage)
- OpenAI account (for AI features)
- MongoDB Atlas account (for production database)

## 🚀 Quick Start

### 1. Environment Setup

Copy the configuration template:

```bash
cd contract-api
cp config.template .env
```

Update the `.env` file with your actual credentials:

- MongoDB connection string
- Redis configuration
- AWS credentials
- OpenAI API key
- JWT secrets

### 2. Local Development

Start all services with Docker Compose:

```bash
./scripts/deploy.sh development
```

Or run individual commands:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Testing the Deployment

Verify services are running:

```bash
# API Health Check
curl http://localhost:3001/health

# API Documentation
open http://localhost:3001/api/docs

# Database Admin (development only)
open http://localhost:8081  # MongoDB
open http://localhost:8082  # Redis
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically triggers on:

- **Push** to `main` or `develop` branches
- **Pull requests** to `main` or `develop` branches

### Pipeline Stages

1. **Lint & Test**

   - Code quality checks (ESLint, Prettier)
   - Unit and integration tests
   - Coverage reporting

2. **Build & Security Scan**

   - Application build
   - Dependency security audit
   - Artifact upload

3. **Docker Build**

   - Multi-stage Docker image build
   - Push to GitHub Container Registry
   - Image caching for faster builds

4. **Deploy**
   - **Staging**: Auto-deploy from `develop` branch
   - **Production**: Auto-deploy from `main` branch

### Environment Variables in GitHub

Configure these secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET

# OpenAI
OPENAI_API_KEY

# Database (Production)
MONGODB_URI_STAGING
MONGODB_URI_PRODUCTION
REDIS_URL_STAGING
REDIS_URL_PRODUCTION

# Authentication
JWT_SECRET_STAGING
JWT_SECRET_PRODUCTION

# Email (Optional)
EMAIL_USER
EMAIL_PASSWORD

# Stripe (Optional)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

## 🌍 Environment-Specific Deployment

### Development

```bash
./scripts/deploy.sh development
```

- Uses local MongoDB and Redis containers
- Includes admin interfaces
- Hot reload enabled
- Detailed logging

### Staging

```bash
./scripts/deploy.sh staging
```

- Uses staging database and cache
- Production-like configuration
- Automated deployment from `develop` branch

### Production

```bash
./scripts/deploy.sh production v1.2.3
```

- Uses production database and cache
- Optimized for performance and security
- Automated deployment from `main` branch
- Requires specific image tag

## 🐳 Docker Configuration

### Dockerfile Features

- **Multi-stage build** for optimal image size
- **Non-root user** for security
- **Health checks** built-in
- **Layer caching** for faster builds

### Docker Compose Services

- **API**: NestJS backend application
- **MongoDB**: Document database with initialization
- **Redis**: Caching layer
- **Mongo Express**: Database admin interface (dev only)
- **Redis Commander**: Cache admin interface (dev only)

## 🔐 Security Considerations

### Environment Variables

- Never commit `.env` files
- Use different secrets for each environment
- Rotate secrets regularly
- Use strong, randomly generated values

### Container Security

- Non-root user execution
- Minimal base images (Alpine Linux)
- Regular security scans
- Read-only filesystem where possible

### Network Security

- Internal container networking
- Exposed ports only where necessary
- CORS configuration for API access

## 📊 Monitoring & Health Checks

### Health Endpoints

- `GET /health` - Application health status
- `GET /` - Basic connectivity test

### Monitoring Features

- Application performance metrics
- Database connection status
- Redis cache status
- Error rate tracking

### Logging

- Structured JSON logging
- Request/response logging
- Error tracking and alerting
- Audit trail for sensitive operations

## 🔧 Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check logs
docker-compose logs api
docker-compose logs mongodb
docker-compose logs redis

# Restart services
docker-compose restart
```

#### Database Connection Issues

```bash
# Check MongoDB status
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"

# Verify connection string
docker-compose exec api env | grep MONGODB_URI
```

#### Memory Issues

```bash
# Check resource usage
docker stats

# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory
```

### Recovery Procedures

#### Database Recovery

```bash
# Backup before recovery
docker-compose exec mongodb mongodump --out /backup

# Restore from backup
docker-compose exec mongodb mongorestore /backup
```

#### Cache Reset

```bash
# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

## 📞 Support

### Development Team

- **Backend**: Node.js/NestJS API
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session and data caching
- **DevOps**: Docker, GitHub Actions, AWS

### Useful Commands

```bash
# View all running containers
docker ps

# Access container shell
docker-compose exec api sh
docker-compose exec mongodb mongo

# View resource usage
docker system df
docker system prune  # Clean up unused resources
```

### Documentation Links

- [API Documentation](http://localhost:3001/api/docs) (when running locally)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

For additional support or questions about deployment, please refer to the project documentation or contact the development team.
