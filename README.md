# Arab Designers

Production-oriented Discord-authenticated social platform starter for Arab designers.

## Routes
- `/` and `/home` — landing/feed
- `/login` — Discord OAuth2
- `/discover` — visual design feed
- `/profile/:username` — profile
- `/contact` — contact requests + Discord webhook embed
- `/settings` — account settings placeholder
- `/admin` — server-protected admin panel
- `/api/auth/discord/callback` — OAuth callback

## Deployment
1. Create a PostgreSQL database and run `schema.sql`.
2. Copy `.env.example` to your deployment environment and fill the secrets.
3. Deploy this repository to Vercel or another Node-compatible host.
4. In Discord Developer Portal, add the exact value of `DISCORD_REDIRECT_URI` under OAuth2 Redirects.
5. Keep `DISCORD_CLIENT_SECRET`, `DISCORD_WEBHOOK_URL`, `DISCORD_BOT_TOKEN`, and `DATABASE_URL` server-side only.

### Important domain note
The requested domain is currently written as `http://arabdesigners.ddns.net`. For a public Discord OAuth flow, use an HTTPS URL in production (for example `https://arabdesigners.ddns.net`) and set the exact HTTPS callback in Discord. The app itself already uses `/api/auth/discord/callback`.

### Discord embed
Contact requests are sent as a Discord webhook embed with the title **Arab Designers** and the supplied banner image URL. Discord supports webhook embeds with titles, images, fields and timestamps.

## Discord bot login embed
The `discord-bot/` folder contains a small Discord.js bot. It registers `/login` and responds with an **Arab Designers** embed, the supplied banner image, and a **Login with Discord** button pointing to `/login`.

Run from `discord-bot/` with `DISCORD_BOT_TOKEN` and `DISCORD_CLIENT_ID` set, then run `node register-command.js` once and `node bot.js` continuously.
