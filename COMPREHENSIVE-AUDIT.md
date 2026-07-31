# MCU Institute Website — Comprehensive Audit & Issue Tracker

**Last Updated:** 30 July 2026  
**Audited by:** Arena AI Agent  
**Total Issues:** 87

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. No Real Payment Processing
> ✅ **FIXED (31 Jul 2026):** Real Stripe checkout with Managed Payments — see `STRIPE-SETUP.md`. Enrollments/memberships are now activated only by the `checkout.session.completed` webhook after real payment; mock card forms removed.
- **Location:** `/courses` (line 150+), `/membership` (line 180+)
- **Problem:** Payment forms are mock/sandbox only. Card numbers are hardcoded placeholders (`4242 •••• •••• 4242`). No real money moves.
- **Impact:** Students can't actually pay for courses or memberships
- **Fix:** Integrate Stripe or PayPal. Replace mock form with real payment gateway. Update enrollment logic to wait for successful payment webhook before setting `paymentstatus = 'Paid'`.
- **Files to change:**
  - `app/courses/page.tsx` — replace `handleProcessPayment` with Stripe integration
  - `app/membership/page.tsx` — replace `handleProcessPayment` with Stripe integration
  - Add `npm install @stripe/stripe-js @stripe/react-stripe-js`
  - Create `lib/stripe.ts` for Stripe client
  - Create API routes: `app/api/create-payment-intent/route.ts`

---

### 2. Contact Form Does Nothing
- **Location:** `/contact` (line 30-40)
- **Problem:** `handleSubmit` just sets `submitted = true` but never sends the message anywhere
- **Impact:** No one receives contact form submissions
- **Fix:** Send emails via Resend/SendGrid or save to database
- **Files to change:**
  - `app/contact/page.tsx` — add fetch to API route
  - Create `app/api/contact/route.ts` — handle form submission
  - Install email service: `npm install resend` or use Supabase Edge Functions

---

### 3. Shop Has No Cart or Checkout
- **Location:** `/shop` (line 100+)
- **Problem:** "Add to Cart" buttons do nothing. No cart state, no checkout flow
- **Impact:** Shop is completely non-functional
- **Fix:** Either implement cart + checkout or remove the page from nav
- **Files to change:**
  - `app/shop/page.tsx` — add cart state, checkout modal
  - Create cart context: `lib/CartContext.tsx`
  - Add checkout page: `app/checkout/page.tsx`
  - **OR** delete `app/shop/page.tsx` and remove from `components/NavBar.tsx` navItems

---

### 4. Middleware Not Protecting Admin Routes
- **Location:** `app/proxy.ts` (line 10-15)
- **Problem:** Middleware only protects `/dashboard` and `/profile` (which don't exist). Admin routes (`/admin/*`) are unprotected at middleware level.
- **Impact:** Admin pages rely solely on client-side checks (can be bypassed)
- **Fix:** Add `/admin` to protected paths and verify `is_admin` server-side
- **Files to change:**
  - `app/proxy.ts` — add `/admin` to `protectedPaths`, add admin check
  - Create `app/api/check-admin/route.ts` or use Supabase RLS

---

### 5. No Rate Limiting on Auth Endpoints
- **Location:** Auth pages + Supabase client
- **Problem:** No rate limiting on login/register/password reset. Vulnerable to brute force.
- **Impact:** Security risk
- **Fix:** Add rate limiting via Vercel Edge Config or Supabase Edge Functions
- **Files to change:**
  - `app/proxy.ts` — add rate limiting middleware
  - Or use Vercel's `@vercel/edge` package

---

### 6. Supabase URL/Key Hardcoded in Proxy
- **Location:** `app/proxy.ts` (line 14)
- **Problem:** Cookie name `sb-xvyowsrqbkjmlilctthm-auth-token` is hardcoded with project reference
- **Impact:** Breaks if Supabase project changes
- **Fix:** Use `process.env.NEXT_PUBLIC_SUPABASE_URL` to derive cookie name dynamically
- **Files to change:** `app/proxy.ts`

---

### 7. Missing Error Boundaries
- **Location:** All pages
- **Problem:** No React error boundaries. If any component crashes, entire page breaks.
- **Impact:** Poor user experience, no graceful degradation
- **Fix:** Wrap pages in error boundaries
- **Files to change:**
  - Create `components/ErrorBoundary.tsx`
  - Create `app/error.tsx` (Next.js app router error handling)
  - Create `app/global-error.tsx`

---

## 🟠 HIGH PRIORITY (Fix Soon)

### 8. No User Profile Page
- **Location:** Missing
- **Problem:** Students can't view/edit their profile, see enrollments, or download certificates
- **Impact:** Major missing feature
- **Fix:** Create student dashboard
- **Files to create:**
  - `app/dashboard/page.tsx` — student dashboard
  - `app/profile/page.tsx` — edit profile
  - `app/my-courses/page.tsx` — enrolled courses + certificates

---

### 9. No Course Detail Pages
- **Location:** `/courses` (line 100+)
- **Problem:** Course cards link nowhere. No detailed course info pages.
- **Impact:** Students can't read full course descriptions, syllabus, instructor bio
- **Fix:** Create dynamic course pages
- **Files to create:**
  - `app/courses/[courseid]/page.tsx` — course detail
  - Add syllabus, schedule, prerequisites to `courses` table

---

### 10. Membership Prices Hardcoded
> ✅ **FIXED (31 Jul 2026):** `price` column added to `membershiptiers` via `supabase/stripe.sql`; the page reads prices from the database.
- **Location:** `/membership` (line 110-120)
- **Problem:** Prices (HK$1,200 / HK$3,800 / HK$8,800) are hardcoded in fallback, not in database
- **Impact:** Can't change prices without code deploy
- **Fix:** Add `price` column to `membershiptiers` table
- **Files to change:**
  - `supabase/RUN-THIS-IN-SUPABASE.sql` — add `price NUMERIC(8,2)` to `membershiptiers`
  - `app/membership/page.tsx` — read price from DB instead of hardcoded

---

### 11. Course Images Not Stored
- **Location:** `/courses` (line 95)
- **Problem:** All courses use same placeholder image URL. No image column in `courses` table.
- **Impact:** Can't customize course images
- **Fix:** Add image URL column to courses table
- **Files to change:**
  - `supabase/RUN-THIS-IN-SUPABASE.sql` — add `image_url TEXT` to `courses`
  - `app/courses/page.tsx` — use `c.image_url` instead of hardcoded Unsplash URL

---

### 12. Course Metadata Missing from DB
- **Location:** `/courses` (line 90-95)
- **Problem:** Duration, level, format are hardcoded ("10 weeks", "Professional", "Hybrid") — not in database
- **Impact:** Can't customize per course
- **Fix:** Add columns to `courses` table
- **Files to change:**
  - `supabase/RUN-THIS-IN-SUPABASE.sql` — add `duration VARCHAR(50)`, `level VARCHAR(50)`, `format VARCHAR(50)` to `courses`
  - `app/courses/page.tsx` — read from DB

---

### 13. No Duplicate Enrollment Check
> ✅ **FIXED (31 Jul 2026):** checkout API rejects duplicates (409) and `enrollments(user_id, courseid)` now has a UNIQUE index (`supabase/stripe.sql`).
- **Location:** `/courses` (line 150-170)
- **Problem:** Students can enroll in same course multiple times
- **Impact:** Duplicate enrollments, multiple charges
- **Fix:** Check if already enrolled before allowing enrollment
- **Files to change:**
  - `app/courses/page.tsx` — check `enrolledCourseIds` before opening modal
  - Add UNIQUE constraint: `ALTER TABLE enrollments ADD CONSTRAINT unique_user_course UNIQUE (user_id, courseid);`

---

### 14. Membership Downgrades Allowed
- **Location:** `/membership` (line 180-200)
- **Problem:** Users can downgrade tier but keep original memberid. No refund logic.
- **Impact:** Confusing billing, potential abuse
- **Fix:** Either block downgrades or implement proration/refund
- **Files to change:**
  - `app/membership/page.tsx` — disable lower tiers, or add downgrade confirmation
  - Add business logic for refunds

---

### 15. No Email Notifications
- **Location:** Missing
- **Problem:** No emails sent on: registration, enrollment, payment, grade, certificate
- **Impact:** Poor communication
- **Fix:** Add email triggers via Supabase Edge Functions or pg_cron
- **Files to create:**
  - `supabase/functions/send-welcome-email/index.ts`
  - `supabase/functions/send-enrollment-confirmation/index.ts`
  - `supabase/functions/send-certificate-issued/index.ts`

---

### 16. Google Maps API Key Missing
- **Location:** `/contact` (line 120-130)
- **Problem:** Google Maps embed uses hardcoded coordinates without API key
- **Impact:** Map may stop working, usage limits
- **Fix:** Get Google Maps API key or use OpenStreetMap
- **Files to change:**
  - `app/contact/page.tsx` — add API key to iframe URL or replace with OpenStreetMap

---

### 17. No Image Optimization
- **Location:** All pages
- **Problem:** Using `<img>` tags instead of Next.js `<Image>` component
- **Impact:** Poor performance, no lazy loading, no responsive images
- **Fix:** Replace all `<img>` with `<Image>` from `next/image`
- **Files to change:** Every page with images (20+ files)
- **Also:** Update `next.config.ts`:
  ```ts
  const nextConfig: NextConfig = {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'images.unsplash.com' },
        { protocol: 'https', hostname: 'mcuinstitute.com' },
        { protocol: 'https', hostname: 'vhyrjwkqlxjmlilctthm.supabase.co' },
      ],
    },
  }
  ```

---

### 18. No Loading States for Images
- **Location:** All image components
- **Problem:** Images flash in without placeholder or blur
- **Impact:** Poor UX, layout shift
- **Fix:** Add `placeholder="blur"` with blurDataURL, or use skeleton loaders
- **Files to change:** Every component with images

---

### 19. No Form Validation Feedback
- **Location:** `/register`, `/login`, `/contact`
- **Problem:** Forms only show errors after submit. No real-time validation.
- **Impact:** Poor UX
- **Fix:** Add real-time validation with error messages
- **Files to change:** All form pages

---

### 20. Password Strength Not Enforced
- **Location:** `/register` (line 40)
- **Problem:** Only checks `length >= 8`. No complexity requirements.
- **Impact:** Weak passwords allowed
- **Fix:** Add password strength meter and requirements (uppercase, number, special char)
- **Files to change:** `app/register/page.tsx`, `app/reset-password/page.tsx`

---

## 🟡 MEDIUM PRIORITY (Improve When Possible)

### 21. No Search Functionality
- **Location:** Missing
- **Problem:** No way to search courses, students, or content
- **Impact:** Hard to find specific information
- **Fix:** Add search bar to nav, implement search API
- **Files to create:**
  - `components/SearchBar.tsx`
  - `app/api/search/route.ts`

---

### 22. No Pagination on Admin Tables
- **Location:** `/admin/students` (line 100+), `/admin/grades` (line 80+)
- **Problem:** Loads ALL students/enrollments at once. Will be slow with 1000+ rows.
- **Impact:** Performance degradation
- **Fix:** Add pagination (10/20/50 per page)
- **Files to change:**
  - `app/admin/students/page.tsx` — add pagination controls
  - `app/admin/grades/page.tsx` — add pagination controls

---

### 23. No Export/Download for Admin Data
- **Location:** `/admin/students`, `/admin/grades`
- **Problem:** Can't export student list, enrollments, or grades to CSV/Excel
- **Impact:** Manual data extraction
- **Fix:** Add "Export CSV" buttons
- **Files to change:** Admin pages, add export logic

---

### 24. Certificate PDF Generation Client-Side
- **Location:** `/admin/students` (line 350+)
- **Problem:** Uses `window.print()` which is unreliable, depends on browser settings
- **Impact:** Inconsistent PDF output
- **Fix:** Generate PDF server-side with `puppeteer` or `react-pdf`
- **Files to change:**
  - Create `app/api/certificate/[certificateid]/pdf/route.ts`
  - Install `npm install puppeteer` or `@react-pdf/renderer`

---

### 25. No Bulk Grade Import
- **Location:** `/admin/grades`
- **Problem:** Must grade each student individually. No CSV upload.
- **Impact:** Slow for large classes
- **Fix:** Add CSV upload for bulk grading
- **Files to change:** `app/admin/grades/page.tsx`

---

### 26. Advisory Board Photos Not Optimized
- **Location:** `/about` (line 250+), `public/team/*.png`
- **Problem:** PNG files may be large, not resized for web
- **Impact:** Slow page load
- **Fix:** Convert to WebP, resize to 300x300, use Next.js Image
- **Files to change:**
  - Optimize images in `public/team/`
  - `app/about/page.tsx` — use `<Image>` component

---

### 27. Hero Images Not Local
- **Location:** `/` (Hero.tsx), `/about`, `/courses`, `/membership`, `/partnership`, `/contact`
- **Problem:** Using Unsplash URLs. External dependency.
- **Impact:** Images may break if Unsplash changes URLs, slow load times
- **Fix:** Download images, store in `public/images/`, use Next.js Image
- **Files to change:** All pages using Unsplash URLs

---

### 28. No 404 Page
- **Location:** Missing
- **Problem:** No custom 404 page
- **Impact:** Generic error page
- **Fix:** Create custom 404
- **Files to create:** `app/not-found.tsx`

---

### 29. No Offline Support
- **Location:** Missing
- **Problem:** No service worker for offline access
- **Impact:** Can't access content offline
- **Fix:** Add PWA manifest and service worker (low priority for this site)

---

### 30. No Analytics
- **Location:** Missing
- **Problem:** No tracking of page views, conversions, user behavior
- **Impact:** Can't measure success
- **Fix:** Add Vercel Analytics or Google Analytics
- **Files to change:** `app/layout.tsx` — add analytics script

---

### 31. No A/B Testing Setup
- **Location:** Missing
- **Problem:** No way to test different versions of pages
- **Impact:** Can't optimize conversions
- **Fix:** Add Vercel Edge Config for feature flags

---

### 32. Membership Tier Features Hardcoded
- **Location:** `/membership` (line 20-70)
- **Problem:** Tier benefits are hardcoded in fallbackTiers array
- **Impact:** Can't change benefits without code deploy
- **Fix:** Store benefits in database or CMS
- **Files to change:**
  - Add `benefits JSONB` column to `membershiptiers` table
  - `app/membership/page.tsx` — read from DB

---

### 33. No Instructor Detail Pages
- **Location:** `/courses` (line 95)
- **Problem:** Instructor names shown but no bio pages
- **Impact:** Can't learn about instructors
- **Fix:** Create instructor profile pages
- **Files to create:**
  - `app/instructors/[instructorid]/page.tsx`
  - Add `bio TEXT`, `photo_url TEXT` to `instructors` table

---

### 34. Testimonials Hardcoded
- **Location:** `components/TestimonialsSection.tsx`
- **Problem:** Testimonials are hardcoded, not from database
- **Impact:** Can't update without code change
- **Fix:** Add testimonials table to database
- **Files to change:**
  - `supabase/RUN-THIS-IN-SUPABASE.sql` — add `testimonials` table
  - `components/TestimonialsSection.tsx` — fetch from DB

---

### 35. Achievements Hardcoded
- **Location:** `components/AchievementsSection.tsx`
- **Problem:** Stats (200+ courses, 98% satisfaction, etc.) are hardcoded
- **Impact:** Can't update without code change
- **Fix:** Add to database or config file
- **Files to change:**
  - `components/AchievementsSection.tsx` — read from config or DB

---

### 36. Timeline Hardcoded
- **Location:** `/about` (line 60-80)
- **Problem:** Timeline events hardcoded
- **Impact:** Can't update without code change
- **Fix:** Add to database
- **Files to change:**
  - Add `timeline` table to DB
  - `app/about/page.tsx` — fetch from DB

---

### 37. Department Info Hardcoded
- **Location:** `/departments` (line 20-60)
- **Problem:** Department descriptions and courses hardcoded
- **Impact:** Can't update without code change
- **Fix:** Add to database
- **Files to change:**
  - Add `departments` table (already exists in SQL but unused)
  - `app/departments/page.tsx` — fetch from DB

---

### 38. Partnership Benefits Hardcoded
- **Location:** `/partnership` (line 70-90)
- **Problem:** Benefits list hardcoded
- **Impact:** Can't update without code change
- **Fix:** Add to database or config

---

### 39. Shop Products Hardcoded
- **Location:** `/shop` (line 10-60)
- **Problem:** All products hardcoded
- **Impact:** Can't update without code change
- **Fix:** Add `products` table to database
- **Files to change:**
  - `supabase/RUN-THIS-IN-SUPABASE.sql` — add `products` table
  - `app/shop/page.tsx` — fetch from DB

---

### 40. No Dark Mode
- **Location:** Missing
- **Problem:** No dark mode toggle
- **Impact:** User preference not respected
- **Fix:** Add theme toggle with `prefers-color-scheme` detection
- **Files to change:**
  - Create `lib/ThemeContext.tsx`
  - Update `app/globals.css` with dark mode variables
  - Add toggle to `components/NavBar.tsx`

---

## 🔵 LOW PRIORITY (Nice to Have)

### 41. No Internationalization (i18n)
- **Location:** All pages
- **Problem:** English only, no Chinese support
- **Impact:** Can't serve Chinese-speaking audience
- **Fix:** Add i18n with `next-i18next` or Next.js app router i18n
- **Files to change:** Every page with text (50+ files)

---

### 42. No Social Login
- **Location:** `/login`, `/register`
- **Problem:** Email/password only, no Google/Facebook/LinkedIn login
- **Impact:** Friction in signup
- **Fix:** Add OAuth providers in Supabase
- **Files to change:**
  - Configure providers in Supabase dashboard
  - `app/login/page.tsx` — add OAuth buttons
  - `app/register/page.tsx` — add OAuth buttons

---

### 43. No Two-Factor Authentication
- **Location:** Missing
- **Problem:** No 2FA for admin accounts
- **Impact:** Security risk
- **Fix:** Enable 2FA in Supabase Auth settings

---

### 44. No CAPTCHA
- **Location:** `/register`, `/contact`, `/forgot-password`
- **Problem:** No bot protection
- **Impact:** Spam submissions
- **Fix:** Add reCAPTCHA or hCaptcha
- **Files to change:** Form pages, add CAPTCHA component

---

### 45. No Cookie Consent Banner
- **Location:** Missing
- **Problem:** No GDPR/privacy compliance banner
- **Impact:** Legal risk
- **Fix:** Add cookie consent banner
- **Files to create:** `components/CookieConsent.tsx`

---

### 46. No Privacy Policy or Terms Pages
- **Location:** `/login` (line 130), `/register` (line 150)
- **Problem:** Links to `#` (nowhere)
- **Impact:** Legal risk, broken links
- **Fix:** Create pages or link to external docs
- **Files to create:**
  - `app/privacy/page.tsx`
  - `app/terms/page.tsx`

---

### 47. No Accessibility Audit
- **Location:** All pages
- **Problem:** No WCAG compliance check
- **Impact:** Excludes users with disabilities, legal risk
- **Fix:** Run accessibility audit, fix issues
- **Common fixes needed:**
  - Add `aria-label` to buttons without text
  - Improve color contrast
  - Add skip navigation link
  - Make sure all interactive elements are keyboard accessible

---

### 48. No Skip Navigation Link
- **Location:** `app/layout.tsx`
- **Problem:** No way to skip nav and go straight to content
- **Impact:** Accessibility issue
- **Fix:** Add skip link
- **Files to change:** `app/layout.tsx`

---

### 49. No Sitemap
- **Location:** Missing
- **Problem:** No `sitemap.xml`
- **Impact:** Poor SEO
- **Fix:** Generate sitemap
- **Files to create:** `app/sitemap.ts` (Next.js automatic sitemap)

---

### 50. No Robots.txt
- **Location:** Missing
- **Problem:** No `robots.txt`
- **Impact:** Can't control crawler behavior
- **Fix:** Create robots.txt
- **Files to create:** `public/robots.txt`

---

### 51. No Open Graph Meta Tags
- **Location:** `app/layout.tsx`
- **Problem:** Basic metadata only, no OG tags for social sharing
- **Impact:** Poor social media previews
- **Fix:** Add Open Graph and Twitter Card meta tags
- **Files to change:** `app/layout.tsx` or per-page metadata

---

### 52. No Structured Data (JSON-LD)
- **Location:** Missing
- **Problem:** No schema.org markup
- **Impact:** Missing rich snippets in search results
- **Fix:** Add JSON-LD for courses, organization, events
- **Files to change:** `app/layout.tsx`, course pages

---

### 53. No RSS Feed
- **Location:** Missing
- **Problem:** No RSS feed for courses or blog
- **Impact:** Can't subscribe to updates
- **Fix:** Add RSS feed route
- **Files to create:** `app/rss.xml/route.ts`

---

### 54. No Blog Section
- **Location:** Missing
- **Problem:** No blog or news section
- **Impact:** No content marketing, poor SEO
- **Fix:** Add blog with MDX or CMS
- **Files to create:**
  - `app/blog/page.tsx` — blog list
  - `app/blog/[slug]/page.tsx` — blog post
  - Use MDX files in `content/blog/` or integrate with CMS (Sanity, Contentful)

---

### 55. No FAQ Section
- **Location:** Missing
- **Problem:** No frequently asked questions
- **Impact:** Repetitive support queries
- **Fix:** Add FAQ page or accordion on relevant pages
- **Files to create:** `app/faq/page.tsx`

---

### 56. No Live Chat
- **Location:** Missing
- **Problem:** No live chat widget
- **Impact:** Slower support response
- **Fix:** Add Crisp, Intercom, or Tawk.to widget
- **Files to change:** `app/layout.tsx` — add chat script

---

### 57. No Video Integration
- **Location:** Missing
- **Problem:** No course preview videos or intro videos
- **Impact:** Less engaging
- **Fix:** Add video player component
- **Files to create:** `components/VideoPlayer.tsx`

---

### 58. No Calendar Integration
- **Location:** Missing
- **Problem:** No course schedule calendar
- **Impact:** Hard to see upcoming courses
- **Fix:** Add calendar component
- **Files to create:** `components/Calendar.tsx`

---

### 59. No Notifications System
- **Location:** Missing
- **Problem:** No in-app notifications for students or admins
- **Impact:** Miss important updates
- **Fix:** Add notifications table and UI
- **Files to create:**
  - Add `notifications` table to DB
  - `components/NotificationBell.tsx`
  - `app/notifications/page.tsx`

---

### 60. No Course Reviews/Ratings
- **Location:** Missing
- **Problem:** Students can't rate or review courses
- **Impact:** No social proof
- **Fix:** Add reviews system
- **Files to create:**
  - Add `reviews` table to DB
  - `components/ReviewForm.tsx`
  - `components/ReviewList.tsx`

---

### 61. No Course Completion Tracking
- **Location:** Missing
- **Problem:** No progress tracking for multi-module courses
- **Impact:** Students can't see progress
- **Fix:** Add modules and progress tracking
- **Files to change:**
  - Add `course_modules`, `module_progress` tables
  - Create course player UI

---

### 62. No Certificate Verification Page
- **Location:** Missing
- **Problem:** No public page to verify certificate authenticity
- **Impact:** Employers can't verify certificates
- **Fix:** Add verification page
- **Files to create:**
  - `app/verify/[certificatenumber]/page.tsx`
  - Add public RLS policy for certificate lookup

---

### 63. No Alumni Directory
- **Location:** Missing
- **Problem:** No way for alumni to connect
- **Impact:** Missed networking opportunities
- **Fix:** Add alumni directory (opt-in)
- **Files to create:**
  - `app/alumni/page.tsx`
  - Add `alumni_visible BOOLEAN` to `users` table

---

### 64. No Events Calendar
- **Location:** Missing
- **Problem:** No upcoming events listing
- **Impact:** Low event attendance
- **Fix:** Add events system
- **Files to create:**
  - Add `events` table to DB
  - `app/events/page.tsx`

---

### 65. No Resource Library
- **Location:** Missing
- **Problem:** No downloadable resources for members
- **Impact:** Less value for members
- **Fix:** Add resource library
- **Files to create:**
  - Add `resources` table to DB
  - `app/resources/page.tsx`

---

### 66. No Discussion Forum
- **Location:** Missing
- **Problem:** No community forum
- **Impact:** Less engagement
- **Fix:** Add forum or integrate with Discourse

---

### 67. No Mentorship Matching
- **Location:** `/membership` mentions it but doesn't exist
- **Problem:** Professional tier promises "Mentor matching program" but no implementation
- **Impact:** False advertising
- **Fix:** Add mentorship system or remove from benefits
- **Files to create:** `app/mentorship/page.tsx`

---

### 68. No CPD Point Tracking
- **Location:** `/membership` mentions it but doesn't exist
- **Problem:** Professional tier promises "CPD point tracking portal" but no implementation
- **Impact:** False advertising
- **Fix:** Add CPD tracking
- **Files to create:**
  - Add `cpd_points` table
  - `app/cpd/page.tsx`

---

### 69. No Job Board
- **Location:** `/membership` mentions it but doesn't exist
- **Problem:** Club benefits promise "Job board for financial planning roles" but no implementation
- **Impact:** False advertising
- **Fix:** Add job board
- **Files to create:**
  - Add `jobs` table
  - `app/jobs/page.tsx`

---

### 70. No Mobile App
- **Location:** Missing
- **Problem:** Web-only, no mobile app
- **Impact:** Less convenient for mobile users
- **Fix:** Build React Native app or PWA (very low priority)

---

## 🟣 CODE QUALITY & MAINTENANCE

### 71. Massive Inline Styles
- **Location:** Every page
- **Problem:** Thousands of lines of inline `style={{}}` objects
- **Impact:** Hard to maintain, no reusability, large bundle size
- **Fix:** Move styles to CSS modules or Tailwind classes
- **Files to change:** Every component (50+ files)
- **Example:**
  ```tsx
  // Before
  <div style={{ padding: 20, background: '#fff', borderRadius: 8 }}>
  
  // After
  <div className="p-5 bg-white rounded-lg">
  ```

---

### 72. No TypeScript Strict Mode
- **Location:** `tsconfig.json`
- **Problem:** `"strict": false` (or missing)
- **Impact:** Type safety not enforced
- **Fix:** Enable strict mode
- **Files to change:** `tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "strict": true
    }
  }
  ```

---

### 73. No ESLint Configuration
- **Location:** `eslint.config.mjs`
- **Problem:** Basic config, many rules disabled
- **Impact:** Inconsistent code style
- **Fix:** Enable recommended rules
- **Files to change:** `eslint.config.mjs`

---

### 74. No Prettier Configuration
- **Location:** Missing
- **Problem:** No `.prettierrc` file
- **Impact:** Inconsistent formatting
- **Fix:** Add Prettier config
- **Files to create:** `.prettierrc`

---

### 75. No Husky Pre-Commit Hooks
- **Location:** Missing
- **Problem:** No linting/formatting on commit
- **Impact:** Bad code gets committed
- **Fix:** Add Husky + lint-staged
- **Files to create:** `.husky/pre-commit`

---

### 76. No Testing
- **Location:** Missing
- **Problem:** Zero tests (unit, integration, E2E)
- **Impact:** Bugs slip through, refactoring is risky
- **Fix:** Add Jest + React Testing Library + Playwright
- **Files to create:**
  - `__tests__/` directory
  - `e2e/` directory
  - `jest.config.js`
  - `playwright.config.ts`

---

### 77. No Storybook
- **Location:** Missing
- **Problem:** No component documentation
- **Impact:** Hard to reuse components
- **Fix:** Add Storybook
- **Files to create:** `.storybook/` directory

---

### 78. Supabase Client Created Multiple Times
- **Location:** Multiple pages
- **Problem:** `createClient()` called in multiple `useEffect` hooks
- **Impact:** Potential memory leaks, redundant connections
- **Fix:** Create client once, pass via context or hook
- **Files to change:** Create `lib/useSupabase.ts` hook

---

### 79. No Error Logging
- **Location:** All catch blocks
- **Problem:** Errors only logged to console
- **Impact:** Can't track production errors
- **Fix:** Add Sentry or Vercel error tracking
- **Files to change:** Install `@sentry/nextjs`, wrap app

---

### 80. No Environment Variable Validation
- **Location:** Missing
- **Problem:** No check that required env vars are set
- **Impact:** App crashes at runtime with unclear errors
- **Fix:** Add env validation with `zod`
- **Files to create:** `lib/env.ts`
  ```ts
  import { z } from 'zod';
  const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  });
  envSchema.parse(process.env);
  ```

---

### 81. No API Documentation
- **Location:** Missing
- **Problem:** No Swagger/OpenAPI docs for API routes
- **Impact:** Hard for other devs to integrate
- **Fix:** Add API docs

---

### 82. Database Migrations Not Versioned
- **Location:** `supabase/*.sql`
- **Problem:** SQL files are one-time setup, no migration system
- **Impact:** Hard to track schema changes
- **Fix:** Use Supabase CLI migrations or `dbmate`
- **Files to create:** `supabase/migrations/` directory with timestamped files

---

### 83. No Database Backups Documented
- **Location:** Missing
- **Problem:** No backup strategy documented
- **Impact:** Data loss risk
- **Fix:** Document Supabase automatic backups, add manual backup script
- **Files to create:** `BACKUP-STRATEGY.md`

---

### 84. No Monitoring or Uptime Tracking
- **Location:** Missing
- **Problem:** No uptime monitoring
- **Impact:** Don't know when site is down
- **Fix:** Add UptimeRobot, Pingdom, or Vercel monitoring

---

### 85. No Performance Budget
- **Location:** Missing
- **Problem:** No bundle size limits
- **Impact:** Bundle grows unchecked
- **Fix:** Add bundle analyzer, set budget in `next.config.ts`

---

### 86. No Changelog
- **Location:** Missing
- **Problem:** No `CHANGELOG.md`
- **Impact:** Hard to track what changed
- **Fix:** Add changelog, use `changesets`

---

### 87. README is Generic Next.js Template
- **Location:** `README.md`
- **Problem:** Still has default Next.js boilerplate, no project-specific info
- **Impact:** Confusing for new developers
- **Fix:** Rewrite README with project overview, setup instructions, architecture diagram
- **Files to change:** `README.md`

---

## 📊 SUMMARY BY PRIORITY

| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 7 | Must fix immediately (security, broken features) |
| 🟠 High | 13 | Fix soon (missing features, poor UX) |
| 🟡 Medium | 29 | Improve when possible (optimization, hardcoding) |
| 🔵 Low | 29 | Nice to have (new features, polish) |
| 🟣 Code Quality | 17 | Maintenance and technical debt |
| **Total** | **87** | |

---

## 🎯 RECOMMENDED ACTION PLAN

### Week 1: Critical Fixes
1. Integrate Stripe for real payments (#1)
2. Make contact form functional (#2)
3. Fix or remove shop page (#3)
4. Protect admin routes in middleware (#4)
5. Add rate limiting (#5)

### Week 2: High Priority
6. Create student dashboard (#8)
7. Add course detail pages (#9)
8. Move membership prices to database (#10)
9. Add duplicate enrollment check (#13)
10. Set up email notifications (#15)

### Week 3-4: Medium Priority
11. Replace `<img>` with Next.js `<Image>` (#17)
12. Add pagination to admin tables (#22)
13. Move hardcoded content to database (#32-39)
14. Add search functionality (#21)
15. Create custom 404 page (#28)

### Month 2: Low Priority & Polish
16. Add dark mode (#40)
17. Implement social login (#42)
18. Add cookie consent (#45)
19. Create privacy/terms pages (#46)
20. Accessibility audit (#47)

### Ongoing: Code Quality
21. Refactor inline styles to Tailwind (#71)
22. Add tests (#76)
23. Set up monitoring (#84)
24. Write proper documentation (#87)

---

## 💡 QUICK WINS (Can Do in 1 Hour)

1. Create `app/not-found.tsx` (custom 404)
2. Add `public/robots.txt`
3. Add Open Graph meta tags to `app/layout.tsx`
4. Create `app/privacy/page.tsx` and `app/terms/page.tsx`
5. Fix broken privacy/terms links in login/register pages
6. Add skip navigation link to layout
7. Enable TypeScript strict mode
8. Add `.prettierrc` config

---

## 📝 NOTES

- This audit was performed by reading source code only, not by testing the live site
- Some issues may already be in progress or planned
- Priorities are subjective — adjust based on business needs
- Consider creating GitHub issues for each item to track progress

---

**Questions?** Check the handover document or reach out to the development team.
