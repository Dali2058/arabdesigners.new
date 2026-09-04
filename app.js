const app = document.getElementById('app');
const toast = document.getElementById('toast');

const LOGO = '/logo-transparent.png';
const FALLBACK_LOGO = '/logo.png';
const BANNER = 'https://i.postimg.cc/FFT9tnKW/banner.png';
const EYAD = 'https://i.postimg.cc/k4MbT9WC/Chat-GPT-Image-Aug-25-2026-07-14-26-PM.png';
const CLIENT_ID = '1540364880174125068';
const REDIRECT_URI = 'https://arabdesigners.ddns.net/api/auth/discord/callback';
const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify%20email%20guilds%20guilds.join%20connections`;

// Direct Discord webhook requested for contact/ticket notifications.
// NOTE: a webhook URL embedded in a public GitHub Pages site is public by design.
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1540398522908811427/EfjMbFyPVWQbGUV_e3okKTZIrGazoD43E9d59dEvibwug8Hp53v3gkO83q9zd8NUQAIu';
const TICKET_CHANNEL_ID = '1535541262998831124';
const BRAND_BLUE = '#5b8cff';

const ME_KEY = 'ad_me';
const TOKEN_KEY = 'discord_token';
const ADMIN_USERNAME = 'i.ixi.';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `w_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const getMe = () => { try { return JSON.parse(localStorage.getItem(ME_KEY) || sessionStorage.getItem(ME_KEY) || 'null'); } catch { return null; } };
const getToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || '';
const isAdmin = () => !!me && (me.role === 'admin' || me.username === ADMIN_USERNAME);
let me = getMe();

function notify(message){
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function saveMe(user){ me = user; localStorage.setItem(ME_KEY, JSON.stringify(user)); }
function saveToken(token){ if(token) localStorage.setItem(TOKEN_KEY, token); }
function logout(){ localStorage.removeItem(ME_KEY); localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(ME_KEY); sessionStorage.removeItem(TOKEN_KEY); location.href='/home.html'; }
function bannerUrl(u){
  if(!u?.banner) return '';
  const ext = String(u.banner).startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/banners/${u.id}/${u.banner}.${ext}?size=2048`;
}
function avatarUrl(u){
  if(!u?.avatar) return FALLBACK_LOGO;
  const ext = String(u.avatar).startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=256`;
}
function formatNumber(n){ return Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(Math.max(0, Number(n)||0)); }
function timeAgo(ts){
  if(!ts) return 'Recently';
  const sec = Math.max(1, Math.floor((Date.now()-ts)/1000));
  if(sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec/60); if(min < 60) return `${min}m ago`;
  const hr = Math.floor(min/60); if(hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr/24); return `${day}d ago`;
}
function profileBanner(d){ return d?.banner || d?.discordBanner || ''; }
function safeImage(url, fallback=FALLBACK_LOGO){ return url || fallback; }

function nav(){
  const profile = me ? `/profile/${encodeURIComponent(me.username)}` : '/login';
  const mobileAuth = me ? `<a class="mobile-only" href="${profile}">My profile ↗</a><a class="mobile-only" href="/settings">Settings</a>${isAdmin()?'<a class="mobile-only admin-nav-link" href="/admin">Admin ↗</a>':''}` : `<a class="mobile-only" href="/login.html">Sign in with Discord ↗</a>`;
  return `<header class="topbar">
    <a class="brand" href="/home.html" aria-label="Arab Designers home">
      <span class="brand-mark"><img src="${LOGO}" onerror="this.src='${FALLBACK_LOGO}'" alt=""></span>
      <span><strong>Arab Designers</strong><small>Creative network</small></span>
    </a>
    <nav class="navlinks">
      <a href="/home">Home</a><a href="/designers">Designers</a><a href="/about">About</a><a href="/contact">Contact</a>${isAdmin()?'<a class="admin-nav-link" href="/admin">Admin</a>':''}${mobileAuth}
    </nav>
    <div class="nav-right">
      <label class="search-wrap"><span>⌕</span><input id="globalSearch" placeholder="Search work or designers"></label>
      ${me ? `<a class="profile-chip" href="${profile}"><img src="${esc(me.avatar||FALLBACK_LOGO)}" alt=""><span>${esc(me.display_name||me.username)}</span></a>` : `<a class="btn primary nav-login" href="/login.html"><span class="login-full">Sign in with Discord</span><span class="login-short">Login</span></a>`}
      <button class="icon-btn menu-trigger" id="menuBtn" aria-label="Menu">☰</button>
    </div>
  </header>`;
}
function footer(){
  return `<footer class="footer"><div class="footer-main"><div><div class="footer-brand"><span class="brand-mark"><img src="${LOGO}" onerror="this.src='${FALLBACK_LOGO}'" alt=""></span><strong>Arab Designers</strong></div><p>A premium space for Arabic creatives, profiles and creative talent.</p></div><div><b>Explore</b><a href="/designers">Designers</a><a href="/about">About</a><a href="/contact">Contact</a></div><div><b>Studio</b><a href="/contact">Start a project</a><a href="/settings">Creator settings</a>${isAdmin()?'<a href="/admin">Admin panel</a>':''}<a href="/login.html">Join community</a></div></div><div class="footer-bottom"><span>© 2026 Arab Designers</span><span>Built for people who care about the details.</span></div></footer>`;
}
function shell(content){
  document.body.classList.remove('home-active');
  app.innerHTML = nav() + `<main class="page">${content}</main>` + footer();
  const search = document.getElementById('globalSearch');
  search?.addEventListener('keydown', e => { if(e.key === 'Enter' && e.target.value.trim()) location.href = '/designers.html?q=' + encodeURIComponent(e.target.value.trim()); });
  document.getElementById('menuBtn')?.addEventListener('click', () => document.querySelector('.navlinks')?.classList.toggle('open'));
}

async function home(){
  document.body.classList.add('home-active');
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e);}
  const profiles = Object.values(readProfiles());
  shell(`<section class="hero-stage">
    <div class="hero-bg" style="background-image:url('${BANNER}')"></div><div class="hero-noise"></div><div class="hero-grid"></div>
    <div class="hero-copy">
      <div class="kicker"><span class="live-dot"></span> Arab Designers · 2026</div>
      <h1>Where ideas become <em>visuals.</em></h1>
      <p>Discover designers, creative direction and visual talent from across the Arab world.</p>
      <div class="actions"><a class="btn primary xl" href="/designers">Meet the designers ↗</a><a class="btn ghost xl" href="/about">About Arab Designers</a></div>
      <div class="hero-trust"><span>${formatNumber(profiles.length)} designers</span><span>Visual identity</span><span>UI/UX</span><span>Creative direction</span></div>
    </div>
    <div class="hero-floating hero-card-a"><span>ARAB DESIGNERS</span><strong>People<br>with direction.</strong><i>↗</i></div>
    <div class="hero-floating hero-card-b"><span>COMMUNITY</span><strong>${profiles.length ? formatNumber(profiles.length) : '—'}<small> designers</small></strong><div class="mini-stack"><span></span><span></span><span></span></div></div>
    <div class="scroll-cue"><span>Scroll to explore</span><i>↓</i></div>
  </section>
  <section class="cloud-status" id="cloudStatus"><span class="status-dot"></span><span>Designer profiles are synced from the cloud.</span></section>
  <section class="section intro-section"><div class="section-label">THE PLATFORM</div><div class="intro-grid"><h2>A sharper home for<br><span>Arab creative talent.</span></h2><div><p>Arab Designers is built around the people behind the work — with public profiles, clear identities and a direct way to discover and contact designers.</p><a class="text-link" href="/designers">Browse the directory →</a></div></div></section>
  <section class="section home-cta"><div><div class="section-label">JOIN THE NETWORK</div><h2>Put your name<br><span>on the directory.</span></h2><p>Sign in with Discord and your designer profile will be created in the cloud and appear automatically on the Designers page.</p></div><a class="btn primary xl" href="/login.html">Create your profile ↗</a></section>`);
  document.body.classList.add('home-active');
}

function about(){
  shell(`<section class="about-hero about-hero-v2"><div><div class="section-label">ABOUT · EYAD MOHAMED</div><h1>Design with<br><span>direction.</span></h1><p>Graphic designer, UI/UX specialist and creative director building visual identities, digital experiences and systems that feel deliberate.</p><div class="about-actions"><a class="btn primary" href="/contact">Work together ↗</a><a class="text-link" href="/designers">Meet the designers →</a></div><div class="about-signature"><span>2018—2026</span><span>Visual identity</span><span>UI/UX</span><span>Creative direction</span></div></div><div class="about-portrait about-portrait-v2"><img src="${EYAD}" alt="Eyad Mohamed"><div class="portrait-overlay"></div><div class="portrait-tag">EYAD MOHAMED<br><small>ARAB DESIGNERS · FOUNDER</small></div></div></section>
  <section class="section story-grid about-story-v2"><div class="section-label">THE APPROACH</div><div><h2>Clear thinking.<br><span>Strong visuals.</span></h2><p>بدأت رحلتي في التصميم عام 2018، ومن وقتها وأنا أشتغل بين الهوية البصرية، المحتوى الرقمي، الواجهات والتجارب المختلفة. اشتغلت مع استوديوهات وفرق إبداعية متعددة، وركزت في كل تجربة على تحويل الفكرة إلى نظام بصري واضح وقابل للاستخدام.</p><p>Today the focus is simple: composition, typography, contrast, motion and digital interaction — all working together instead of competing for attention.</p><div class="about-facts"><div><strong>01</strong><span>Visual identity systems</span></div><div><strong>02</strong><span>Digital & UI/UX experiences</span></div><div><strong>03</strong><span>Creative direction</span></div></div></div></section>
  <section class="section timeline-modern"><div class="section-label">2018 — 2026</div><div class="timeline-list"><article><b>2018</b><div><h3>The beginning</h3><p>تكوين، ألوان، خطوط وهوية بصرية وبناء أساس قوي في التصميم.</p></div></article><article><b>2019—21</b><div><h3>Studio experience</h3><p>عمل مع استوديوهات وفرق إبداعية متعددة على هويات وحملات ومحتوى.</p></div></article><article><b>2022—24</b><div><h3>Identity + digital</h3><p>الأنظمة البصرية، الواجهات، السوشيال وart direction مع اهتمام أكبر بالتفاصيل.</p></div></article><article><b>2025—26</b><div><h3>Design with direction</h3><p>مشاريع وتجارب تجمع الهوية والاستخدام والحركة والوضوح في تجربة واحدة.</p></div></article></div></section>`);
}

function login(){
  app.innerHTML = `<main class="auth-page"><div class="auth-backdrop" style="background-image:url('${BANNER}')"></div><section class="auth-card"><span class="brand-mark huge"><img src="${LOGO}" onerror="this.src='${FALLBACK_LOGO}'" alt=""></span><div class="section-label">ARAB DESIGNERS</div><h1>Build a profile<br>people remember.</h1><p>Connect Discord to bring your avatar and profile banner into your designer page.</p><a class="btn primary xl full" href="${OAUTH_URL}">Continue with Discord <span>↗</span></a><a class="back-link" href="/home.html">← Back to home</a><div class="auth-note">No Discord banner? Your profile uses a clean black header instead of a random placeholder.</div></section></main>`;
}

async function designers(){
  try{await loadCloudState(true);}catch(e){console.warn('Cloud unavailable:',e);}
  const q=new URLSearchParams(location.search).get('q')?.trim().toLowerCase()||'';
  let all=Object.values(readProfiles());
  if(q) all=all.filter(u=>`${u.display_name||''} ${u.username||''} ${u.bio||''}`.toLowerCase().includes(q));
  shell(`<section class="directory-head"><div><div class="section-label">COMMUNITY DIRECTORY</div><h1>Meet the<br><span>designers.</span></h1><p>${q?`Showing profiles matching “${esc(q)}”.`:'Every account that joins Arab Designers gets a public profile here.'}</p></div><div class="directory-stat"><strong>${all.length}</strong><span>${q?'matching profiles':'registered designers'}</span></div></section><section class="section"><div class="directory-toolbar"><div class="directory-search"><span>⌕</span><input id="designerSearch" value="${esc(q)}" placeholder="Search by name or username"></div><span class="directory-hint">Cloud directory · updated automatically</span></div><div class="designer-grid">${all.map((u,i)=>designerCard(u,i)).join('') || `<div class="empty-state wide"><span>✦</span><h3>${q?'No matching profiles.':'No designer profiles yet.'}</h3><p>${q?'Try another name or username.':'Be the first to join the Arab Designers directory.'}</p><a class="btn primary" href="/login.html">Join with Discord ↗</a></div>`}</div></section>`);
  document.getElementById('designerSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter')location.href='/designers.html'+(e.target.value.trim()?'?q='+encodeURIComponent(e.target.value.trim()):'')});
}
function designerCard(u,i){
  const banner=profileBanner(u);
  const badge=u.role==='admin'||u.role==='staff'?'<span class="staff-badge" title="Staff">🛡 Staff</span>':'';
  const verified=u.verified?'<span class="verified-badge" title="Verified">✓</span>':'';
  const tagline=u.bio?esc(String(u.bio).replace(/\s+/g,' ').slice(0,90)):'Designer profile on Arab Designers.';
  return `<a class="designer-card-v2" href="/profile/${encodeURIComponent(u.username)}">
    <div class="dc-banner ${banner?'':'blank'}" ${banner?`style="background-image:url('${esc(banner)}')"`:''}></div>
    <img class="dc-avatar" src="${esc(safeImage(u.avatar))}" alt="">
    <div class="dc-body">
      <div class="dc-name">${esc(u.display_name||u.username)} ${verified}</div>
      <div class="dc-handle">@${esc(u.username)}</div>
      ${badge?`<div class="dc-role">${badge}</div>`:''}
      <p class="dc-tagline">${tagline}</p>
      <div class="dc-stats"><span>${u.verified?'✓ Verified designer':'◉ Community member'}</span><span>${banner?'Discord banner':'Arab Designers'}</span></div>
    </div>
  </a>`;
}

function setMeta(name, content, property=false){
  const attr=property?'property':'name'; let el=document.head.querySelector(`meta[${attr}='${name}']`);
  if(!el){el=document.createElement('meta');el.setAttribute(attr,name);document.head.appendChild(el)} el.setAttribute('content',content||'');
}
function setProfileMeta(d, username){
  const title=`${d?.display_name||username} — Arab Designers`;
  const desc=`${d?.bio||'Designer profile, selected work and creative direction.'}`.replace(/\s+/g,' ').slice(0,160);
  document.title=title; setMeta('description',desc); setMeta('og:title',title,true); setMeta('og:description',desc,true); setMeta('og:site_name','Arab Designers',true); setMeta('og:image',profileBanner(d)||BANNER,true); setMeta('twitter:title',title); setMeta('twitter:description',desc); setMeta('twitter:image',profileBanner(d)||BANNER);
}

async function profile(username){
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e);}
  const target=username || me?.username || 'designer';
  const same=!!(me && me.username===target);
  const profiles=readProfiles();
  let d=profiles[target];
  if(!d){
    d={username:target,display_name:same?(me.display_name||me.username):target,avatar:same?me.avatar:EYAD,banner:same?me.banner:'',discordBanner:same?me.banner:'',bio:'Designer focused on visual identity and digital experiences.',links:[]};
  }
  const banner=profileBanner(d);
  setProfileMeta(d,target);
  shell(`<section class="profile-shell">
    <div class="profile-cover ${banner?'has-banner':'no-banner'}" ${banner?`style="background-image:url('${esc(banner)}')"`:''}><div class="cover-shade"></div><div class="cover-top"><span>${banner?'DISCORD PROFILE BANNER':'NO DISCORD BANNER'}</span>${same?'<span class="cover-safe">PROFILE HEADER</span>':''}</div></div>
    <div class="profile-main"><div class="profile-heading"><img class="profile-avatar-v2" src="${esc(safeImage(d.avatar))}" alt="${esc(d.display_name||d.username)}"><div class="profile-title"><div class="verified-line"><span class="status-dot"></span> Designer profile ${d.verified?'<span class="verified-badge" title="Verified">✓</span>':''} ${d.role==='admin'?'<span class="staff-badge" title="Staff">🛡</span>':''}</div><h1>${esc(d.display_name||d.username)}</h1><p>@${esc(d.username)}</p></div><div class="profile-actions">${same?'<a class="btn" href="/settings">Edit profile</a>':'<a class="btn primary" href="/contact?designer=${encodeURIComponent(target)}">Contact designer ↗</a>'}</div></div>
      <div class="profile-bio"><p>${esc(d.bio||'Designer focused on visual identity and digital experiences.')}</p><div class="profile-pills"><span>Graphic Design</span><span>UI/UX</span><span>Visual Identity</span><span>Creative Direction</span></div></div>
      <div class="profile-stats"><div><strong>2026</strong><span>Member</span></div><div><strong>Discord</strong><span>Connected</span></div><div><strong>${d.verified?'Verified':'Open'}</strong><span>Status</span></div><div><strong>Arab</strong><span>Designers</span></div></div>
    </div></section>`);
}
const CLOUD = window.ARAB_DESIGNERS_CONFIG || {};
const SUPABASE_URL = String(CLOUD.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = String(CLOUD.SUPABASE_ANON_KEY || '');
const SUPABASE_FUNCTION_URL = String(CLOUD.SUPABASE_FUNCTION_URL || (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/arab-designers-api` : ''));
const CLOUD_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY && !/YOUR-PROJECT|YOUR-PUBLISHABLE|YOUR-ANON/i.test(SUPABASE_URL + SUPABASE_ANON_KEY));
let cloudState = { profiles:{} };
let cloudLoaded = false;

function requireCloud(){
  if(!CLOUD_CONFIGURED){
    notify('Cloud is not configured yet. Add your Supabase URL and key in cloud-config.js.');
    throw new Error('Cloud not configured');
  }
}
async function cloudJson(url, options={}){
  requireCloud();
  const headers={'apikey':SUPABASE_ANON_KEY,'Content-Type':'application/json','Accept':'application/json',...(options.headers||{})};
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  let r;
  try{ r=await fetch(url,{...options,headers,signal:controller.signal}); }catch(e){
    if(e?.name==='AbortError') throw new Error('Supabase connection timed out. Check the project URL and publishable key.');
    throw new Error('Could not connect to Supabase. Check the project URL, key, and network.');
  }finally{ clearTimeout(timer); }
  
  if(!r.ok){let msg='Request failed';try{const e=await r.json();msg=e.message||e.error||msg}catch{}throw new Error(msg)}
  return r.status===204?null:r.json();
}
async function cloudCall(action,payload={}){
  requireCloud();
  const token=getToken();
  const headers={'apikey':SUPABASE_ANON_KEY,'Content-Type':'application/json'};
  if(token)headers.Authorization=`Bearer ${token}`;
  const r=await fetch(SUPABASE_FUNCTION_URL,{method:'POST',headers,body:JSON.stringify({action,...payload})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||`Cloud action failed (${r.status})`);
  return data;
}
async function loadCloudState(force=false){
  if(cloudLoaded&&!force)return cloudState;
  requireCloud();
  const profiles=await cloudJson(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=display_name.asc`);
  const map={};
  profiles.forEach(p=>map[p.username]={
    id:p.id,discord_id:p.discord_id,username:p.username,display_name:p.display_name,avatar:p.avatar||FALLBACK_LOGO,
    banner:p.banner||p.discord_banner||'',discordBanner:p.discord_banner||'',bio:p.bio||'',links:p.links||[],verified:!!p.verified,role:p.role||'designer'
  });
  cloudState={profiles:map};
  cloudLoaded=true;return cloudState;
}
function readProfiles(){return cloudState.profiles||{}}
function writeProfiles(){/* Cloud is authoritative. */}
async function refreshAfterMutation(){cloudLoaded=false;await loadCloudState(true);}
async function adminPage(){
  if(!me || !isAdmin()){
    shell(`<section class="auth-card page-access-card"><div class="section-label">ADMIN ACCESS</div><h1>Admin access<br><span>required.</span></h1><p>This area is only available to the Arab Designers admin account.</p><a class="btn primary xl" href="${me?'/home.html':'/login.html'}">${me?'Back to home':'Sign in with Discord'} ↗</a></section>`);
    return;
  }
  try{await loadCloudState(true);}catch(e){console.warn('Cloud unavailable:',e);}
  const profiles=readProfiles();
  const rows=Object.values(profiles).map(p=>`<div class="admin-row admin-row-card"><div class="admin-user"><img src="${esc(safeImage(p.avatar))}" alt=""><div><strong>${esc(p.display_name||p.username)}</strong><span>@${esc(p.username)}</span></div></div><div class="admin-badges">${p.verified?'<span class="verified-badge">✓</span>':''}${p.role==='admin'||p.role==='staff'?'<span class="staff-badge">🛡</span>':''}</div><div class="admin-actions"><button class="icon-btn" data-verify-user="${esc(p.username)}">${p.verified?'Unverify':'Verify'}</button><button class="icon-btn" data-staff-user="${esc(p.username)}">${p.role==='staff'?'Remove staff':'Make staff'}</button></div></div>`).join('');
  shell(`<section class="settings-head admin-page-head"><div><div class="section-label">ADMIN CONTROL</div><h1>Manage the<br><span>community.</span></h1><p>Verify designers and manage Staff badges from the admin account.</p></div><div class="settings-head-actions"><a class="btn" href="/designers">View directory ↗</a><a class="btn" href="/settings">Settings</a></div></section><section class="section admin-dashboard"><div class="admin-dashboard-head"><div><b>${Object.keys(profiles).length}</b><span>registered profiles</span></div><span class="settings-live">ADMIN · i.ixi.</span></div><div class="admin-list">${rows||'<p class="form-note">No designer accounts have joined yet.</p>'}</div></section>`);
  document.querySelectorAll('[data-verify-user],[data-staff-user]').forEach(b=>b.onclick=async()=>{const username=b.dataset.verifyUser||b.dataset.staffUser;const p=profiles[username];const action=b.dataset.verifyUser?'set-verification':'set-staff';try{const r=await cloudCall(action,{username,enabled:b.dataset.verifyUser? !p.verified : p.role!=='staff'});notify(r.message||'Updated');await adminPage();}catch(e){notify(e.message||'Admin action failed')}});
}

async function settings(){
  if(!me){location.href='/login';return}
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e)}
  const profiles=readProfiles();const d=profiles[me.username]||{username:me.username,display_name:me.display_name||me.username,avatar:me.avatar,banner:me.banner,discordBanner:me.banner,bio:'',links:[],verified:me.verified,role:me.role};
  const adminPanel=isAdmin()?`<section class="settings-card admin-card"><div class="settings-card-head"><div><b>Admin control</b><span>Verification and Staff management.</span></div><span class="settings-live">ADMIN</span></div><p class="form-note">Manage designer verification and Staff badges from the dedicated admin dashboard.</p><a class="btn primary" href="/admin">Open admin dashboard ↗</a></section>`:'';
  shell(`<section class="settings-head"><div><div class="section-label">CREATOR CONTROL</div><h1>Make your profile<br><span>feel like you.</span></h1><p>Your profile identity is stored in the cloud.</p></div><div class="settings-head-actions"><a class="btn" href="/profile/${encodeURIComponent(me.username)}">View profile ↗</a><button class="btn danger" id="logoutBtn" type="button">Log out</button></div></section><section class="settings-layout"><form id="profileForm" class="settings-card"><div class="settings-card-head"><div><b>Profile identity</b><span>Shown across your public profile.</span></div><span class="settings-live">CLOUD LIVE</span></div><div class="settings-preview"><img src="${esc(safeImage(d.avatar))}" alt=""><div><strong>${esc(d.display_name||d.username)}</strong><span>@${esc(d.username)} ${d.verified?'✓':''}</span></div></div><label class="label">Display name</label><input class="input" name="display_name" value="${esc(d.display_name||d.username)}"><label class="label">Bio</label><textarea class="textarea" name="bio">${esc(d.bio||'')}</textarea><label class="label">Profile banner URL</label><input class="input" name="banner" value="${esc(d.banner||d.discordBanner||'')}" placeholder="Leave blank to use Discord banner"><button class="btn primary" type="submit">Save profile ↗</button></form></section>${adminPanel}`);
  document.getElementById('logoutBtn')?.addEventListener('click',logout);
  document.getElementById('profileForm').onsubmit=async e=>{e.preventDefault();const payload=Object.fromEntries(new FormData(e.target));try{const result=await cloudCall('profile-update',{displayName:payload.display_name,bio:payload.bio,banner:payload.banner});const cp=result?.profile||{};saveMe({...me,display_name:cp.display_name||payload.display_name,banner:cp.banner||cp.discord_banner||me.banner,bio:cp.bio||payload.bio,verified:!!cp.verified,role:cp.role||me.role});await refreshAfterMutation();notify('Profile updated in the cloud');}catch(err){notify(err.message||'Could not update profile.')}};
  document.querySelectorAll('[data-verify-user],[data-staff-user]').forEach(b=>b.onclick=async()=>{const username=b.dataset.verifyUser||b.dataset.staffUser;const p=profiles[username];const action=b.dataset.verifyUser?'set-verification':'set-staff';try{const r=await cloudCall(action,{username,enabled:b.dataset.verifyUser? !p.verified : p.role!=='staff'});notify(r.message||'Updated');await refreshAfterMutation();await settings();}catch(e){notify(e.message||'Admin action failed')}});
}

async function handleOAuth(){
  const hash=new URLSearchParams(location.hash.slice(1));const token=hash.get('access_token');if(!token)return false;saveToken(token);
  try{const r=await fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:'Bearer '+token}});if(!r.ok)throw new Error('oauth');const u=await r.json();const avatar=avatarUrl(u);const discordBanner=bannerUrl(u);const user={id:u.id,username:u.username,display_name:u.global_name||u.username,avatar,banner:discordBanner,premium_type:u.premium_type||0,hasDiscordBanner:!!u.banner,role:u.username===ADMIN_USERNAME?'admin':'designer',verified:u.username===ADMIN_USERNAME};saveMe(user);const synced=await cloudCall('sync-profile');if(synced?.profile){saveMe({...user,verified:!!synced.profile.verified,role:synced.profile.role||user.role,banner:synced.profile.banner||synced.profile.discord_banner||user.banner,avatar:synced.profile.avatar||user.avatar});}cloudLoaded=false;await loadCloudState(true);history.replaceState({},'',location.pathname+location.search);location.href='/home.html';return true}catch(e){console.error(e);notify(e.message||'Cloud/Discord login could not be completed.');return false}
}

if(CLOUD_CONFIGURED && window.supabase?.createClient){window.__ARAB_SB=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});}

async function route(){
  if(await handleOAuth())return;
  const p=location.pathname.replace(/\/+$/,'')||'/';
  if(p==='/'||p==='/index.html'||p==='/home'||p==='/home.html')return await home();
  if(p==='/login'||p==='/login.html')return login();
  if(p==='/about'||p==='/about.html')return about();
  if(p==='/designers'||p==='/designers.html')return await designers();
  if(p==='/contact'||p==='/contact.html')return contact();
  if(p==='/settings'||p==='/settings.html')return await settings();
  if(p==='/admin'||p==='/admin.html')return await adminPage();
  if(p.startsWith('/profile/'))return await profile(decodeURIComponent(p.split('/').slice(2).join('/')));
  return await home();
}
route().catch(err=>{console.error(err);if(app){const msg=String(err?.message||err||'Unknown error');app.innerHTML=`<main class="auth-page"><section class="auth-card"><div class="section-label">CONNECTION ERROR</div><h1>Cloud connection failed.</h1><p>Supabase is configured, but the site could not load its cloud data.</p><div class="error-box"><strong>Error</strong><code>${esc(msg)}</code></div><p class="form-note">If this says a table is missing, run <code>supabase/schema.sql</code>. If it mentions the function, deploy <code>arab-designers-api</code>. Then refresh.</p><a class="btn primary xl full" href="/home.html">Try again ↗</a></section></main>`}});
