# Deployment Fix Guide

## Issues Identified
1. ✅ Frontend (Vercel): Configuration fixed
2. ⚠️ Backend (Railway): Missing database environment variables

## Frontend (Vercel) - FIXED ✅

The vercel.json has been updated. To deploy:

```bash
# Push changes to GitHub
git add .
git commit -m "Fix Vercel deployment configuration"
git push
```

Vercel will automatically redeploy.

## Backend (Railway) - ACTION REQUIRED ⚠️

### The "DB error:" issue means Railway doesn't have database credentials.

### Steps to Fix Railway Backend:

1. **Go to Railway Dashboard**: https://railway.app/
2. **Select your backend project**: `starthobbybackend-production`
3. **Click on "Variables" tab**
4. **Add these environment variables**:

```
DB_HOST=your_mysql_host
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=starthobby_db
DB_PORT=3306
PORT=5000
```

### Option 1: Use Railway's MySQL Add-on

1. In Railway, click "+ New" → "Database" → "MySQL"
2. Railway will auto-provision a MySQL database
3. Copy the connection details from the MySQL service
4. Add them to your backend service variables

### Option 2: Use External MySQL (e.g., PlanetScale, AWS RDS)

1. Get your database credentials from your provider
2. Add them to Railway variables as shown above

### After Adding Variables:

1. Railway will automatically restart your backend
2. Test the connection: https://starthobbybackend-production.up.railway.app/test-db
3. You should see user data instead of "DB error:"

## CORS Configuration

Your backend already has the correct CORS settings for Vercel:
```javascript
"https://start-hobby.vercel.app"
```

If your Vercel URL is different, update this in `server/index.js` line 24.

## Verification Steps

1. **Test Backend Health**: 
   - Visit: https://starthobbybackend-production.up.railway.app/
   - Should see: "StartHobby API is running 🚀"

2. **Test Database Connection**:
   - Visit: https://starthobbybackend-production.up.railway.app/test-db
   - Should see user data (not "DB error:")

3. **Test Frontend**:
   - Visit your Vercel URL
   - Open browser console (F12)
   - Should see successful API requests
   - Should NOT see "Unexpected token 'export'" error

## Common Issues

### If still seeing "Unexpected token 'export'":
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard reload (Ctrl+F5)
3. Check Vercel deployment logs

### If still seeing "DB error:":
1. Check Railway logs: Click on your backend service → "Deployments" → "View Logs"
2. Verify all environment variables are set correctly
3. Ensure database is accessible from Railway's network

### If CORS errors:
1. Verify your Vercel URL in `server/index.js` allowedOrigins
2. Redeploy backend after changes

## Support

If issues persist:
1. Check Railway logs for specific database errors
2. Check Vercel deployment logs
3. Verify database credentials are correct
