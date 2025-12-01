# Prompt Testing Suite

A beautiful and professional Next.js application for systematically testing and optimizing AI prompts across different scenarios.

## Features

- 🎨 Modern, professional UI with smooth animations
- 🧪 Create and manage test scenarios
- 🤖 Run live simulations with AI evaluation
- 📊 View detailed results and feedback
- ✨ Generate optimized prompts based on simulation results
- 📋 Copy prompts from any version

## Tech Stack

- **Framework:** Next.js 13.5.1
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Database:** Firebase Firestore
- **AI:** OpenAI GPT-4o-mini

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration (optional - defaults are provided)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** The Firebase configuration has default values set in `lib/firebase.ts` based on your provided config, so you can skip these if using the default project.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Netlify

### Option 1: Deploy via Netlify Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [Netlify](https://app.netlify.com) and sign in**

3. **Click "Add new site" → "Import an existing project"**

4. **Connect your Git provider and select your repository**

5. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next` (will be auto-detected by the plugin)

6. **Add Environment Variables:**
   - Go to Site settings → Environment variables
   - Add the following:
     - `OPENAI_API_KEY` (required)
     - Firebase variables (optional if using defaults):
       - `NEXT_PUBLIC_FIREBASE_API_KEY`
       - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
       - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
       - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
       - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
       - `NEXT_PUBLIC_FIREBASE_APP_ID`
       - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

7. **Deploy!** Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify:**
```bash
netlify login
```

3. **Initialize and deploy:**
```bash
netlify init
netlify deploy --prod
```

4. **Set environment variables:**
```bash
netlify env:set OPENAI_API_KEY "your_openai_key"
# Optional Firebase variables (if not using defaults):
netlify env:set NEXT_PUBLIC_FIREBASE_API_KEY "your_firebase_api_key"
netlify env:set NEXT_PUBLIC_FIREBASE_PROJECT_ID "your_firebase_project_id"
# ... (add other Firebase variables as needed)
```

### Important Notes for Netlify

- The `netlify.toml` file is already configured for Next.js 13
- Netlify will automatically install the `@netlify/plugin-nextjs` plugin
- Make sure all environment variables are set in Netlify dashboard
- The build process may take a few minutes on the first deployment

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── client/            # Client pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── client/           # Client-specific components
│   └── ui/               # UI components
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── openai.ts         # OpenAI integration
└── supabase/             # Database migrations
```

## License

Private project
