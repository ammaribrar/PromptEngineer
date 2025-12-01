# Quick Deployment Guide - Firebase Hosting

Follow these steps to deploy your Next.js app to Firebase Hosting.

## Prerequisites

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Install Google Cloud SDK** (for Cloud Run):
   - Download from: https://cloud.google.com/sdk/docs/install
   - Or use: `gcloud init` after installation

3. **Login to Firebase**:
   ```bash
   firebase login
   ```

4. **Login to Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project prompt-engineer-13d50
   ```

## Step-by-Step Deployment

### Step 1: Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### Step 2: Build Your App

```bash
npm install
npm run build
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy prompt-tester \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10
```

**Note**: This will take a few minutes the first time as it builds the Docker image.

### Step 4: Set Environment Variables

Set your environment variables in Cloud Run:

```bash
gcloud run services update prompt-tester \
  --region us-central1 \
  --set-env-vars="OPENAI_API_KEY=your-openai-key-here,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAi9mhV1HFDs62d1uTyJzblYE-D5UH6S6g,NEXT_PUBLIC_FIREBASE_PROJECT_ID=prompt-engineer-13d50"
```

Or set them individually:
```bash
gcloud run services update prompt-tester \
  --region us-central1 \
  --update-env-vars OPENAI_API_KEY=your-key-here
```

### Step 5: Deploy Firebase Hosting

```bash
firebase deploy --only hosting
```

## Your App is Live! 🎉

Your app will be available at:
- **https://prompt-engineer-13d50.web.app**
- **https://prompt-engineer-13d50.firebaseapp.com**

## Quick Deploy Script

Run this single command (after initial setup):

**Windows:**
```cmd
deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check that Node.js version is 18 or higher

### Cloud Run Deployment Fails
- Ensure you're logged in: `gcloud auth login`
- Check project ID: `gcloud config get-value project`
- Verify APIs are enabled (Step 1)

### Environment Variables Not Working
- Check variables are set: `gcloud run services describe prompt-tester --region us-central1`
- Restart the service after setting variables

### Firebase Hosting Shows Error
- Make sure Cloud Run service is deployed first
- Check service name matches in `firebase.json` (should be `prompt-tester`)

## Updating Your Deployment

After making changes:

1. **Build**: `npm run build`
2. **Deploy to Cloud Run**: `gcloud run deploy prompt-tester --source . --region us-central1`
3. **Deploy Hosting** (if config changed): `firebase deploy --only hosting`

## Cost Considerations

- **Cloud Run**: Pay per use, very affordable for small to medium traffic
- **Firebase Hosting**: Free tier includes 10GB storage and 360MB/day transfer
- **Firestore**: Free tier includes 1GB storage and 50K reads/day

## Security Notes

- Never commit `.env` files or API keys to git
- Use environment variables in Cloud Run for sensitive data
- Enable Firebase Authentication in Firebase Console
- Set up Firestore security rules

