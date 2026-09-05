# Arab Designers

Premium black/blue creative network for designer profiles and selected work.

- Discord login with persistent browser session
- Designer profiles with Discord avatar/banner (both are read-only, always synced from Discord)
- Editable display name + bio only, plus optional extra platform links (Behance, Dribbble, website, etc.)
- Auto-detected social badges (YouTube, X/Twitter, Twitch, Instagram, TikTok, GitHub, Spotify, Reddit, Steam, Facebook) pulled from the visitor's public Discord "Connections" — no manual setup needed
- Verified, Staff, Early Supporter, Booster and Partner badges — each rendered as a small image icon next to the designer's name (profile, directory cards, admin panel)
- Discord-only contact workflow: visitors must sign in with Discord to message the team; messages are posted to Discord under the sender's own Discord identity (name + avatar) — no email field
- Profiles are stored in Supabase (cloud), so they persist across restarts/deploys
- Responsive glass UI and full-screen hero
- Each signed-in designer can publish work to their own profile only: images, GIFs, videos, or an
  embed link (YouTube/Vimeo/CodePen/Figma/etc). Work can be reordered, edited, and deleted by its
  owner (or the admin account).
- Every published work has view counts, likes (sign-in required), and its own comment thread
  (sign-in required to comment or like — anyone can read).
- Profile pages also track a view counter (visits from the profile owner itself don't count).

## Database setup
Run `supabase/schema.sql` first (if not already applied), then, in this order:
1. `supabase/migration_admin.sql`
2. `supabase/migration_connections_and_badges.sql` (adds `connections` + `badges` columns)
3. `supabase/migration_views.sql` (per-work view counter function)
4. `supabase/migration_works_uploads.sql` (embeds, work descriptions/ordering, comments table,
   profile view counter)

Redeploy the `arab-designers-api` Edge Function (`supabase/functions/arab-designers-api/index.ts`)
after applying `migration_works_uploads.sql` — it adds the new actions the upload/comment UI calls
(`work-upload-url`, `create-work`, `update-work`, `delete-work`, `reorder-works`, `add-comment`,
`delete-comment`, `liked-works`, `view-profile`).
