# Ticket Place - Deployment Guide

This guide explains how to deploy the Ticket Place application using Docker and Docker Compose.

## 🏗️ Architecture

The application consists of:
- **Backend**: Spring Boot API (Java 17, Maven)
- **Frontend**: Next.js application (React)
- **Database**: MySQL 8.0
- **Reverse Proxy**: Nginx (production only)

## 📋 Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 3000, 8080, 3306, 80, 443 available

## 🚀 Quick Start

### 1. Environment Configuration

Copy the environment file and update it:

```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
DB_URL=jdbc:mysql://localhost:3306/ticket_place_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key_min_32_chars
```

### 2. Development Deployment

Run the deployment script:

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:
```bash
docker-compose up --build -d
```

### 3. Production Deployment

**Windows (PowerShell):**
```powershell
.\deploy.ps1 --env prod
```

**Linux/Mac:**
```bash
./deploy.sh --env prod
```

Or manually:
```bash
docker-compose --profile production up --build -d
```

## 🌐 Access URLs

After deployment:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Production (with Nginx)**: http://localhost

## 📊 Service Health

Check service status:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f
```

View specific service logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## 🔧 Management Commands

### Stop all services:
```bash
docker-compose down
```

### Stop and remove volumes:
```bash
docker-compose down -v
```

### Rebuild from scratch:
```bash
docker-compose down --remove-orphans
docker system prune -f
docker-compose up --build -d
```

### Update application:
```bash
git pull
docker-compose up --build -d
```

## 🗂️ File Structure

```
ticket-place/
├── docker-compose.yml          # Main Docker Compose configuration
├── Dockerfile                  # Backend Docker configuration
├── frontend/
│   └── Dockerfile             # Frontend Docker configuration
├── docker/
│   ├── mysql/
│   │   └── init.sql           # Database initialization script
│   └── nginx/
│       └── nginx.conf         # Nginx configuration
├── deploy.ps1                 # Windows deployment script
├── deploy.sh                  # Linux/Mac deployment script
└── .dockerignore              # Docker ignore files
```

## 🔒 Security Considerations

1. **Change default passwords** in the `.env` file
2. **Use HTTPS** in production by updating Nginx configuration
3. **Restrict database access** to only the application
4. **Regular updates**: Keep Docker images updated
5. **Backup database**: Regular MySQL backups recommended

## 🐛 Troubleshooting

### Port conflicts
If ports are already in use, modify them in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change frontend port
  - "8081:8080"  # Change backend port
```

### Database connection issues
1. Check MySQL container is healthy: `docker-compose logs mysql`
2. Verify database credentials in `.env`
3. Ensure database is created: `docker-compose exec mysql mysql -u root -p`

### Frontend build issues
1. Clear node_modules: `docker-compose exec frontend rm -rf node_modules`
2. Rebuild: `docker-compose up --build frontend`

### Backend startup issues
1. Check logs: `docker-compose logs backend`
2. Verify Java version compatibility
3. Check database connectivity

## 📈 Monitoring

### Resource usage:
```bash
docker stats
```

### Disk usage:
```bash
docker system df
```

### Clean up unused resources:
```bash
docker system prune -a
```

## 🔄 CI/CD Integration

For automated deployments, you can use the deployment scripts in your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Deploy to production
  run: |
    chmod +x deploy.sh
    ./deploy.sh --env prod
```

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all prerequisites are met
3. Ensure ports are available
4. Check Docker and Docker Compose versions
