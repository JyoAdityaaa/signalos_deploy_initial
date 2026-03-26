# Netlify Deployment Guide — SignalOS

SignalOS is ready for production. Follow these steps to deploy your market intelligence terminal to Netlify.

## 1. Environment Variables (Required)
Before deploying, you **must** configure these variables in the Netlify Dashboard (**Site settings > Environment variables**):

| Key | Value | Description |
|-----|-------|-------------|
| `GEMINI_API_KEY` | `AIza...` | Your Google AI Studio key (Required for AI signals) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza...` | Your Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `etgenai-13652` | Your Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `...` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `...` | Firebase App ID |

> [!IMPORTANT]
> The app will still function in **Live Mode** using the in-memory `LiveStore` even if Firebase is not fully configured, but state will reset if the serverless function spins down.

## 2. Deployment Steps

### Option A: Via GitHub (Recommended)
1. Push your code to a GitHub repository.
2. Link the repository to Netlify.
3. Netlify will detect the `netlify.toml` file I created and use these settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.next`
4. Add the environment variables from Step 1.
5. Deploy.

### Option B: Via Netlify CLI
1. Install CLI: `npm install -g netlify-cli`
2. Run: `netlify deploy --build` (follow prompts)
3. Set your env vars via: `netlify env:set GEMINI_API_KEY your_key`

## 3. Verify Deployment
Once the site is live:
1. Open the URL.
2. Verify the **"● LIVE DATA"** badge is active in the Navbar.
3. Click on the **Live Feed** tab — you should see real-time RSS news streaming in immediately.
4. Go to **Overview** and click **Refresh Pulse** to trigger a full AI ingestion scan.

## 4. Troubleshooting
- **AI Processing Fails**: Check if `GEMINI_API_KEY` is set correctly in Netlify.
- **Empty Dashboard**: Ensure the "Syncing with NSE/BSE..." progress bar finishes. If it hangs, check the Netlify Function logs for "Quota Exceeded" errors.

---
**Build Status**: `PASS` (Next.js 15+ locally validated) ✅
