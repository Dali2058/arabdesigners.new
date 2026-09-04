# Arab Designers Cloud Setup

This build uses Supabase for public designer/profile data, likes and views. Public portfolio projects are read-only in the site UI; the Add Work / Upload system has been removed.

## Required SQL

Run these in order:
- `supabase/schema.sql`
- `supabase/migration_views.sql`
- `supabase/migration_admin.sql`

## Edge Function

Deploy `supabase/functions/arab-designers-api/index.ts` as `arab-designers-api`. The function verifies the Discord access token before profile changes, admin verification/staff actions, and likes.

## Website

Upload the contents of `arab-designers-flat` to the website root so `/app.js`, `/cloud-config.js`, `/styles.css` and the route folders are at the root.
