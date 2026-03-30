# PRD: Obidient Movement v2 — Public Landing Page

> **Version**: 1.0  
> **Date**: 26 March 2026  
> **Status**: Ready for implementation  
> **Owner**: Agent A (Landing Page)

---

## 1. Overview

Replace the current barebones `LandingPage2.tsx` (which is just a logo + login/register buttons) with a full SEO-optimized public website with 4 pages: **Home**, **About**, **News (Blog)**, and **Contact**.

The public site must be professional, SEO-heavy, and follow premium design principles. It is the public face of the Obidient Movement — a top political platform.

---

## 2. Design System

### 2.1 Design Philosophy
Follow the project's **DESIGN_GUIDE.md** at root:
- Minimal, elegant, spacious, premium, intentional
- Similar to Apple, Linear, Stripe, Notion design language
- Clean typography hierarchy, proper spacing rhythm
- Never overcrowd the interface

### 2.2 Technology Stack
- **Styling**: Tailwind CSS (primary for public pages — not MUI)
- **Font**: Poppins (already imported via Google Fonts in `index.css`)
- **Icons**: Flaticon (`fi fi-rr-*`) or Lucide React (both are available)
- **SEO**: `react-helmet-async` (must be installed — see Section 10)
- **Router**: React Router v7 (`react-router` package — NOT `react-router-dom`)

### 2.3 Color Palette
From existing `tailwind.config.js`:
```
Primary Green:    #0B6739  (accent-green)  — CTAs, links, headers
Secondary Red:    #D21C5B  (accent-red)    — alerts, secondary accents
Background Dark:  #232323  (background-dark)
Background Light: #ffffff  (background-light)
Text Dark:        #e5e5e5  (text-dark)
Text Light:       #000000  (text-light)
Text Muted:       #9ca3af  (text-muted)
```

### 2.4 Spacing Rhythm
- Section spacing: `py-20` to `py-24` (80–96px)
- Component spacing: `gap-4` to `gap-6` (16–24px)
- Inner padding: `p-6` to `p-8` (24–32px)
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### 2.5 Typography Scale
- Page hero titles: `text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight`
- Section titles: `text-3xl lg:text-4xl font-medium`
- Subsection titles: `text-xl font-medium`
- Body: `text-base text-text-muted leading-relaxed`
- Labels/Tags: `text-sm uppercase tracking-wider font-medium text-accent-green`

---

## 3. Architecture

### 3.1 File Structure
```
src/
├── pages/
│   └── public/
│       ├── PublicLayout.tsx         ← Layout wrapper (header + outlet + footer)
│       ├── HomePage.tsx             ← Home page
│       ├── AboutPage.tsx            ← About page
│       ├── NewsPage.tsx             ← Blog listing page
│       ├── NewsPostPage.tsx         ← Single blog post page
│       └── ContactPage.tsx          ← Contact page
├── components/
│   └── public/
│       ├── PublicHeader.tsx         ← Sticky header/navigation
│       ├── PublicFooter.tsx         ← Footer
│       └── SEOHead.tsx             ← Reusable SEO meta tag component
└── services/
    └── blogService.ts              ← Blog API client (SHARED — may already exist)
```

### 3.2 Routing Changes
In `src/main.tsx`, add these routes. The existing `/` route (LandingPage2) is **replaced**:

```tsx
import { Outlet } from 'react-router';

// New public routes replace the "/" route
{
  path: "/",
  element: <PublicLayout />,  // Header + Outlet + Footer
  children: [
    { index: true, element: <HomePage /> },
    { path: "about", element: <AboutPage /> },
    { path: "news", element: <NewsPage /> },
    { path: "news/:slug", element: <NewsPostPage /> },
    { path: "contact", element: <ContactPage /> },
  ],
},
```

**IMPORTANT**: All other existing routes (`/auth/*`, `/dashboard/*`, `/profile/*`, etc.) remain UNTOUCHED. Do not modify them.

### 3.3 Import Pattern
Use lazy loading consistent with existing codebase:
```tsx
const PublicLayout = lazy(() => import("./pages/public/PublicLayout.tsx"));
const HomePage = lazy(() => import("./pages/public/HomePage.tsx"));
// etc.
```

---

## 4. Component Specifications

### 4.1 SEOHead Component

**File**: `src/components/public/SEOHead.tsx`

Wraps `react-helmet-async`. Every page must use it.

```tsx
interface SEOHeadProps {
  title: string;            // Page title — prepends " | Obidient Movement"
  description: string;      // Meta description (150-160 chars)
  canonical?: string;       // Canonical URL
  ogImage?: string;         // Open Graph image URL
  ogType?: string;          // 'website' | 'article'
  article?: {               // Only for blog posts
    publishedTime: string;
    author: string;
    category: string;
    tags: string[];
  };
  jsonLd?: object;          // JSON-LD structured data
}
```

Every page MUST set:
- `<title>` — unique per page
- `<meta name="description">` — unique per page
- `<meta name="robots" content="index, follow">`
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Canonical URL

**HelmetProvider** must wrap the app in `main.tsx`:
```tsx
import { HelmetProvider } from 'react-helmet-async';
// Wrap inside HelmetProvider alongside other providers
```

### 4.2 PublicHeader Component

**File**: `src/components/public/PublicHeader.tsx`

- **Sticky** (`sticky top-0 z-50`) with white background + subtle bottom border
- **Logo**: Use existing `TopLogo` component from `../../components/TopLogo`
- **Navigation links**: Home, About, News, Contact — use `NavLink` for active state styling
- **Right side**: "Login" text link + "Join the Movement" primary CTA button → links to `/auth/sign-up`
- **Mobile**: Hamburger menu icon → slide-in mobile nav panel (no third-party library, just CSS transitions)
- **Active link style**: `text-accent-green font-medium` with small bottom border indicator
- **Scroll behavior**: Add subtle shadow on scroll (`shadow-sm` when scrollY > 0)

### 4.3 PublicFooter Component

**File**: `src/components/public/PublicFooter.tsx`

4-column grid on desktop, stacked on mobile:

1. **Brand Column**: Logo + "The Obidient Movement. Empowering Nigerians for democratic participation, accountability, and national progress." + social icons (Twitter/X, Facebook, Instagram)
2. **Quick Links**: Home, About, News, Contact, Register, Login
3. **Legal**: Privacy Policy, Terms of Service (can be `#` placeholder links for now)
4. **Contact**: Address (Abuja, Nigeria), Email placeholder, Phone placeholder

Bottom bar: `© 2026 Obidient Movement. All rights reserved.`

Dark background: `bg-gray-900 text-white`

---

## 5. Page Specifications

### 5.1 Home Page (`/`)

**SEO**:
- Title: `"Obidient Movement — Join the Movement for a New Nigeria"`
- Description: `"Register as an Obidient member, verify your identity, and join millions of Nigerians committed to democratic progress and national transformation."`
- JSON-LD: Organization schema

**Sections** (in order):

#### Hero Section
- Full viewport height (`min-h-[85vh]`)
- Two-column on desktop: left content, right imagery
- Left: Label tag → Hero heading → CTA button → Supporting paragraph
- Heading: "Register, verify, and become an **Obidient member**" (accent color on "Obidient member")
- CTA: "Register Now" button → `/auth/sign-up`
- Right: Hero image or gradient placeholder (use `bg-gradient-to-br from-accent-green/20 to-accent-green/40` as placeholder)
- Reference: ADC app's HomePage hero section structure

#### Mission Section
- Background: `bg-gray-50/50`
- Two-column: Left = image grid placeholder, Right = content
- Content: "Our Mission" label → heading → paragraph → 3 bullet feature items with icons
- Feature items: Secure registration, Nationwide coverage, Digital membership card

#### How It Works Section
- 3-step card layout with step numbers (01, 02, 03)
- Steps: "Verify Your Identity" → "Complete Profile" → "Get Verified"
- Cards with hover state (`hover:border-accent-green/30`)
- Connector lines between cards on desktop

#### Quote Section
- Dark background (`bg-gray-900 text-white`)
- Centered blockquote with attribution
- Subtle gradient accent overlay

#### Final CTA Section
- Green gradient card (`bg-gradient-to-br from-accent-green to-accent-green/80`)
- Heading + description + two buttons (Register + Member Portal)
- Stats grid: "5 min" registration time, "100%" secure, "Free" registration
- Rounded corners (`rounded-3xl`), decorative blurred circles

### 5.2 About Page (`/about`)

**SEO**:
- Title: `"About the Obidient Movement — Our Vision for Nigeria"`
- Description: `"Learn about the Obidient Movement's mission to empower every Nigerian through democratic participation, accountability, and collective action."`

**Sections**:

#### Hero Banner
- `py-20` with centered text
- Label: "About Us"
- Heading: "Building a movement for Nigeria's future"
- Subtitle paragraph

#### Vision & Mission
- Two-column layout
- Left card: **Vision** — "A Nigeria where every citizen..."
- Right card: **Mission** — "To mobilize, organize, and empower..."
- Cards with subtle border + icon at top

#### Core Values
- Grid of 4–6 value cards (2 cols on mobile, 3 cols on desktop)
- Each: icon + title + short description
- Values: Accountability, Transparency, Unity, Service, Integrity, Innovation

#### Movement Structure
- Heading: "How We're Organized"
- Visual hierarchy breakdown: National → State (36 + FCT) → LGA (774) → Ward → Polling Unit
- Could be a horizontal flow with arrows or a stepped vertical layout
- Each level: icon + title + count/description

#### Join CTA
- Simple section: Heading + "Ready to be part of the change?" + Register button

### 5.3 News Page (`/news`)

**SEO**:
- Title: `"News & Updates — Obidient Movement"`
- Description: `"Stay informed with the latest news, updates, and stories from the Obidient Movement across Nigeria."`

**Layout**:

#### Featured Post
- If published posts exist, show the most recent as a hero card
- Full-width card with featured image background, overlay, title, excerpt, date
- Click → `/news/:slug`

#### Post Grid
- 3-column grid on desktop, 2 on tablet, 1 on mobile
- Each card: featured image (or placeholder), category badge, title, excerpt (2-line clamp), author + date
- Pagination: "Load More" button or page-number pagination
- Empty state: "No posts yet. Check back soon for updates."

**API Integration**:
```typescript
// blogService.ts
GET /api/blog/posts?page=1&limit=12&status=published
// Returns: { posts: Post[], total: number, page: number, pages: number }
```

### 5.4 News Post Page (`/news/:slug`)

**SEO** (CRITICAL — each post has unique meta):
- Title: `"{Post Title} — Obidient Movement"`
- Description: Post excerpt (first 160 chars of content stripped of HTML)
- og:image: Post featured image
- og:type: "article"
- JSON-LD: Article schema with `headline`, `datePublished`, `author`, `image`, `publisher`
- Canonical: `https://member.obidients.com/news/{slug}`

**Layout**:
- Max-width content area (`max-w-3xl mx-auto`)
- Back link: "← Back to News"
- Category badge + Date + Author name
- Title: `text-3xl lg:text-4xl font-medium`
- Featured image (full width of content area, rounded corners)
- Article body: rendered HTML with proper typography styling (`prose` class or custom styles for h2, h3, p, ul, ol, blockquote, img, a)
- Bottom: Share buttons (copy link, Twitter/X share intent URL)
- Related posts: 3 cards at bottom (same category or most recent)

**API Integration**:
```typescript
// blogService.ts  
GET /api/blog/posts/:slug
// Returns: { post: Post }
```

**404 Handling**: If slug not found, show "Post not found" with link back to `/news`

### 5.5 Contact Page (`/contact`)

**SEO**:
- Title: `"Contact Us — Obidient Movement"`
- Description: `"Get in touch with the Obidient Movement. Reach out for inquiries, partnerships, or support."`

**Layout**: Two-column on desktop

#### Left: Contact Form
- Fields: Full Name, Email, Subject (dropdown or text), Message (textarea)
- Submit button: "Send Message"
- **No backend endpoint** is needed now — on submit, show a success toast/message: "Thank you! Your message has been received. We'll get back to you soon."
- Basic client-side validation: required fields, email format
- Add a simple honeypot or time-based anti-spam (hidden field that bots fill)

#### Right: Contact Info
- Address: National HQ, Abuja, Nigeria
- Email: info@obidients.com (placeholder)
- Phone: +234 XXX XXX XXXX (placeholder)
- Social media links
- Optional: Small embedded descriptive card about office hours

---

## 6. Blog Service API Client

**File**: `src/services/blogService.ts`

This service is **shared** between the public landing page and the admin dashboard. If it already exists, use the existing one.

```typescript
import axios from 'axios'; // or use the existing API client pattern in services/

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string | null;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
}

// Public endpoints (no auth required)
export const getPublishedPosts = (page = 1, limit = 12, category?: string): Promise<BlogListResponse> => { ... };
export const getPostBySlug = (slug: string): Promise<BlogPost> => { ... };
export const getCategories = (): Promise<string[]> => { ... };

// Admin endpoints (auth required) — used by admin dashboard
export const createPost = (data: Partial<BlogPost>): Promise<BlogPost> => { ... };
export const updatePost = (id: string, data: Partial<BlogPost>): Promise<BlogPost> => { ... };
export const deletePost = (id: string): Promise<void> => { ... };
export const publishPost = (id: string): Promise<BlogPost> => { ... };
export const unpublishPost = (id: string): Promise<BlogPost> => { ... };
export const getAllPosts = (page: number, limit: number, status?: string): Promise<BlogListResponse> => { ... };
export const uploadBlogImage = (file: File): Promise<string> => { ... };
```

**IMPORTANT — Follow existing API patterns**: Look at how other services in `src/services/` make API calls (e.g., `authService.ts`, `votingBlocService.ts`). Use the same pattern (axios instance, credential handling, API base URL).

---

## 7. Semantic HTML Requirements

Every page must use proper semantic HTML for SEO:

```html
<header> — PublicHeader
<nav> — Navigation
<main> — Page content wrapper
<section> — Each content section
<article> — Blog post content
<footer> — PublicFooter
<h1> — One per page (page title)
<h2> — Section headings
<h3> — Subsection headings
```

- Only ONE `<h1>` per page
- Images must have descriptive `alt` attributes
- Links must have meaningful text (avoid "click here")
- Use `<time datetime="...">` for dates

---

## 8. Responsive Breakpoints

Follow existing Tailwind breakpoints:
- Mobile: default (< 640px)
- Tablet: `sm:` (640px+)
- Small desktop: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large desktop: `xl:` (1280px+)

All pages must look excellent at 375px width (iPhone SE) through 1440px+.

---

## 9. Dark Mode

The project has dark mode via `class` strategy in tailwind. The public landing pages should work in both light and dark mode:
- Use the `dark:` prefix for dark mode variants
- Light: white backgrounds, dark text
- Dark: `bg-background-dark` (#232323), `text-text-dark` (#e5e5e5)
- Check existing pages for dark mode patterns

---

## 10. Dependencies to Install

Before starting implementation, install:

```bash
cd frontend
npm install react-helmet-async
```

Then wrap the app in `main.tsx`:
```tsx
import { HelmetProvider } from 'react-helmet-async';

// In the render tree, wrap existing providers:
<HelmetProvider>
  <ThemeProvider>
    <ModalProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ModalProvider>
  </ThemeProvider>
</HelmetProvider>
```

---

## 11. Implementation Order

1. Install `react-helmet-async` + add `HelmetProvider` to `main.tsx`
2. Create `SEOHead.tsx`
3. Create `PublicHeader.tsx`
4. Create `PublicFooter.tsx`
5. Create `PublicLayout.tsx`
6. Create `HomePage.tsx`
7. Create `AboutPage.tsx`
8. Create `blogService.ts` (just the public read methods — admin methods can be stubs)
9. Create `NewsPage.tsx`
10. Create `NewsPostPage.tsx`
11. Create `ContactPage.tsx`
12. Wire all routes in `main.tsx` (replace `/` route, add children)
13. Test all pages at mobile + desktop
14. Verify SEO tags (check page source for meta tags)

---

## 12. Content Guidelines

- Tone: Professional, empowering, patriotic but not partisan
- The movement is about democratic participation, accountability, citizen empowerment
- Avoid overly political language
- Use "Obidient" branding consistently (capital O)
- Reference "36 states and FCT" when discussing national reach
- Production domain (for canonical URLs): `https://member.obidients.com`

---

## 13. What NOT To Do

- ❌ Do NOT modify any existing pages under `/dashboard/*`, `/auth/*`, `/profile/*`
- ❌ Do NOT use Material UI — landing pages use Tailwind CSS
- ❌ Do NOT create new API endpoints — use the blog API defined in PRD_BLOG_SYSTEM.md
- ❌ Do NOT use `react-router-dom` — the project uses `react-router` v7 directly
- ❌ Do NOT modify the existing UserContext, ThemeContext, or ModalContext
- ❌ Do NOT hardcode content that should come from the API (blog posts)
- ❌ Do NOT add new npm packages beyond `react-helmet-async` without explicit approval
