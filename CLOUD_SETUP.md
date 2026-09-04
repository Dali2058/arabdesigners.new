# Arab Designers — Cloud setup (Supabase)

This build no longer stores portfolio projects in browser IndexedDB/localStorage. Published projects, profile data, likes and views are stored in Supabase Postgres + Storage.

## 1. Create a Supabase project

Create a project at https://supabase.com/dashboard.

## 2. Create the database + bucket

Open **SQL Editor** and run, in order:

1. `supabase/schema.sql`
2. `supabase/migration_views.sql`

The SQL creates:
- `profiles`
- `works`
- `work_likes`
- public `works` Storage bucket (30 MB max)
- read-only public policies
- the secure `increment_work_view()` function

The browser only gets public/read access. Mutations go through the Edge Function.

## 3. Deploy the Edge Function

Install/login to the Supabase CLI, then from this folder run:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy arab-designers-api --no-verify-jwt
```

The included `supabase/config.toml` already sets `verify_jwt = false` because this function verifies the Discord OAuth token itself.

Supabase automatically provides the project URL and server secret keys to Edge Functions. Never put the secret/service-role key in `cloud-config.js` or GitHub Pages.

## 4. Configure the website

The included `cloud-config.js` is already filled with the current Project URL and browser-safe publishable key. You do not need to edit it.

The current build is preconfigured for the project. If you ever move to another Supabase project, change the values in `cloud-config.js`.

Use the project's **publishable key** (or legacy anon key), never the secret/service-role key.

## 5. GitHub Pages

Upload/commit the complete `arab-designers-flat` folder, including:

- `cloud-config.js`
- `app.js`
- `styles.css`
- all HTML files
- `supabase/schema.sql`
- `supabase/migration_views.sql`
- `supabase/config.toml`
- `supabase/functions/arab-designers-api/index.ts`

## 6. Discord login

Keep the existing Discord OAuth application settings used by the site. After login, the browser sends the Discord access token to the Edge Function. The function verifies it directly with Discord before it can create/update a profile, upload authorization, publish/edit/delete a project, or like a project.

## 7. What is now cloud-persistent

- Designer profiles
- Discord avatar/banner metadata
- Project records
- Original uploaded image/GIF/video files
- Views
- Likes
- Project deletion and replacement

A visitor on another device will see the same published projects.

## 8. File limits

The UI accepts PNG/JPG/WEBP/GIF/MP4/WEBM/MOV up to 30 MB. Supabase Storage is configured with the same 30 MB limit.
