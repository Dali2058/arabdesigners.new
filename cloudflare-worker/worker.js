const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,HEAD,OPTIONS',
  'cache-control': 'public, max-age=300, s-maxage=300',
};

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(value = '') {
  try {
    const u = new URL(value);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString();
  } catch {}
  return '';
}

function getUsername(pathname) {
  const m = pathname.match(/^\/profile\/([^/?#]+)\/?$/i);
  return m ? decodeURIComponent(m[1]) : '';
}

function supabaseHeaders(env) {
  return {
    apikey: env.SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`,
    Accept: 'application/json',
  };
}

async function getProfile(env, username) {
  const base = String(env.SUPABASE_URL || '').replace(/\/$/, '');
  if (!base || !env.SUPABASE_PUBLISHABLE_KEY) return null;
  const url = `${base}/rest/v1/profiles?select=username,display_name,avatar,banner,discord_banner,verified,role&username=eq.${encodeURIComponent(username)}&limit=1`;
  const r = await fetch(url, { headers: supabaseHeaders(env) });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows?.[0] || null;
}

function makeOgSvg(request, env, profile) {
  const origin = new URL(request.url).origin;
  const name = profile?.display_name || profile?.username || 'Arab Designers';
  const username = profile?.username || 'designer';
  const banner = safeUrl(profile?.banner || profile?.discord_banner || '');
  const avatar = safeUrl(profile?.avatar || '');
  const logo = safeUrl(`${origin}/logo-transparent.png`);
  const verified = !!profile?.verified;
  const staff = profile?.role === 'staff' || profile?.role === 'admin';

  const bg = banner
    ? `<image href="${esc(banner)}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect width="1200" height="630" fill="#05070b"/>`;

  const avatarMarkup = avatar
    ? `<defs><clipPath id="avatarClip"><circle cx="110" cy="485" r="62"/></clipPath></defs><image href="${esc(avatar)}" x="48" y="423" width="124" height="124" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)"/><circle cx="110" cy="485" r="64" fill="none" stroke="#ffffff" stroke-opacity=".95" stroke-width="5"/>`
    : `<circle cx="110" cy="485" r="64" fill="#0b1018" stroke="#ffffff" stroke-opacity=".95" stroke-width="5"/>`;

  const badge = verified
    ? `<g transform="translate(530 442)"><circle cx="18" cy="18" r="18" fill="#2d7dff"/><path d="M10 18.5l5 5 10-12" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`
    : '';
  const staffBadge = staff
    ? `<g transform="translate(${verified ? 575 : 530} 442)"><circle cx="18" cy="18" r="18" fill="#111a28" stroke="#5b8cff"/><path d="M18 8l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12v-6l9-4z" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M13 18l3 3 6-7" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  ${bg}
  <rect width="1200" height="630" fill="#000" fill-opacity=".42"/>
  <rect x="0" y="380" width="1200" height="250" fill="#000" fill-opacity=".78"/>
  ${avatarMarkup}
  <text x="205" y="462" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="46" font-weight="800">${esc(name)}</text>
  ${badge}${staffBadge}
  <text x="205" y="505" fill="#c7d2e5" font-family="Inter,Arial,sans-serif" font-size="24">@${esc(username)}</text>
  <text x="48" y="590" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="21" font-weight="700">Powered by Arab Designers</text>
  ${logo ? `<image href="${esc(logo)}" x="330" y="558" width="54" height="54" preserveAspectRatio="xMidYMid contain"/>` : ''}
  <text x="1150" y="590" text-anchor="end" fill="#9db8ff" font-family="Inter,Arial,sans-serif" font-size="18">ARAB DESIGNERS</text>
</svg>`;
}

function injectMeta(html, request, profile) {
  const url = new URL(request.url);
  const username = profile?.username || getUsername(url.pathname) || 'designer';
  const name = profile?.display_name || username;
  const image = `${url.origin}/_og/profile/${encodeURIComponent(username)}.svg`;
  const profileUrl = `${url.origin}/profile/${encodeURIComponent(username)}`;
  const title = `${name} — Arab Designers`;
  const description = `@${username} on Arab Designers${profile?.verified ? ' · Verified designer' : ''}${profile?.role === 'staff' || profile?.role === 'admin' ? ' · Staff' : ''}`;
  const tags = `
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(profileUrl)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">`;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');
  if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, m => `${m}${tags}`);
  return html;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response('', { headers: CORS });

    const url = new URL(request.url);
    const username = getUsername(url.pathname);

    if (url.pathname.startsWith('/_og/profile/') && url.pathname.toLowerCase().endsWith('.svg')) {
      const raw = url.pathname.split('/').pop().replace(/\.svg$/i, '');
      const profile = await getProfile(env, decodeURIComponent(raw));
      const svg = makeOgSvg(request, env, profile || { username: decodeURIComponent(raw) });
      return new Response(svg, {
        status: 200,
        headers: { ...CORS, 'content-type': 'image/svg+xml; charset=UTF-8', 'cache-control': 'public, max-age=300, s-maxage=600' },
      });
    }

    if (username) {
      const profile = await getProfile(env, username);
      const origin = String(env.ORIGIN_URL || '').replace(/\/$/, '');
      if (!origin) return new Response('ORIGIN_URL is not configured.', { status: 500, headers: CORS });
      const target = new URL(url.pathname + url.search, origin);
      const upstream = await fetch(new Request(target.toString(), request));
      const type = upstream.headers.get('content-type') || '';
      if (type.includes('text/html')) {
        const html = await upstream.text();
        const out = injectMeta(html, request, profile || { username });
        return new Response(out, {
          status: upstream.status,
          headers: { ...Object.fromEntries(upstream.headers), 'content-type': 'text/html; charset=UTF-8', 'cache-control': 'public, max-age=60, s-maxage=300' },
        });
      }
      return upstream;
    }

    const origin = String(env.ORIGIN_URL || '').replace(/\/$/, '');
    if (!origin) return new Response('ORIGIN_URL is not configured.', { status: 500, headers: CORS });
    const target = new URL(url.pathname + url.search, origin);
    return fetch(new Request(target.toString(), request));
  },
};
