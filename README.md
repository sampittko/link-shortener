# URL Shortener [#freewithtech](https://fwt.wtf)

A simple, secure URL shortener service for the [**#freewithtech**](https://freewith.tech) brand. This service provides short, memorable links for blog posts, videos, and resources related to digital minimalism and intentional technology use.

## ✨ What it does

This Next.js application serves as a custom URL shortener that:

- **Redirects short URLs** to full blog posts and videos
- **Tracks click analytics** using Upstash Redis
- **Prevents abuse** with build-time domain/protocol validation
- **Preserves query parameters** when redirecting
- **Provides clean, memorable links** for content sharing

## 🔗 Example URLs

- `fwt.wtf/kickoff` → Full Substack article about digital freedom
- `fwt.wtf/my-story-video` → YouTube video about the creator's journey
- `fwt.wtf/digital-minimalism` → Blog post about digital minimalism

## 🧱 Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Upstash Redis** for analytics tracking
- **Vercel** for hosting and deployment
- **Domain whitelisting** for security

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Upstash Redis database (optional, only for analytics)
- Vercel account (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/sampittko/link-shortener.git
cd link-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional, only for analytics):
```bash
# .env.local
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

If these variables are not set, redirects still work and analytics is disabled.

4. Run the development server:
```bash
npm run dev
```

The service will be available at `http://localhost:3000/[slug]`

## 📁 Project Structure

```
/app
  route.ts              # Root redirect (/ -> freewith.tech)
  /[slug]
    route.ts            # Dynamic route handler for short links
/data                  # Redirect source files by category
/scripts
  build-redirects.js    # Merges /data/*.json into redirects.json
/lib
  redirect-utils.ts     # Redirect + analytics helper
redirects.json          # Generated at build/dev time
```

## ⚙️ Configuration

### Adding New Short URLs

Add mappings in the appropriate file inside `/data` (for example `data/content.json`), then regenerate redirects:

```bash
npm run build:redirects
```

`npm run dev` and `npm run build` run this automatically.

Each file in `/data` should be a simple slug-to-URL object:

```json
{
  "your-slug": "https://your-full-url.com",
  "another-slug": "https://another-destination.com"
}
```

### Allowed Domains

For security, only these domains are permitted as destinations:
- `github.com`
- `freewith.tech`
- `v1.freewith.tech`
- `v2.freewith.tech`
- `journey.freewith.tech`
- `youtu.be`
- `youtube.com`
- `open.substack.com`
- `testflight.apple.com`
- `producthunt.com`
- `apps.apple.com`

To modify allowed domains, edit the `ALLOWED_DOMAINS` set in `/scripts/build-redirects.js`.

### Analytics

Click tracking is implemented with:
- **Optional Redis storage**: Tracks hits per slug using `hits:{slug}` keys when Upstash env vars are configured
- **Cookie-based deduplication**: Uses `hit_{slug}` cookies to prevent duplicate hits within 60 seconds
- **Graceful fallback**: If Redis is not configured, redirects still work and no analytics cookies are set

## 🔒 Security Features

- **Build-time domain whitelisting** prevents malicious redirects
- **Build-time URL + protocol validation** ensures destination URLs are properly formatted and use HTTPS
- **Duplicate slug detection** prevents accidental redirect overrides across `/data/*.json` files
- **Query parameter preservation** maintains link functionality

## 🚀 Deployment

The application is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The root domain (`/`) redirects to the main website at `freewith.tech`.

## 📊 Analytics Access

Click data is stored in Redis with keys like `hits:slug-name`. You can query this data to understand link performance and content engagement.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Add new URL mappings
- Improve security features
- Enhance analytics tracking
- Add new destination domains (with proper security review)

## 📄 License

This project is open source and available under the MIT License.

## ☕ Support

If you find this project valuable, [consider buying me a coffee](https://www.buymeacoffee.com/sampittko)!

---

**Part of the [#freewithtech](https://freewith.tech) ecosystem** - helping people build a healthier relationship with technology.
