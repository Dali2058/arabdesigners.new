# Dynamic Discord profile previews

The browser profile page is fully dynamic, but GitHub Pages cannot execute JavaScript when Discord crawls a shared URL. That means a single static `/profile/<username>` page cannot produce a different Open Graph image for every designer.

The included site now updates the browser's title/OG metadata and renders a polished share card on the profile page. For truly dynamic Discord previews for arbitrary usernames, the domain must pass `/profile/*` through a server/edge worker that reads the profile and returns HTML with that profile's `og:image`.

Do not put Discord bot tokens or Supabase secret keys in this file or in the GitHub Pages frontend.
