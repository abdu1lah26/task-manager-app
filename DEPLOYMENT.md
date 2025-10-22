# 🚀 Deployment Checklist

Use this checklist before deploying your Task Manager App to production.

## ✅ Pre-Deployment Steps

### 1. Environment Configuration

- [ ] Create production `.env` file for server
- [ ] Create production `.env` file for client
- [ ] Set strong JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] Update CLIENT_URL to production frontend URL
- [ ] Update API and Socket URLs in client .env

### 2. Database Setup

- [ ] Set up production PostgreSQL database
- [ ] Run database schema (see README.md)
- [ ] Update DATABASE_URL in server .env
- [ ] Test database connection

### 3. Security

- [ ] Verify JWT_SECRET is strong and unique
- [ ] Confirm passwords are hashed (bcrypt)
- [ ] Check CORS settings for production domain
- [ ] Review and remove any hardcoded credentials
- [ ] Verify .env files are in .gitignore

### 4. Code Quality

- [ ] Remove console.logs (already optimized for NODE_ENV)
- [ ] Run `npm run build` for client
- [ ] Test build locally
- [ ] Fix any build warnings/errors
- [ ] Review and test error handling

### 5. Testing

- [ ] Test user registration
- [ ] Test user login/logout
- [ ] Test project creation
- [ ] Test task CRUD operations
- [ ] Test real-time updates (Socket.IO)
- [ ] Test drag-and-drop functionality
- [ ] Test comments system
- [ ] Test error messages display correctly

### 6. Performance

- [ ] Optimize images (if any added)
- [ ] Check bundle size
- [ ] Enable gzip compression on server
- [ ] Consider CDN for static assets

## 📦 Backend Deployment

### Recommended Platforms:

- **Heroku** (easiest)
- **Railway** (modern)
- **Render** (free tier available)
- **AWS/Azure** (scalable)

### Steps:

1. Push code to GitHub (if not done)
2. Connect repository to hosting platform
3. Set environment variables in platform dashboard
4. Deploy!

### Environment Variables (Server):

```
PORT=5000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-url.com
NODE_ENV=production
```

## 🌐 Frontend Deployment

### Recommended Platforms:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**

### Steps:

1. Build production bundle: `npm run build`
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy!

### Environment Variables (Client):

```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

## 🔒 Post-Deployment Security

- [ ] Enable HTTPS on both frontend and backend
- [ ] Set secure cookies (if using)
- [ ] Configure rate limiting
- [ ] Monitor error logs
- [ ] Set up backup for database

## 📊 Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor server uptime
- [ ] Check database performance
- [ ] Monitor API response times

## 🐛 Troubleshooting

### Common Issues:

**Socket.IO not connecting:**

- Check CORS settings
- Verify REACT_APP_SOCKET_URL is correct
- Ensure both HTTP and WebSocket are supported

**Database connection fails:**

- Verify DATABASE_URL format
- Check database is accessible from deployment server
- Verify SSL settings if required

**API requests failing:**

- Check CORS configuration
- Verify REACT_APP_API_URL is correct
- Check network tab for actual error

**Authentication not working:**

- Verify JWT_SECRET matches between deployments
- Check token expiration settings
- Verify CORS allows credentials

## 📝 Final Checks

- [ ] All features working in production
- [ ] Mobile responsive design tested
- [ ] Cross-browser compatibility checked
- [ ] 404 page working
- [ ] Loading states displayed correctly

## 🎉 Success!

Once all items are checked, your Task Manager App is ready for production!

---

**Need Help?**

- Check server logs for backend issues
- Check browser console for frontend issues
- Review ARCHITECTURE.md for system overview
- Test locally first with production build
