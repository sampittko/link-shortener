# [free with tech](https://fwt.wtf) - URL Shortener

A simple, secure URL shortener service for the [**free with tech**](https://freewith.tech) brand. This service provides short, memorable links for blog posts, videos, and resources related to digital minimalism and intentional technology use.

## ✨ What it does

This Next.js application serves as a custom URL shortener that:

- **Redirects short URLs** to full blog posts and videos
- **Tracks click analytics** using Upstash Redis
- **Prevents abuse** with domain whitelisting and rate limiting
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
- Upstash Redis database
- Vercel account (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/sampittko/fwtwtf-website.git
cd fwtwtf-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env.local
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

4. Run the development server:
```bash
npm run dev
```

The service will be available at `http://localhost:3000/[slug]`

## 📁 Project Structure

```
/app
  /[slug]
    route.ts         # Dynamic route handler for URL redirection
/public              # Static assets
redirects.json       # URL mappings configuration
vercel.json         # Deployment and redirect configuration
tsconfig.json       # TypeScript configuration
```

## ⚙️ Configuration

### Adding New Short URLs

Edit `redirects.json` to add new URL mappings:

```json
{
  "your-slug": "https://your-full-url.com",
  "another-slug": "https://another-destination.com"
}
```

### Allowed Domains

For security, only these domains are permitted as destinations:
- `freewith.tech`
- `v1.freewith.tech`
- `v2.freewith.tech`
- `youtu.be`
- `open.substack.com`

To modify allowed domains, edit the `ALLOWED_DOMAINS` array in `/app/[slug]/route.ts`.

### Analytics

Click tracking is implemented with:
- **Rate limiting**: Prevents duplicate counts within 60 seconds from the same user
- **Redis storage**: Tracks hits per slug using `hits:{slug}` keys
- **Cookie-based deduplication**: Uses `hit_{slug}` cookies to prevent spam

## 🔒 Security Features

- **Domain whitelisting** prevents malicious redirects
- **URL validation** ensures destination URLs are properly formatted
- **Rate limiting** prevents analytics manipulation
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

**Part of the [free with tech](https://freewith.tech) ecosystem** - helping people build a healthier relationship with technology.
