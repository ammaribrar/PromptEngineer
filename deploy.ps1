# PowerShell Deployment Script for Firebase Hosting

Write-Host "🚀 Starting deployment to Firebase Hosting with Cloud Run..." -ForegroundColor Cyan

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Please run: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>&1 | Select-Object -First 1
    Write-Host "✅ Google Cloud SDK found" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK not found." -ForegroundColor Red
    Write-Host "Please install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Build the Next.js app
Write-Host "`n📦 Building Next.js application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy to Cloud Run
Write-Host "`n☁️  Deploying to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy prompt-tester `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3000 `
  --memory 2Gi `
  --cpu 2 `
  --timeout 300 `
  --max-instances 10

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cloud Run deployment failed. Please check errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cloud Run deployment successful!" -ForegroundColor Green

# Deploy Firebase Hosting
Write-Host "`n🔥 Deploying Firebase Hosting configuration..." -ForegroundColor Cyan
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase Hosting deployment failed. Please check errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app is available at:" -ForegroundColor Cyan
Write-Host "   - https://prompt-engineer-13d50.web.app" -ForegroundColor Yellow
Write-Host "   - https://prompt-engineer-13d50.firebaseapp.com" -ForegroundColor Yellow

