# Eyad Mohamed — Arab Designers

Updated portfolio-style GitHub Pages build with:
- New banner hero using `https://i.postimg.cc/FFT9tnKW/banner.png`
- About page inspired by the supplied reference layout
- Eyad Mohamed profile image using `https://i.postimg.cc/k4MbT9WC/Chat-GPT-Image-Aug-25-2026-07-14-26-PM.png`
- 2018–2026 creative timeline and studio/creative experience copy
- Responsive mobile layout
- Refined Discover, Designers, Profile, Settings and Contact pages
- Open Graph banner metadata so shared links use the requested banner image
- Contact form prepared for a secure Discord webhook proxy

## Discord webhook security

Do **not** put the Discord webhook URL/token directly in frontend JavaScript or GitHub Pages. Anyone can inspect it and send arbitrary messages through it.

The contact form sends requests to `window.DISCORD_TICKET_PROXY_URL` when that value is configured. Deploy `webhook-proxy.example.js` as a private serverless endpoint and store the real webhook URL in an environment/secret variable named `DISCORD_WEBHOOK_URL`.

The requested Discord channel/room ID is kept in `app.js` as `1535541262998831124` and is sent as metadata to the proxy.

Example frontend config before `app.js`:

```html
<script>window.DISCORD_TICKET_PROXY_URL='https://your-private-proxy.example.workers.dev';</script>
<script src="/app.js"></script>
```

If the webhook URL pasted into a public chat/repository is currently active, rotate it in Discord before using the site in production.


## Portfolio media editor
- Discord profile banner is synced after OAuth when Discord provides one; otherwise the profile banner remains black.
- Portfolio work supports images, GIFs, and videos with a live preview before publishing.
- Existing work can be edited, replaced, or removed.
- Media files are kept in IndexedDB so larger video files do not get packed into localStorage.
- The public site never contains the Discord webhook secret; contact delivery uses the private proxy URL configured through `window.DISCORD_TICKET_PROXY_URL`.
