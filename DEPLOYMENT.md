# Firebase Hosting Deployment Guide

This guide will help you deploy your Next.js application to Firebase Hosting using Cloud Run.

## Prerequisites

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Install Google Cloud SDK** (for Cloud Run):
   ```bash
   # Follow instructions at: https://cloud.google.com/sdk/docs/install
   ```

3. **Login to Firebase**:
   ```bash
   firebase login
   ```

4. **Login to Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project prompt-engineer-13d50
   ```

5. **Enable required APIs**:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

## Deployment Steps

### Step 1: Build the Next.js App

```bash
npm run build
```

### Step 2: Deploy to Cloud Run

Deploy your Next.js app to Cloud Run:

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

**Note**: Replace `prompt-tester` with your preferred service name if needed.

### Step 3: Set Environment Variables

Set your environment variables in Cloud Run:

```bash
gcloud run services update prompt-tester \
  --region us-central1 \
  --set-env-vars="OPENAI_API_KEY=your-openai-key,NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key,NEXT_PUBLIC_FIREBASE_PROJECT_ID=prompt-engineer-13d50"
```

Or set them individually:
```bash
gcloud run services update prompt-tester \
  --region us-central1 \
  --update-env-vars OPENAI_API_KEY=your-key-here
```

### Step 4: Deploy Firebase Hosting Configuration

Deploy the Firebase Hosting configuration that proxies to Cloud Run:

```bash
firebase deploy --only hosting
```

Your app will now be available at:
- `https://prompt-engineer-13d50.web.app`
- `https://prompt-engineer-13d50.firebaseapp.com`

## Quick Deploy Script

Create a `deploy.sh` script for easier deployment:

```bash
#!/bin/bash
echo "Building Next.js app..."
npm run build

echo "Deploying to Cloud Run..."
gcloud run deploy prompt-tester \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

echo "Deploying Firebase Hosting..."
firebase deploy --only hosting

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Environment Variables

Make sure to set your environment variables in Firebase:

1. **For Firebase Hosting** (if using Cloud Functions):
   ```bash
   firebase functions:config:set openai.api_key="your-key"
   ```

2. **For Cloud Run**:
   - Set environment variables in the Cloud Run console
   - Or use: `gcloud run services update prompt-tester --set-env-vars KEY=VALUE`

3. **Required Environment Variables**:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID

## Quick Deploy

For a quick deployment:

```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Troubleshooting

1. **Build errors**: Make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. **Firebase not found**: Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

3. **Permission errors**: Make sure you're logged in:
   ```bash
   firebase login
   ```

4. **API routes not working**: Consider using Cloud Run instead of static hosting for better API route support.

## Post-Deployment

After deployment, your app will be available at:
- `https://prompt-engineer-13d50.web.app`
- `https://prompt-engineer-13d50.firebaseapp.com`

