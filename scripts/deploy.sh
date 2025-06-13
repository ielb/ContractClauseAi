#!/bin/bash

# ==============================================
# ContractClauseAI Deployment Script
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment variables
ENVIRONMENT=${1:-development}
IMAGE_TAG=${2:-latest}
REGISTRY=${REGISTRY:-ghcr.io}
REPOSITORY=${REPOSITORY:-ielb/contractclauseai}

echo -e "${BLUE}🚀 Starting deployment to ${ENVIRONMENT} environment${NC}"
echo -e "${BLUE}📦 Image: ${REGISTRY}/${REPOSITORY}:${IMAGE_TAG}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            print_status "Environment '$ENVIRONMENT' is valid"
            ;;
        *)
            print_error "Invalid environment '$ENVIRONMENT'. Must be: development, staging, or production"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Stop existing services
stop_services() {
    echo -e "${BLUE}🛑 Stopping existing services...${NC}"
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down || true
        print_status "Services stopped"
    else
        print_warning "No docker-compose.yml found, skipping service stop"
    fi
}

# Pull latest images
pull_images() {
    echo -e "${BLUE}📥 Pulling latest images...${NC}"
    
    if [ "$ENVIRONMENT" != "development" ]; then
        docker pull ${REGISTRY}/${REPOSITORY}:${IMAGE_TAG} || {
            print_error "Failed to pull image ${REGISTRY}/${REPOSITORY}:${IMAGE_TAG}"
            exit 1
        }
        print_status "Images pulled successfully"
    else
        print_status "Development mode - skipping image pull"
    fi
}

# Start services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"
    
    # Set environment variables
    export NODE_ENV=$ENVIRONMENT
    export IMAGE_TAG=$IMAGE_TAG
    
    # Use different compose files for different environments
    COMPOSE_FILE="docker-compose.yml"
    if [ -f "docker-compose.${ENVIRONMENT}.yml" ]; then
        COMPOSE_FILE="docker-compose.yml:docker-compose.${ENVIRONMENT}.yml"
    fi
    
    docker-compose -f $COMPOSE_FILE up -d
    
    print_status "Services started successfully"
}

# Health check
health_check() {
    echo -e "${BLUE}🏥 Performing health check...${NC}"
    
    local max_attempts=30
    local attempt=1
    local health_url="http://localhost:3001/health"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s $health_url > /dev/null 2>&1; then
            print_status "Health check passed (attempt $attempt/$max_attempts)"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Waiting for service to be ready (attempt $attempt/$max_attempts)...${NC}"
        sleep 5
        ((attempt++))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Show service status
show_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker-compose ps
    
    echo -e "\n${BLUE}📝 Logs (last 20 lines):${NC}"
    docker-compose logs --tail=20
    
    echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}📍 API Health Check: http://localhost:3001/health${NC}"
    echo -e "${BLUE}📍 API Documentation: http://localhost:3001/api/docs${NC}"
    
    if [ "$ENVIRONMENT" == "development" ]; then
        echo -e "${BLUE}📍 MongoDB Admin: http://localhost:8081${NC}"
        echo -e "${BLUE}📍 Redis Admin: http://localhost:8082${NC}"
    fi
}

# Cleanup on failure
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed, cleaning up..."
        docker-compose down || true
        exit 1
    fi
}

# Main deployment process
main() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}ContractClauseAI Deployment Script${NC}"
    echo -e "${BLUE}===========================================${NC}"
    
    trap cleanup EXIT
    
    validate_environment
    check_prerequisites
    stop_services
    pull_images
    start_services
    
    if health_check; then
        show_status
    else
        print_error "Deployment completed but health check failed"
        exit 1
    fi
    
    trap - EXIT
}

# Show usage
show_usage() {
    echo "Usage: $0 [environment] [image_tag]"
    echo ""
    echo "Environments:"
    echo "  development  - Local development (default)"
    echo "  staging      - Staging environment"
    echo "  production   - Production environment"
    echo ""
    echo "Examples:"
    echo "  $0                          # Deploy to development"
    echo "  $0 staging                  # Deploy to staging with latest tag"
    echo "  $0 production v1.2.3       # Deploy to production with specific tag"
    echo ""
    echo "Environment Variables:"
    echo "  REGISTRY     - Container registry (default: ghcr.io)"
    echo "  REPOSITORY   - Repository name (default: ielb/contractclauseai)"
}

# Check for help flag
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    show_usage
    exit 0
fi

# Run main function
main 