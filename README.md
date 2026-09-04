# Arab Designers — premium static portfolio/community

## What changed
- Rebuilt the visual system around a large immersive hero, glass navigation, editorial typography, gradients, subtle motion and responsive layouts.
- Fixed profile header layering: the Discord banner stays inside its own cover area and the avatar/name section sits below it, so nothing is hidden.
- Discord login keeps the real Discord avatar/banner. If the account has no Discord banner, the profile cover stays black.
- Added project presentation cards with owner avatar/name, media type, views and likes. Clicking a project opens a full project modal.
- Added local creator project manager with image/GIF/video upload, drag & drop, live preview, edit, replace and remove.
- Contact form sends directly to the configured Discord webhook.

## Important static-hosting note
This is still a GitHub Pages/static site. Uploaded project files are stored in IndexedDB in the browser that uploaded them; they are not a shared cloud media store. For truly global publishing across devices, connect a storage/backend (Cloudinary, Supabase, Firebase, etc.) later.

The direct Discord webhook is intentionally present in `app.js` because the requested setup uses a direct client-side webhook. Discord webhooks post into the channel they are configured for; the channel ID in the embed is informational. If the webhook URL is ever exposed publicly, rotate it in Discord and replace it in `app.js`.
