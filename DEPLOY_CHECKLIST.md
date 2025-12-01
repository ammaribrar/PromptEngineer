# Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

## Pre-Deployment Setup

- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Google Cloud SDK installed
- [ ] Logged into Firebase (`firebase login`)
- [ ] Logged into Google Cloud (`gcloud auth login`)
- [ ] Project set correctly (`gcloud config set project prompt-engineer-13d50`)
- [ ] Required APIs enabled (see SETUP_FIRST_TIME.md)
- [ ] Environment variables ready (OPENAI_API_KEY)

## Before Deploying

- [ ] All code changes committed
- [ ] Dependencies installed (`npm install`)
- [ ] App builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Tested locally (`npm run dev`)

## Deployment Steps

1. [ ] Run deployment script:
   - Windows: `deploy.bat` or `.\deploy.ps1`
   - Mac/Linux: `./deploy.sh`

2. [ ] Set environment variables in Cloud Run:
   ```bash
   gcloud run services update prompt-tester --region us-central1 --update-env-vars OPENAI_API_KEY=your-key
   ```

3. [ ] Verify deployment:
   - Check Cloud Run service is running
   - Check Firebase Hosting is deployed
   - Visit: https://prompt-engineer-13d50.web.app

## Post-Deployment

- [ ] Test login functionality
- [ ] Test creating a client
- [ ] Test running simulations
- [ ] Verify API routes work
- [ ] Check error logs if issues occur

## Quick Commands Reference

```bash
# Check Firebase login
firebase projects:list

# Check Google Cloud login
gcloud auth list

# Check Cloud Run service
gcloud run services describe prompt-tester --region us-central1

# View logs
gcloud run services logs read prompt-tester --region us-central1

# Update environment variables
gcloud run services update prompt-tester --region us-central1 --update-env-vars KEY=VALUE
```

