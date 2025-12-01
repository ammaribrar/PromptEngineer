# First-Time Setup for Firebase Deployment

Before deploying, you need to set up a few things:

## 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

## 2. Install Google Cloud SDK

**Windows:**
- Download from: https://cloud.google.com/sdk/docs/install
- Run the installer
- Or use: `(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe"); & $env:Temp\GoogleCloudSDKInstaller.exe`

**Mac:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

## 3. Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

## 4. Login to Google Cloud

```bash
gcloud auth login
gcloud config set project prompt-engineer-13d50
```

## 5. Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## 6. Set Environment Variables

You'll need to set your OpenAI API key in Cloud Run:

```bash
gcloud run services update prompt-tester `
  --region us-central1 `
  --update-env-vars OPENAI_API_KEY=your-actual-openai-key-here
```

Replace `your-actual-openai-key-here` with your real OpenAI API key.

## 7. Deploy!

Now you're ready to deploy. Run:

**Windows PowerShell:**
```powershell
.\deploy.ps1
```

**Windows CMD:**
```cmd
deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Quick Check Commands

Verify everything is set up:

```bash
# Check Firebase login
firebase projects:list

# Check Google Cloud login
gcloud auth list

# Check project
gcloud config get-value project

# Check APIs
gcloud services list --enabled
```

## Need Help?

- Firebase Docs: https://firebase.google.com/docs/hosting
- Cloud Run Docs: https://cloud.google.com/run/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

