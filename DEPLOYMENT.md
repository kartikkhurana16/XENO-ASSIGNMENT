# Deployment Guides

This project is ready for deployment on multiple platforms. Choose your preferred deployment method below.

---

## 🐳 Option 1: Docker (Self-Hosted / Any Cloud)

### Local Testing with Docker
```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5001
# Logs: docker-compose logs -f
```

### Production Deployment (VPS/Server)
```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone <your-repo> && cd xeno

# Create .env file
cat > .env << EOF
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
BACKEND_PORT=5001
FRONTEND_PORT=3000
EOF

# Build and run
docker-compose up -d

# Setup Nginx reverse proxy (optional, recommended for production)
sudo nano /etc/nginx/sites-available/default
```

---

## ⚡ Option 2: Vercel + Railway (Recommended)

### Deploy Frontend to Vercel
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Select `verifier` as root directory
6. Environment Variables:
   ```
   VITE_API_URL=https://your-railway-backend.com
   ```
7. Deploy!

### Deploy Backend to Railway
1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select your repository
4. Select `backend` as the service root
5. Environment Variables:
   ```
   NODE_ENV=production
   PORT=5001
   CORS_ORIGIN=https://your-vercel-frontend.vercel.app
   ```
6. Deploy!

---

## 🚀 Option 3: AWS (EC2 + S3 + ALB)

### Backend on EC2
```bash
# Launch EC2 instance (Ubuntu 22.04)
# Install Docker:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone and deploy
git clone <your-repo> && cd xeno/backend
docker build -t xeno-backend .
docker run -d -p 5001:5001 --env-file .env xeno-backend
```

### Frontend on S3 + CloudFront
```bash
# Build frontend
cd verifier
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/

# Create CloudFront distribution pointing to S3
# Add environment variable in build: VITE_API_URL=https://your-ec2-dns
```

---

## 🔒 Production Security Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Configure CORS_ORIGIN to your actual domain
- [ ] Use HTTPS/SSL certificates (Let's Encrypt recommended)
- [ ] Set up firewall rules (allow 80, 443, block others)
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Use strong environment variables in secrets manager
- [ ] Enable CORS authentication tokens if needed
- [ ] Set up rate limiting
- [ ] Configure log rotation

---

## 📊 Health Checks

Both services include health checks:
- Backend: `/` returns "Server Running"
- Frontend: Served by Nginx with health endpoint
- Docker Compose monitors both automatically

---

## 🆘 Troubleshooting

### Ports Already in Use
```bash
docker-compose down
docker system prune -a
docker-compose up
```

### CORS Issues
Update `CORS_ORIGIN` in `.env` to match your frontend URL

### Upload/Output Directory Errors
```bash
chmod -R 777 backend/uploads backend/outputs
```

### Check Logs
```bash
docker-compose logs backend
docker-compose logs frontend
```

---

## 📞 Support

For issues, check:
1. Docker logs: `docker-compose logs`
2. Environment variables: `echo $VITE_API_URL`
3. Network connectivity: `curl http://localhost:5001`
