#!/bin/bash

echo "🚀 Starting deployment to Firebase Hosting with Cloud Run..."

# Build the Next.js app
echo "📦 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
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

if [ $? -ne 0 ]; then
    echo "❌ Cloud Run deployment failed. Please check errors and try again."
    exit 1
fi

# Deploy Firebase Hosting
echo "🔥 Deploying Firebase Hosting configuration..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Firebase Hosting deployment failed. Please check errors and try again."
    exit 1
fi

echo "✅ Deployment complete!"
echo "🌐 Your app is available at:"
echo "   - https://prompt-engineer-13d50.web.app"
echo "   - https://prompt-engineer-13d50.firebaseapp.com"

