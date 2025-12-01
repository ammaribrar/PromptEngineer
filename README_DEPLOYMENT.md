# 🚀 Deploy to Firebase Hosting - Quick Start

Your Next.js app is ready to deploy to Firebase Hosting! Follow these steps:

## ⚡ Quick Deploy (After Initial Setup)

**Windows:**
```cmd
deploy.bat
```

**Windows PowerShell:**
```powershell
.\deploy.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 First Time Setup

If this is your first time deploying, follow **SETUP_FIRST_TIME.md** first.

Quick setup commands:
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login
gcloud auth login
gcloud config set project prompt-engineer-13d50

# 3. Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 4. Set your OpenAI API key
gcloud run services update prompt-tester --region us-central1 --update-env-vars OPENAI_API_KEY=your-key-here
```

## 📚 Documentation

- **QUICK_DEPLOY.md** - Step-by-step deployment guide
- **SETUP_FIRST_TIME.md** - First-time setup instructions
- **DEPLOY_CHECKLIST.md** - Pre-deployment checklist
- **DEPLOYMENT.md** - Detailed deployment documentation

## 🌐 Your Live URLs

After deployment, your app will be available at:
- **https://prompt-engineer-13d50.web.app**
- **https://prompt-engineer-13d50.firebaseapp.com**

## 🔧 Architecture

This deployment uses:
- **Cloud Run** - Hosts your Next.js server (handles API routes)
- **Firebase Hosting** - CDN and routing (proxies to Cloud Run)

## 💡 Tips

1. **First deployment takes longer** - Building Docker image takes 5-10 minutes
2. **Subsequent deployments are faster** - Only changed files are rebuilt
3. **Check logs** - Use `gcloud run services logs read prompt-tester --region us-central1`
4. **Update environment variables** - Use Cloud Run console or gcloud CLI

## ❓ Need Help?

- Check **DEPLOY_CHECKLIST.md** for common issues
- Review **QUICK_DEPLOY.md** for detailed steps
- Check Cloud Run logs for errors

## 🎯 Next Steps

1. Complete first-time setup (if needed)
2. Run deployment script
3. Set environment variables
4. Test your live app!

---

**Ready to deploy?** Run your deployment script now! 🚀

