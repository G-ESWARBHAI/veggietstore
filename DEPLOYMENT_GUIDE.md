# Deployment Guide - Vercel

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Your backend API deployed and accessible

## Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

## Step 2: Deploy from Project Directory
```bash
cd project
vercel
```

Follow the prompts:
- Login to Vercel
- Link to existing project or create new
- Set root directory: `project`
- Confirm settings

## Step 3: Set Environment Variables
After deployment, go to Vercel Dashboard:
1. Select your project
2. Go to Settings → Environment Variables
3. Add: `VITE_API_URL` = `https://your-backend-url.com/api`
4. Redeploy

## Important Notes

### Backend URL
You need to deploy your backend first. Options:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **DigitalOcean App Platform**: https://www.digitalocean.com/products/app-platform

### CORS Configuration
Make sure your backend allows requests from your Vercel domain:
```javascript
// In backend server.js
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app'
  ],
  credentials: true
};
```

### Environment Variables Needed
- `VITE_API_URL`: Your backend API URL (e.g., `https://api.yourapp.com/api`)

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `npm run build` works locally
- Check Vercel build logs

### API Calls Fail
- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is deployed and accessible

### Routing Issues
- The `vercel.json` file handles SPA routing
- All routes redirect to `index.html`

