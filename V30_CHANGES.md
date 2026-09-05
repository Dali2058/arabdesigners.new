# Arab Designers v30

## Fixed
- Project viewer close button now works reliably on Works and Profile pages.
- Clicking outside the project viewer and pressing Escape also closes it.
- Body scroll is locked while the viewer is open.
- Every time a project is opened, `view-work` increments the global view counter by 1. The updated count is also reflected on visible project cards.
- Long project titles/text now wrap instead of overlapping.

## Profile social links
- Profile social links are icon-only (YouTube, Instagram, X, TikTok, GitHub, Twitch, LinkedIn, Behance, Dribbble, Spotify, Facebook, Reddit, Steam, etc.).
- Clicking an icon opens the saved link in a new tab.
- Platform names are available through tooltip/accessible labels, but are not displayed beside the icon.

## Publishing / images
- Selecting an image no longer crops it immediately.
- Images remain untouched while building the project.
- When the user presses Publish, the cover and every image block are cropped one-by-one.
- Crop UI lets the designer choose the displayed aspect ratio and shows the exact output dimensions:
  - Wide 16:9
  - Landscape 3:2
  - Square 1:1
  - Portrait 4:5
- Full-width images use 1600px output width; half-width images use 800px output width.
- The published image keeps its chosen aspect ratio instead of being forced into a fixed 16:9 box.
- Mobile crop/viewer/publish layouts are responsive.

No new Supabase migration is required for these v30 changes.
