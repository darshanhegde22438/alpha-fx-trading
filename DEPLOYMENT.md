# AlphaFxTrader Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd alpha-fx-trader
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/alphafxtrader
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development
```

#### Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Frontend Development Server
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🐳 Docker Deployment

### Docker Compose Setup

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:4.4
    container_name: alphafxtrader-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: alphafxtrader
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: alphafxtrader-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongodb:27017/alphafxtrader
      JWT_SECRET: your_super_secret_jwt_key_here
      JWT_EXPIRE: 24h
      NODE_ENV: production
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: alphafxtrader-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker
```bash
docker-compose up -d
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup
```bash
# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Install MongoDB
sudo yum install -y mongodb-server
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd alpha-fx-trader

# Backend setup
cd backend
npm install
pm2 start server.js --name "alphafxtrader-backend"

# Frontend setup
cd ../frontend
npm install
npm run build
pm2 serve build 3000 --name "alphafxtrader-frontend"
```

#### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Heroku Deployment

#### 1. Backend Deployment
```bash
cd backend

# Create Procfile
echo "web: node server.js" > Procfile

# Deploy to Heroku
heroku create alphafxtrader-backend
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET=your_super_secret_jwt_key_here
heroku config:set NODE_ENV=production
git push heroku main
```

#### 2. Frontend Deployment
```bash
cd frontend

# Create static.json for SPA routing
echo '{
  "root": "build/",
  "routes": {
    "/**": "index.html"
  }
}' > static.json

# Deploy to Heroku
heroku create alphafxtrader-frontend
heroku config:set REACT_APP_API_URL=https://alphafxtrader-backend.herokuapp.com
git push heroku main
```

## 🔧 Production Configuration

### Environment Variables

#### Backend Production (.env)
```env
MONGO_URI=mongodb://your-production-mongodb-uri
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=production
```

#### Frontend Production (.env)
```env
REACT_APP_API_URL=https://your-backend-api-url.com
```

### Security Considerations

1. **JWT Secret**: Use a strong, random secret key
2. **MongoDB**: Enable authentication and use SSL
3. **HTTPS**: Use SSL certificates for production
4. **CORS**: Configure CORS for your domain only
5. **Rate Limiting**: Implement API rate limiting

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes are created
2. **Caching**: Implement Redis for frequently accessed data
3. **CDN**: Use CDN for static assets
4. **Load Balancing**: Use multiple backend instances
5. **Monitoring**: Set up application monitoring

## 📊 Monitoring and Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart alphafxtrader-backend
```

### Health Checks
```bash
# Check backend health
curl http://localhost:5000/health

# Check database connection
curl http://localhost:5000/api/forex/stats
```

## 🔄 Backup and Recovery

### MongoDB Backup
```bash
# Create backup
mongodump --db alphafxtrader --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db alphafxtrader /backup/20231201/alphafxtrader
```

### Application Backup
```bash
# Backup application files
tar -czf alphafxtrader-backup-$(date +%Y%m%d).tar.gz /path/to/application

# Backup environment files
cp .env .env.backup
```

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### 2. Port Already in Use
```bash
# Find process using port
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

#### 3. Frontend Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. API Connection Issues
- Check CORS configuration
- Verify API URL in frontend
- Check network connectivity
- Review browser console for errors

### Log Analysis
```bash
# Backend logs
pm2 logs alphafxtrader-backend

# Frontend logs
pm2 logs alphafxtrader-frontend

# System logs
sudo journalctl -u alphafxtrader-backend
```

## 📈 Scaling

### Horizontal Scaling
1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple Backend Instances**: Run multiple Node.js processes
3. **Database Clustering**: Use MongoDB replica sets
4. **CDN**: Use CloudFlare or AWS CloudFront

### Vertical Scaling
1. **Increase Server Resources**: More CPU, RAM, storage
2. **Database Optimization**: Better indexing, query optimization
3. **Caching Layer**: Redis for session and data caching
4. **Connection Pooling**: Optimize database connections

---

For additional support, please refer to the main README.md file or contact the development team.
