const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,HEAD,OPTIONS',
  'cache-control': 'public, max-age=300, s-maxage=300',
};

function esc(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeUrl(value = '') {
  try { const u = new URL(value); if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString(); } catch {}
  return '';
}
function getProfileUsername(pathname) {
  const m = pathname.match(/^\/profile\/([^/?#]+)\/?$/i);
  return m ? decodeURIComponent(m[1]) : '';
}
function getWorkPath(pathname) {
  const m = pathname.match(/^\/works\/([^/?#]+)\/([^/?#]+)\/?$/i);
  return m ? { username: decodeURIComponent(m[1]), id: decodeURIComponent(m[2]) } : null;
}
function supabaseHeaders(env) {
  return { apikey: env.SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`, Accept: 'application/json' };
}
async function getProfile(env, username) {
  const base = String(env.SUPABASE_URL || '').replace(/\/$/, '');
  if (!base || !env.SUPABASE_PUBLISHABLE_KEY) return null;
  const url = `${base}/rest/v1/profiles?select=id,username,display_name,avatar,banner,discord_banner,verified,role,bio&username=eq.${encodeURIComponent(username)}&limit=1`;
  const r = await fetch(url, { headers: supabaseHeaders(env) });
  if (!r.ok) return null;
  const rows = await r.json(); return rows?.[0] || null;
}
async function getWork(env, username, id) {
  const base = String(env.SUPABASE_URL || '').replace(/\/$/, '');
  if (!base || !env.SUPABASE_PUBLISHABLE_KEY) return null;
  const workUrl = `${base}/rest/v1/works?select=id,title,description,media_url,media_type,profile_id,created_at&id=eq.${encodeURIComponent(id)}&limit=1`;
  const r = await fetch(workUrl, { headers: supabaseHeaders(env) });
  if (!r.ok) return null;
  const rows = await r.json(); const work = rows?.[0]; if (!work) return null;
  const profile = await getProfile(env, username);
  if (profile && work.profile_id !== profile.id) return null;
  return { work, profile };
}
function makeProfileOg(request, profile) {
  const origin = new URL(request.url).origin;
  const name = profile?.display_name || profile?.username || 'Arab Designers';
  const username = profile?.username || 'designer';
  const banner = safeUrl(profile?.banner || profile?.discord_banner || '');
  const avatar = safeUrl(profile?.avatar || '');
  const fixedImage = 'https://i.postimg.cc/TY4WQrHN/fffac.png';
  const bg = banner ? `<image href="${esc(banner)}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>` : `<rect width="1200" height="630" fill="#05070b"/>`;
  const avatarMarkup = avatar ? `<defs><clipPath id="avatarClip"><circle cx="110" cy="485" r="62"/></clipPath></defs><image href="${esc(avatar)}" x="48" y="423" width="124" height="124" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)"/><circle cx="110" cy="485" r="64" fill="none" stroke="#fff" stroke-opacity=".95" stroke-width="5"/>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><image href="${fixedImage}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/><rect width="1200" height="630" fill="#000" fill-opacity=".08"/>${avatarMarkup}<text x="48" y="570" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="38" font-weight="800">${esc(name)} - Profile</text><text x="48" y="606" fill="#d7d9e1" font-family="Inter,Arial,sans-serif" font-size="20">@${esc(username)}</text></svg>`;
}
function injectProfileMeta(html, request, profile) {
  const url = new URL(request.url); const username = profile?.username || getProfileUsername(url.pathname) || 'designer'; const name = profile?.display_name || username; const image = 'https://i.postimg.cc/TY4WQrHN/fffac.png'; const profileUrl = `${url.origin}/profile/${encodeURIComponent(username)}`; const title = `${name} - Profile`;
  const tags = `<meta name="description" content="${esc(`Profile of ${name} on Arab Designers`)}"><meta property="og:type" content="profile"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(`Profile of ${name} on Arab Designers`)}"><meta property="og:url" content="${esc(profileUrl)}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(`Profile of ${name} on Arab Designers`)}"><meta name="twitter:image" content="${image}">`;
  html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(title)}</title>`).replace(/<meta\s+name=["']description["'][^>]*>/gi,'').replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi,'').replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi,'');
  return /<head[^>]*>/i.test(html)?html.replace(/<head[^>]*>/i,m=>`${m}${tags}`):html;
}
function injectWorkMeta(html, request, data) {
  const url = new URL(request.url); const work=data?.work||{}; const profile=data?.profile||{}; const name=profile.display_name||profile.username||'Arab Designers'; const title=`${work.title||'Project'} - ${name}`; const image=safeUrl(work.media_url)||'https://i.postimg.cc/FFT9tnKW/banner.png'; const workUrl=url.toString(); const desc=(work.description||`Project by ${name}`).replace(/\s+/g,' ').slice(0,160);
  const tags=`<meta name="description" content="${esc(desc)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(workUrl)}"><meta property="og:image" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(image)}">`;
  html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(title)}</title>`).replace(/<meta\s+name=["']description["'][^>]*>/gi,'').replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi,'').replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi,'');
  return /<head[^>]*>/i.test(html)?html.replace(/<head[^>]*>/i,m=>`${m}${tags}`):html;
}
async function proxy(request, env, metaFn) {
  const origin=String(env.ORIGIN_URL||'').replace(/\/$/,''); if(!origin)return new Response('ORIGIN_URL is not configured.',{status:500,headers:CORS});
  const url=new URL(request.url); const target=new URL(url.pathname+url.search,origin); const upstream=await fetch(new Request(target.toString(),request)); const type=upstream.headers.get('content-type')||'';
  if(type.includes('text/html')&&metaFn){const html=await upstream.text();return new Response(await metaFn(html),{status:upstream.status,headers:{...Object.fromEntries(upstream.headers),'content-type':'text/html; charset=UTF-8','cache-control':'public, max-age=60, s-maxage=300'}})}
  return upstream;
}
export default {async fetch(request,env){
  if(request.method==='OPTIONS')return new Response('',{headers:CORS});
  const url=new URL(request.url); const profileUsername=getProfileUsername(url.pathname); const workPath=getWorkPath(url.pathname);
  if(url.pathname.startsWith('/_og/profile/')&&url.pathname.toLowerCase().endsWith('.svg')){const raw=url.pathname.split('/').pop().replace(/\.svg$/i,'');const profile=await getProfile(env,decodeURIComponent(raw));return new Response(makeProfileOg(request,profile||{username:decodeURIComponent(raw)}),{headers:{...CORS,'content-type':'image/svg+xml; charset=UTF-8','cache-control':'public, max-age=300, s-maxage=600'}})}
  if(profileUsername){const profile=await getProfile(env,profileUsername);return proxy(request,env,html=>injectProfileMeta(html,request,profile||{username:profileUsername}));}
  if(workPath){const data=await getWork(env,workPath.username,workPath.id);return proxy(request,env,html=>injectWorkMeta(html,request,data));}
  return proxy(request,env,null);
}};
