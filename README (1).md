# Arab Designers — Cloudflare profile preview Worker

This Worker makes `/profile/<username>` return per-profile Open Graph metadata for Discord and also serves a generated profile preview image at `/_og/profile/<username>.svg`.

The preview uses:
- Discord avatar from Supabase profile data
- Discord banner / profile banner as the background
- Display name and `@username`
- Verified badge when `verified=true`
- Staff shield when `role=staff` or `role=admin`
- “Powered by Arab Designers” and the site logo
- Black background when no banner exists

## Required variables

- `ORIGIN_URL`: the real GitHub Pages origin that should receive the normal site request. Do NOT set this to the Worker hostname or the same hostname being routed through this Worker, or you will create a loop.
- `SUPABASE_URL`: already filled in.
- `SUPABASE_PUBLISHABLE_KEY`: already filled in.

## Important limitation

The Worker code is ready, but the existing `arabdesigners.ddns.net` hostname can only use this Worker if that hostname is in a Cloudflare zone you control / can route through Cloudflare. Cloudflare Custom Domains require an active Cloudflare zone you own. Routes require a Cloudflare-proxied DNS record.

If `arabdesigners.ddns.net` is a hostname supplied by a DDNS provider and you do not control the `ddns.net` zone, Cloudflare will not let you attach a Custom Domain directly to it.

## Dashboard setup

1. Workers & Pages → your Worker → Edit Code.
2. Paste `worker.js`.
3. Settings → Variables and Secrets.
4. Add `ORIGIN_URL` with your GitHub Pages origin.
5. Keep the Supabase values from `wrangler.toml`.
6. Deploy.
7. Only after the hostname is routed to the Worker, test:
   `/profile/i.ixi.`
   and
   `/_og/profile/i.ixi..svg`

Once routing is correct, Discord will fetch the HTML from the Worker and see a different `og:image` for every profile URL.
