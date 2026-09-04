# Arab Designers — GitHub Pages flat build

All website files are in the repository root; there are no required website subfolders.

## Clean URLs
GitHub Pages serves `404.html`, which lets the same app render paths such as:
- `/home`
- `/discover`
- `/designers`
- `/contact`
- `/settings`
- `/profile/i.ixi.`

The normal `.html` pages are also available.

## Discord login
This GitHub-only build uses Discord's browser-friendly implicit OAuth flow so it does not expose a client secret. The token is kept in `sessionStorage` only.

For a production database, secure sessions, guild membership checks, uploads, admin authorization, and Discord webhook delivery, a server/serverless backend is still required. GitHub Pages itself is static hosting and cannot run the Node API routes from the previous build.
