# 🚀 Deployment Guide

This guide will help you deploy your Calendar app to Vercel (frontend) and Render (backend).

## 📋 Prerequisites

1. **GitHub Account**: Your code should be pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Render Account**: Sign up at [render.com](https://render.com)
4. **Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🔧 Backend Deployment (Render)

### Step 1: Connect to Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository

### Step 2: Configure the Service
- **Name**: `calendar-backend` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `cd calendar-backend && npm install`
- **Start Command**: `cd calendar-backend && node index.js`

### Step 3: Set Environment Variables
In the Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your Gemini API key |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render will set this automatically) |

### Step 4: Deploy
Click "Create Web Service" and wait for deployment.

### Step 5: Get Your Backend URL
After deployment, you'll get a URL like: `https://your-app-name.onrender.com`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository

### Step 2: Configure the Project
- **Framework Preset**: `Vite`
- **Root Directory**: `calendar-app`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Set Environment Variables
Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your Render backend URL (e.g., `https://your-app-name.onrender.com`) |

### Step 4: Deploy
Click "Deploy" and wait for deployment.

### Step 5: Update CORS in Backend
After getting your Vercel domain, update the CORS configuration in `calendar-backend/index.js`:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-domain.vercel.app'] // Replace with your actual domain
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

Then redeploy your backend on Render.

## 🔍 Testing Your Deployment

1. **Test Backend**: Visit your Render URL to see "Calendar AI Backend is running!"
2. **Test Frontend**: Visit your Vercel URL to see the calendar app
3. **Test AI Features**: Try uploading a PDF or pasting text to extract events

## 🛠 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend CORS origin includes your Vercel domain
2. **API Key Issues**: Verify your Gemini API key is correct in Render environment variables
3. **Build Failures**: Check that all dependencies are in `package.json`
4. **Environment Variables**: Ensure all environment variables are set correctly

### Debugging:
- Check Render logs for backend issues
- Check Vercel build logs for frontend issues
- Use browser developer tools to check network requests

## 📝 Important Notes

- **Environment Files**: `.env` files are ignored by git for security
- **API Limits**: The app includes daily usage limits (3 requests per day)
- **Free Tier Limits**: Both Vercel and Render have free tier limitations
- **Database**: The app uses SQLite which is file-based and may reset on Render

## 🔄 Updating Your Deployment

1. Push changes to GitHub
2. Vercel will automatically redeploy the frontend
3. Render will automatically redeploy the backend
4. Check that everything works correctly
