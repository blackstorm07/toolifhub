# ToolifHub — Premium Online Tools Platform

A production-ready SaaS web application built with **Next.js 15**, **Tailwind CSS**, **Shadcn/UI**, and **MongoDB Atlas**.

---

## ⚡ Quick Start (3 Steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in these 5 values:
```env
MONGODB_URI=mongodb+srv://...          # Your MongoDB Atlas connection string
JWT_SECRET=your-super-secret-32-chars  # Any random 32+ char string
ADMIN_PASSWORD=YourSecurePassword123!  # Password for admin dashboard
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXX # Optional: your GA4 Measurement ID
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-XXX # Optional: your AdSense Publisher ID
```

### 3. Seed the database and run
```bash
npm run seed   # Populates MongoDB with categories, tools, and blog posts
npm run dev    # Start the development server
```

Visit [http://localhost:3000](http://localhost:3000)

**Admin dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)
- Email: value of `ADMIN_EMAIL` in `.env.local` (default: admin@toolifhub.com)
- Password: value of `ADMIN_PASSWORD` in `.env.local`

---

## 📁 Project Structure

```
toolifhub/
├── app/
│   ├── (public)/          # Public-facing pages
│   │   ├── tools/[slug]/  # Individual tool pages
│   │   ├── category/[slug]/ # Category pages
│   │   ├── blog/          # Blog listing & posts
│   │   ├── about/
│   │   ├── contact/
│   │   ├── privacy-policy/
│   │   └── terms-and-conditions/
│   ├── admin/             # Admin dashboard (auth-protected)
│   │   ├── tools/
│   │   ├── categories/
│   │   ├── blogs/
│   │   ├── users/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/               # API routes
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   ├── sitemap.js         # Dynamic XML sitemap
│   └── robots.js          # robots.txt
├── components/
│   ├── ads/               # AdSense components
│   ├── analytics/         # Google Analytics 4
│   ├── home/              # Homepage sections
│   ├── layout/            # Header, Footer, ThemeProvider
│   ├── search/            # Search bar & modal
│   ├── seo/               # JSON-LD structured data
│   └── tools/             # Tool cards, grid, FAQ
├── features/
│   └── tools/             # Interactive tool implementations
│       ├── youtube/       # YouTube tools
│       ├── developer/     # Developer tools
│       ├── text/          # Text tools
│       └── calculators/   # Calculator tools
├── hooks/                 # Custom React hooks
├── lib/                   # Core utilities
│   ├── mongodb.js         # Mongoose singleton connection
│   ├── auth.js            # JWT auth helpers
│   ├── analytics.js       # GA4 tracking helpers
│   └── utils.js           # Utility functions
├── models/                # Mongoose schemas
├── scripts/
│   └── seed.js            # Database seed script
├── services/              # Client-side API service layer
└── config/index.js        # Centralized environment config
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript (no TypeScript) |
| Styling | Tailwind CSS v3 + CSS Variables |
| UI Components | Shadcn/UI + Radix UI |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (httpOnly cookies, 7-day expiry) |
| Analytics | Google Analytics 4 |
| Ads | Google AdSense |
| Theme | next-themes (dark/light mode) |
| Notifications | react-hot-toast |

---

## 🛠️ Available Tools (Seeded)

**YouTube Tools**
- YouTube Tag Generator
- YouTube Title Generator
- YouTube Description Generator
- YouTube Hashtag Generator
- YouTube Earnings Calculator

**Developer Tools**
- JSON Formatter & Beautifier
- Base64 Encoder & Decoder
- UUID Generator
- Hash Generator (MD5/SHA)
- HTML Formatter
- CSS Minifier
- JavaScript Minifier

**Text Tools**
- Word Counter
- Case Converter (10 cases)
- Lorem Ipsum Generator
- Slug Generator
- Text Repeater
- Duplicate Line Remover
- Text Reverser

**Calculators**
- Age Calculator
- BMI Calculator
- Percentage Calculator
- EMI Calculator
- GST Calculator
- Discount Calculator

**Plus:** Password Generator, Color Picker, QR Code Generator, Random Number Generator, Random Name Generator, Instagram Hashtag Generator — all seeded with "coming soon" status and working pages.

---

## 🔐 Admin Dashboard

Access at `/admin` with your ADMIN_EMAIL and ADMIN_PASSWORD.

Features:
- Full CRUD for Tools, Categories, and Blog Posts
- User management (view all users)
- Analytics overview with top tools chart
- Environment variable status checker

---

## 🌐 SEO Features

- Dynamic `sitemap.xml` via `app/sitemap.js`
- `robots.txt` via `app/robots.js`
- Per-page Open Graph and Twitter Card metadata
- JSON-LD structured data (FAQ, Breadcrumb, WebApplication schemas)
- Dynamic `generateMetadata()` on all tool and category pages

---

## 📝 Adding New Tools

1. **Create the component** in `features/tools/[category]/YourTool.jsx`
2. **Register it** in `features/tools/ToolRenderer.jsx` (add a dynamic import entry)
3. **Add to database** via Admin Dashboard at `/admin/tools` (or add to `scripts/seed.js`)

---

## 🚀 Production Deployment

```bash
npm run build
npm run start
```

For Vercel deployment:
1. Push to GitHub
2. Import in Vercel
3. Add all environment variables from `.env.local.example`
4. Deploy

---

## 📄 Environment Variables

See `.env.local.example` for the full list. Required variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs (32+ chars) |
| `ADMIN_PASSWORD` | Admin dashboard password |

Optional (site works without these, just disables ads/analytics):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | GA4 Measurement ID (G-XXXXXXXX) |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` | AdSense publisher ID (ca-pub-XXXXXXXX) |
