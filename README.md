# Arab Designers

Premium black/blue creative network for designer profiles and selected work.

- Discord login with persistent browser session
- Designer profiles with Discord avatar/banner (both are read-only, always synced from Discord)
- Editable display name + bio only, plus optional extra platform links (Behance, Dribbble, website, etc.)
- Auto-detected social badges (YouTube, X/Twitter, Twitch, Instagram, TikTok, GitHub, Spotify, Reddit, Steam, Facebook) pulled from the visitor's public Discord "Connections" — no manual setup needed
- Verified, Staff, Early Supporter, Booster and Partner badges — each rendered as a small image icon next to the designer's name (profile, directory cards, admin panel)
- Read-only portfolio/designers experience
- Discord-only contact workflow: visitors must sign in with Discord to message the team; messages are posted to Discord under the sender's own Discord identity (name + avatar) — no email field
- Profiles are stored in Supabase (cloud), so they persist across restarts/deploys
- Responsive glass UI and full-screen hero

The public Add Work / Upload / Edit / Remove project system is intentionally disabled in this build.

## Database setup
Run `supabase/schema.sql` first (if not already applied), then `supabase/migration_connections_and_badges.sql`
to add the `connections` column (auto-detected social badges) and the `badges` column (Early
Supporter / Booster / Partner, toggled from the admin panel). Redeploy the `arab-designers-api`
Edge Function (`supabase/functions/arab-designers-api/index.ts`) afterwards.
