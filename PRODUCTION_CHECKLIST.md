# 🚀 Production Deployment Checklist

## Pre-Deployment Requirements

### Code Quality
- [ ] All files are properly formatted
- [ ] No hardcoded credentials or secrets
- [ ] Environment variables are properly configured
- [ ] Error handling is comprehensive
- [ ] Logging is in place for debugging
- [ ] No console.log statements in production code

### Security
- [ ] CORS is restricted to specific origins (not '*')
- [ ] Environment variables are in `.env` (not committed to git)
- [ ] `.gitignore` excludes sensitive files
- [ ] API validation for all inputs
- [ ] File upload size limits enforced (5MB)
- [ ] File type validation (CSV only)
- [ ] No sensitive data in logs

### Performance
- [ ] Frontend builds without warnings
- [ ] CSS is minified and optimized
- [ ] JavaScript is minified
- [ ] No unused dependencies
- [ ] Database/file operations are async
- [ ] Error handling doesn't block execution

### Infrastructure
- [ ] Docker images are built successfully
- [ ] Docker Compose is configured for production
- [ ] Health checks are in place
- [ ] Volumes are mounted for persistence
- [ ] Network isolation is configured

---

## Docker Deployment

### Step 1: Build Images
```bash
cd /Users/kartikkhurana/Desktop/xeno
docker-compose build
```

### Step 2: Verify Build Success
```bash
docker images | grep xeno
# Should show: xeno-backend and xeno-frontend
```

### Step 3: Start Services
```bash
docker-compose up -d
```

### Step 4: Verify Services
```bash
# Check if containers are running
docker ps | grep xeno

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Test endpoints
curl http://localhost:5001/
curl http://localhost:3000/
```

### Step 5: Test File Upload
1. Open browser: http://localhost:3000
2. Upload sample CSV file
3. Verify processing completes
4. Download results

---

## Production Environment Variables

Update `/Users/kartikkhurana/Desktop/xeno/.env`:

```bash
NODE_ENV=production
PORT=5001
CORS_ORIGIN=https://your-frontend-domain.com
VITE_API_URL=https://your-api-domain.com
BACKEND_PORT=5001
FRONTEND_PORT=3000
```

---

## Cloud Deployment Options

### Option A: VPS (Recommended for Full Control)
- [ ] Rent VPS from DigitalOcean, Linode, or similar
- [ ] Install Docker and Docker Compose
- [ ] Clone repository
- [ ] Configure `.env` for your domain
- [ ] Set up Nginx reverse proxy
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Configure firewall

### Option B: Vercel + Railway
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Set up custom domains

### Option C: AWS
- [ ] Create EC2 instance
- [ ] Create S3 bucket for static assets
- [ ] Set up CloudFront CDN
- [ ] Configure RDS if needed
- [ ] Set up Route 53 for DNS

---

## Post-Deployment Validation

- [ ] Frontend loads without errors
- [ ] Backend API responds
- [ ] WebSocket connection established
- [ ] File upload works
- [ ] CSV processing completes
- [ ] Downloads work correctly
- [ ] Error handling triggers properly
- [ ] Logs are being recorded
- [ ] No console errors
- [ ] Performance is acceptable

---

## Monitoring & Maintenance

### Health Checks
```bash
# Backend
curl http://localhost:5001/

# Frontend
curl http://localhost:3000/
```

### Log Monitoring
```bash
docker-compose logs -f --tail=100
```

### Restart Services
```bash
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Clean Up
```bash
# Stop containers
docker-compose down

# Remove unused images
docker system prune -a

# Clear volumes (WARNING: Deletes data)
docker-compose down -v
```

---

## Troubleshooting

### Issue: Ports Already in Use
```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>

# Or restart Docker
docker-compose down && docker-compose up -d
```

### Issue: CORS Errors
- [ ] Check `CORS_ORIGIN` in `.env`
- [ ] Verify frontend URL matches exactly
- [ ] Check browser console for error details

### Issue: Upload Fails
- [ ] Check file size (max 5MB)
- [ ] Verify file is CSV format
- [ ] Check backend logs: `docker-compose logs backend`
- [ ] Verify uploads directory permissions

### Issue: WebSocket Not Connecting
- [ ] Check `VITE_API_URL` environment variable
- [ ] Verify backend is running
- [ ] Check network connectivity
- [ ] Clear browser cache and refresh

---

## Backup & Recovery

### Backup Data
```bash
# Backup CSV files
tar -czf backup-uploads.tar.gz backend/uploads/
tar -czf backup-outputs.tar.gz backend/outputs/

# Copy configuration
cp backend/config/rules.json backup-rules.json
```

### Restore Data
```bash
tar -xzf backup-uploads.tar.gz
tar -xzf backup-outputs.tar.gz
```

---

## Security Hardening

### Update Firewall Rules
```bash
# Allow only necessary ports
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH (if needed)
sudo ufw default deny incoming
```

### Set Up SSL/TLS
```bash
# Using Let's Encrypt with Nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### Configure Nginx Reverse Proxy
```nginx
upstream backend {
    server localhost:5001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location / {
        proxy_pass http://frontend;
    }
}
```

---

## Version Control

Before deployment, ensure:
- [ ] `.env` is in `.gitignore`
- [ ] `node_modules` is in `.gitignore`
- [ ] No sensitive files are committed
- [ ] All code is pushed to main branch
- [ ] Version tags are created: `git tag -a v1.0.0 -m "Production Release"`

---

## Final Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] Docker images build without warnings
- [ ] Environment variables are set
- [ ] Security headers are configured
- [ ] CORS is restricted
- [ ] File uploads work
- [ ] CSV processing works
- [ ] Downloads work
- [ ] Logging is functional
- [ ] Health checks pass
- [ ] Performance is acceptable

**Ready for production! 🎉**
