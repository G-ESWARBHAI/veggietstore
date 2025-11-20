# Render Deployment Guide - Backend

## Prerequisites
1. **Render Account**: Sign up at https://render.com (free tier available)
2. **MongoDB Atlas**: Free MongoDB database at https://www.mongodb.com/cloud/atlas
3. **Cloudinary Account**: For image uploads at https://cloudinary.com (free tier available)
4. **GitHub Repository**: Your code should be on GitHub (already done ✅)

## Step-by-Step Deployment

### Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (choose FREE tier)
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
5. Whitelist IP addresses:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Render)
6. Get connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/veggiestore?retryWrites=true&w=majority`

### Step 2: Set Up Cloudinary (for image uploads)

1. Go to https://cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect GitHub**:
   - Click "Connect GitHub"
   - Authorize Render
   - Select repository: `G-ESWARBHAI/veggietstore`
4. **Configure Service**:
   - **Name**: `veggie-store-backend` (or any name you prefer)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT!**
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add:

   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/veggiestore?retryWrites=true&w=majority
   JWT_SECRET = your-super-secret-jwt-key-here-make-it-long-and-random
   FRONTEND_URL = https://veggietstore-oxc3.vercel.app
   CLOUDINARY_CLOUD_NAME = your-cloudinary-cloud-name
   CLOUDINARY_API_KEY = your-cloudinary-api-key
   CLOUDINARY_API_SECRET = your-cloudinary-api-secret
   EMAIL_USER = your-email@gmail.com (for sending emails)
   EMAIL_PASS = your-app-specific-password (Gmail App Password)
   ```

   **Important Notes**:
   - Replace all placeholder values with your actual credentials
   - For Gmail, you need to create an "App Password" (not your regular password)
   - JWT_SECRET should be a long random string (use a password generator)

6. **Click "Create Web Service"**
7. **Wait for deployment** (takes 5-10 minutes)

### Step 4: Get Your Backend URL

After deployment, Render will give you a URL like:
- `https://veggie-store-backend.onrender.com`

**Save this URL!** You'll need it for the frontend.

### Step 5: Update Frontend Environment Variable

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL`:
   - Value: `https://your-backend-url.onrender.com/api`
   - Example: `https://veggie-store-backend.onrender.com/api`
5. **Redeploy** your frontend on Vercel

### Step 6: Test Your Deployment

1. **Backend Health Check**:
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"success":true,"message":"Server is running"}`

2. **API Test**:
   - Visit: `https://your-backend.onrender.com/api`
   - Should return: `{"success":true,"message":"Veggie Store Backend API is running"}`

3. **Frontend Test**:
   - Visit your Vercel URL
   - Try to load products
   - Try to register/login

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Render sets this automatically) | `10000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://veggietstore-oxc3.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret-key` |
| `EMAIL_USER` | Email for sending notifications | `your-email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your-app-password` |

## Troubleshooting

### Build Fails
- Check that `backend/package.json` has `"start": "node server.js"`
- Verify Root Directory is set to `backend`
- Check build logs in Render dashboard

### Database Connection Fails
- Verify MongoDB Atlas IP whitelist includes Render IPs
- Check MONGODB_URI format (replace `<password>`)
- Ensure database user has correct permissions

### CORS Errors
- Verify `FRONTEND_URL` matches your Vercel URL exactly
- Check that frontend uses correct API URL

### Image Upload Fails
- Verify Cloudinary credentials are correct
- Check file size limits (10MB max for free tier)

### Server Crashes
- Check Render logs for error messages
- Verify all environment variables are set
- Check MongoDB connection

## Free Tier Limitations

**Render Free Tier**:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

**MongoDB Atlas Free Tier**:
- 512MB storage
- Shared cluster

**Cloudinary Free Tier**:
- 25GB storage
- 25GB bandwidth/month
- 10MB max file size

## Upgrading (Optional)

For production use, consider:
- Render paid plan ($7/month) - no spin-down
- MongoDB Atlas paid plan - more storage
- Cloudinary paid plan - more bandwidth

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check MongoDB Atlas logs
3. Verify all environment variables
4. Test API endpoints directly

