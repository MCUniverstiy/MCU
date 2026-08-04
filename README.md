This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Work in a branch and open a pull request against `master` when your changes are ready for review.

## Membership tier CMS

Membership tier fields, the Supabase migration, and admin editing instructions are documented in [`MEMBERSHIP-TIERS-SETUP.md`](./MEMBERSHIP-TIERS-SETUP.md). Run [`supabase/membership-cms.sql`](./supabase/membership-cms.sql) in the Supabase SQL Editor before using **Admin → Content Manager → Membership tiers**.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Instructor CMS

Manage the teaching team under **Admin → Content Manager → Instructors** (names, specialisations, bios and profile photos), then assign an instructor to each course via the Instructor dropdown in **Admin → Content Manager → Courses**. The assigned instructor's name appears on the public `/courses` page.

**No extra database migration is required.** The `instructors` table and the `courses.instructorid` column ship in [`supabase/RUN-THIS-IN-SUPABASE.sql`](./supabase/RUN-THIS-IN-SUPABASE.sql), and the `bio` / `photo_url` columns plus the admin policies ship in [`supabase/cms.sql`](./supabase/cms.sql) — both already required by the shop/courses CMS. If you see a "column does not exist" error in the admin pages, run `supabase/cms.sql` once in the Supabase SQL Editor; it is safe to re-run.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
