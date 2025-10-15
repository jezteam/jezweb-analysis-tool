# Deployment Guide - Cloudflare Pages

This guide will help you deploy Jezweb Analysis Tool to Cloudflare Pages with automatic GitHub integration.

## Prerequisites

- Cloudflare account
- GitHub account
- Git installed locally

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `jezweb-analysis-tool` (or any name you prefer)
3. Make it **Public** or **Private** (Cloudflare Pages supports both)
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)

## Step 2: Push Code to GitHub

From your project directory (`/opt/jezweb-analysis-tool`), run:

```bash
# Add GitHub remote (replace with your username/org)
git remote add origin https://github.com/YOUR_USERNAME/jezweb-analysis-tool.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Create Cloudflare KV Namespace

Before deploying, you need to create a KV namespace for caching:

```bash
# Login to Cloudflare (first time only)
npx wrangler login

# Create KV namespace for production
npx wrangler kv:namespace create "CACHE"

# Create KV namespace for preview
npx wrangler kv:namespace create "CACHE" --preview
```

**Important:** Copy the namespace IDs from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_PRODUCTION_KV_ID"        # <- Replace with actual ID
preview_id = "YOUR_PREVIEW_KV_ID"   # <- Replace with actual ID
```

## Step 4: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **Create Application**
4. Select **Pages** tab
5. Click **Connect to Git**

## Step 5: Configure Your Pages Project

### Repository Selection
- Select your GitHub account
- Choose the `jezweb-analysis-tool` repository
- Click **Begin setup**

### Build Settings
Configure the following:

- **Project name**: `jezweb-analysis-tool` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: Select `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### Environment Variables (Optional)
If you plan to use external APIs:

| Variable | Description |
|----------|-------------|
| `GOOGLE_SAFE_BROWSING_API_KEY` | Google Safe Browsing API key |
| `PAGESPEED_API_KEY` | PageSpeed Insights API key |

## Step 6: Configure KV Namespace Binding

After creating the project:

1. Go to your Pages project settings
2. Navigate to **Settings** → **Functions**
3. Under **KV namespace bindings**, add:
   - **Variable name**: `CACHE`
   - **KV namespace**: Select the namespace you created earlier

## Step 7: Deploy

1. Click **Save and Deploy**
2. Cloudflare will automatically:
   - Clone your repository
   - Install dependencies
   - Build the project
   - Deploy to their global network

Your site will be available at: `https://jezweb-analysis-tool.pages.dev`

## Automatic Deployments

From now on, every push to `main` branch will trigger an automatic deployment:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Cloudflare automatically deploys!
```

## Custom Domain (Optional)

To use a custom domain:

1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `jezweb.yourdomain.com`)
4. Follow DNS configuration instructions
5. Cloudflare will automatically provision SSL certificate

## Testing Locally with Cloudflare

Test with Cloudflare Pages Functions locally:

```bash
# Install dependencies
npm install

# Run local development with Cloudflare Workers
npx wrangler pages dev -- npm run dev

# Access at http://localhost:8788
```

## Monitoring and Analytics

1. **Analytics**: View in Cloudflare Dashboard → Your Project → Analytics
2. **Logs**: View function logs in real-time
3. **Performance**: Monitor global performance metrics

## Troubleshooting

### Build Fails
- Check build logs in Cloudflare Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### KV Not Working
- Verify KV namespace binding is correct
- Check that namespace IDs in `wrangler.toml` match your actual namespaces
- Ensure KV binding variable name is `CACHE`

### Functions Not Working
- Make sure `functions/` directory is committed to Git
- Check function logs for errors
- Verify TypeScript types match Cloudflare Workers types

## Useful Commands

```bash
# View deployments
npx wrangler pages deployment list

# View project info
npx wrangler pages project list

# Tail function logs (after deploying)
npx wrangler pages deployment tail
```

## Next Steps

- Set up custom domain
- Configure Web Analytics
- Enable additional Cloudflare features (Bot Management, Rate Limiting, etc.)
- Monitor usage and performance

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Project Issues](https://github.com/YOUR_USERNAME/jezweb-analysis-tool/issues)
