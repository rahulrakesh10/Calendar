#!/bin/bash

echo "🚀 Calendar App Deployment Helper"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if .env files exist
echo "📋 Checking environment files..."

if [ ! -f "calendar-backend/.env" ]; then
    echo "⚠️  calendar-backend/.env not found"
    echo "   Please create it with your GEMINI_API_KEY"
    echo "   cp calendar-backend/.env.example calendar-backend/.env"
fi

if [ ! -f "calendar-app/.env" ]; then
    echo "⚠️  calendar-app/.env not found"
    echo "   Please create it with your VITE_API_URL"
    echo "   cp calendar-app/.env.example calendar-app/.env"
fi

echo ""
echo "✅ Ready for deployment!"
echo ""
echo "📝 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push"
echo ""
echo "2. Deploy backend to Render:"
echo "   - Go to render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set environment variables"
echo ""
echo "3. Deploy frontend to Vercel:"
echo "   - Go to vercel.com"
echo "   - Create new project"
echo "   - Import your GitHub repo"
echo "   - Set VITE_API_URL to your Render URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
