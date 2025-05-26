# Deploying Astro Clock to Vercel

This guide will walk you through the process of deploying your Astro Clock application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. All environment variables ready

## Environment Variables

Make sure you have the following environment variables ready:

- `OPENAI_API_KEY` - Your OpenAI API key for generating astrological readings
- Any other API keys or secrets used in your application

## Deployment Steps

### 1. Push Your Code to a Git Repository

If you haven't already, push your code to a Git repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repository-url>
git push -u origin main
```

### 2. Connect to Vercel

1. Log in to your [Vercel account](https://vercel.com/login)
2. Click on "New Project"
3. Import your Git repository
4. Configure the project:
   - Vercel should automatically detect that this is a Next.js project
   - Framework preset: Next.js
   - Root directory: `./` (default)
   - Build command: `next build` (default)
   - Output directory: `.next` (default)

### 3. Configure Environment Variables

1. In the project settings, go to the "Environment Variables" tab
2. Add all required environment variables:
   - `OPENAI_API_KEY`
   - Any other API keys or secrets

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be deployed to a URL like `your-project.vercel.app`

## Custom Domain (Optional)

To add a custom domain:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" > "Domains"
3. Add your custom domain
4. Follow the instructions to configure DNS settings

## Continuous Deployment

Vercel automatically sets up continuous deployment. Any changes pushed to your main branch will trigger a new deployment.

## Monitoring and Analytics

---

# Render Deployment Instructions

## 1. Prerequisites
- Make sure `de406e.eph` is NOT in your repo (it’s in `.gitignore`).
- Your code is pushed to GitHub: https://github.com/lillylight/test

## 2. Large File Download
- The file `de406e.eph` will be downloaded automatically during build via `download-assets.sh`.
- The Dropbox direct download link is already set in `download-assets.sh`.

## 3. Service Setup on Render
- **Build Command:**
  ```sh
  ./download-assets.sh && npm install && npm run build
  ```
- **Start Command:**
  ```sh
  npm start
  ```
- **Python Requirements:**
  - Render will install from `requirements.txt` (contains `swisseph`).

## 4. Environment
- Make sure both Node.js and Python are enabled in your Render environment (Render supports this by default).
- Add any required environment variables for your app.

## 5. Deploy
- Connect your GitHub repo to Render.
- Deploy as a single service.
- Test the API endpoint `/api/generate-ephemeris-node` to ensure it works.

## 6. Troubleshooting
- If you see errors about missing files or Python modules, check:
  - The Dropbox link in `download-assets.sh`
  - That `swisseph` is in `requirements.txt`
  - That the build/start commands are set as above

---

1. Use the Vercel dashboard to monitor your application
2. Set up [Vercel Analytics](https://vercel.com/analytics) for insights into user behavior
3. Configure [Error Monitoring](https://vercel.com/docs/error-handling) to track and fix issues

## Production Checklist

Before sharing your app with users, ensure:

1. All environment variables are properly set
2. The application works correctly on the deployed URL
3. Error handling is in place
4. Performance is optimized
5. SEO meta tags are added
6. Privacy policy and terms of service are in place

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in the Vercel dashboard
2. Ensure all environment variables are correctly set
3. Verify that your project works locally with `npm run build && npm start`
4. Check for any API rate limits or quotas
