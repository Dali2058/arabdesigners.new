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
const FEATURED_IMAGES = [
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1800&q=88',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1400&q=88',
  'https://images.unsplash.com/photo-1614851099511-773084f6911d?auto=format&fit=crop&w=1400&q=88'
];

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
  return `<header class="topbar">
    <a class="brand" href="/home.html" aria-label="Arab Designers home">
      <span class="brand-mark"><img src="${LOGO}" onerror="this.src='${FALLBACK_LOGO}'" alt=""></span>
      <span><strong>Arab Designers</strong><small>Creative network</small></span>
    </a>
    <nav class="navlinks">
      <a href="/home">Home</a><a href="/discover">Discover</a><a href="/designers">Designers</a><a href="/about">About</a><a href="/contact">Contact</a>
    </nav>
    <div class="nav-right">
      <label class="search-wrap"><span>⌕</span><input id="globalSearch" placeholder="Search work or designers"></label>
      ${me ? `<a class="profile-chip" href="${profile}"><img src="${esc(me.avatar||FALLBACK_LOGO)}" alt=""><span>${esc(me.display_name||me.username)}</span></a>` : `<a class="btn primary nav-login" href="/login.html">Sign in with Discord</a>`}
      <button class="icon-btn menu-trigger" id="menuBtn" aria-label="Menu">☰</button>
    </div>
  </header>`;
}
function footer(){
  return `<footer class="footer"><div class="footer-main"><div><div class="footer-brand"><span class="brand-mark"><img src="${LOGO}" onerror="this.src='${FALLBACK_LOGO}'" alt=""></span><strong>Arab Designers</strong></div><p>A premium space for Arabic creatives, portfolios and visual work.</p></div><div><b>Explore</b><a href="/discover">Discover</a><a href="/designers">Designers</a><a href="/about">About</a></div><div><b>Studio</b><a href="/contact">Start a project</a><a href="/settings">Creator settings</a><a href="/login.html">Join community</a></div></div><div class="footer-bottom"><span>© 2026 Arab Designers</span><span>Built for people who care about the details.</span></div></footer>`;
}
function shell(content){
  app.innerHTML = nav() + `<main class="page">${content}</main>` + footer();
  const search = document.getElementById('globalSearch');
  search?.addEventListener('keydown', e => { if(e.key === 'Enter' && e.target.value.trim()) location.href = '/discover.html?q=' + encodeURIComponent(e.target.value.trim()); });
  document.getElementById('menuBtn')?.addEventListener('click', () => document.querySelector('.navlinks')?.classList.toggle('open'));
}

async function home(){
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e);}
  const profiles = Object.values(readProfiles());
  const works = profiles.flatMap(p => (p.designs||[]).map(w => ({...w, owner:p}))).slice(0,6);
  shell(`<section class="hero-stage">
    <div class="hero-bg" style="background-image:url('${BANNER}')"></div><div class="hero-noise"></div><div class="hero-grid"></div>
    <div class="hero-copy">
      <div class="kicker"><span class="live-dot"></span> Arab Designers · 2026</div>
      <h1>Where ideas become <em>visuals.</em></h1>
      <p>Discover bold identities, digital experiences and creative work from designers across the Arab world.</p>
      <div class="actions"><a class="btn primary xl" href="/discover">Explore the work ↗</a><a class="btn ghost xl" href="/designers">Meet designers</a></div>
      <div class="hero-trust"><span>2018—2026</span><span>Visual identity</span><span>UI/UX</span><span>Creative direction</span></div>
    </div>
    <div class="hero-floating hero-card-a"><span>01 / FEATURED</span><strong>Visual systems<br>with character.</strong><i>↗</i></div>
    <div class="hero-floating hero-card-b"><span>CREATIVE FEED</span><strong>${works.length ? formatNumber(works.length) : '∞'}<small> works</small></strong><div class="mini-stack"><span></span><span></span><span></span></div></div>
    <div class="scroll-cue"><span>Scroll to explore</span><i>↓</i></div>
  </section>
  <section class="cloud-status" id="cloudStatus"><span class="status-dot"></span><span>Cloud data will appear here when Supabase is connected.</span></section>
  <section class="section intro-section"><div class="section-label">THE PLATFORM</div><div class="intro-grid"><h2>A sharper home for<br><span>Arab creative talent.</span></h2><div><p>Not another generic portfolio grid. Arab Designers is designed around people, process and the work itself — with profiles that feel personal and projects that deserve attention.</p><a class="text-link" href="/about">Learn about the vision →</a></div></div></section>
  <section class="section showcase"><div class="section-head"><div><div class="section-label">SELECTED WORK</div><h2>Fresh from the feed.</h2></div><a class="text-link" href="/discover">View all work →</a></div>
    <div class="featured-grid">${works.length ? works.slice(0,3).map((w,i)=>workTile(w,i)).join('') : seedTiles()}</div>
  </section>
  <section class="section home-cta"><div><div class="section-label">FOR DESIGNERS</div><h2>Your work deserves<br>more than a thumbnail.</h2><p>Build a profile and let people explore your creative direction and selected work.</p></div><a class="btn primary xl" href="/login.html">Create your profile ↗</a></section>`);
}
function seedTiles(){
  return [0,1,2].map((i)=>`<article class="feature-tile seed-tile" data-seed="${i}" onclick="location.href='/discover.html'"><div class="seed-image" style="background-image:url('${FEATURED_IMAGES[i]}');--pos:50%"></div><div class="tile-overlay"></div><div class="tile-top"><span>0${i+1}</span><span>FEATURED</span></div><div class="tile-bottom"><strong>${['Visual Direction','Brand System','Digital Experience'][i]}</strong><span>Explore the collection ↗</span></div></article>`).join('');
}
function workTile(w,i=0){
  const m = getMetrics(w.id);
  return `<article class="feature-tile work-tile" data-design-id="${esc(w.id)}" onclick="openWork('${esc(w.id)}')">${mediaMarkup(w,'tile-media')}<div class="tile-overlay"></div><div class="tile-top"><span>0${i+1}</span><span>${esc(w.mediaLabel||'PROJECT')}</span></div><div class="tile-bottom"><strong>${esc(w.title||'Untitled project')}</strong><span>@${esc(w.owner?.username||'designer')} · ${formatNumber(m.views)} views</span></div></article>`;
}

function about(){
  shell(`<section class="about-hero about-hero-v2"><div><div class="section-label">ABOUT · EYAD MOHAMED</div><h1>Design with<br><span>direction.</span></h1><p>Graphic designer, UI/UX specialist and creative director building visual identities, digital experiences and systems that feel deliberate.</p><div class="about-actions"><a class="btn primary" href="/contact">Work together ↗</a><a class="text-link" href="/discover">Explore work →</a></div><div class="about-signature"><span>2018—2026</span><span>Visual identity</span><span>UI/UX</span><span>Creative direction</span></div></div><div class="about-portrait about-portrait-v2"><img src="${EYAD}" alt="Eyad Mohamed"><div class="portrait-overlay"></div><div class="portrait-tag">EYAD MOHAMED<br><small>ARAB DESIGNERS · FOUNDER</small></div></div></section>
  <section class="section story-grid about-story-v2"><div class="section-label">THE APPROACH</div><div><h2>Clear thinking.<br><span>Strong visuals.</span></h2><p>بدأت رحلتي في التصميم عام 2018، ومن وقتها وأنا أشتغل بين الهوية البصرية، المحتوى الرقمي، الواجهات والتجارب المختلفة. اشتغلت مع استوديوهات وفرق إبداعية متعددة، وركزت في كل تجربة على تحويل الفكرة إلى نظام بصري واضح وقابل للاستخدام.</p><p>Today the focus is simple: composition, typography, contrast, motion and digital interaction — all working together instead of competing for attention.</p><div class="about-facts"><div><strong>01</strong><span>Visual identity systems</span></div><div><strong>02</strong><span>Digital & UI/UX experiences</span></div><div><strong>03</strong><span>Creative direction</span></div></div></div></section>
  <section class="section timeline-modern"><div class="section-label">2018 — 2026</div><div class="timeline-list"><article><b>2018</b><div><h3>The beginning</h3><p>تكوين، ألوان، خطوط وهوية بصرية وبناء أساس قوي في التصميم.</p></div></article><article><b>2019—21</b><div><h3>Studio experience</h3><p>عمل مع استوديوهات وفرق إبداعية متعددة على هويات وحملات ومحتوى.</p></div></article><article><b>2022—24</b><div><h3>Identity + digital</h3><p>الأنظمة البصرية، الواجهات، السوشيال وart direction مع اهتمام أكبر بالتفاصيل.</p></div></article><article><b>2025—26</b><div><h3>Design with direction</h3><p>مشاريع وتجارب تجمع الهوية والاستخدام والحركة والوضوح في تجربة واحدة.</p></div></article></div></section>`);
}

function login(){
  app.innerHTML = `<main class="auth-page"><div class="auth-backdrop" style="background-image:url('${BANNER}')"></div><section class="auth-card"><span class="brand-mark huge"><img src="${LOGO}" onerror="this.src='${FALLBACK_LOGO}'" alt=""></span><div class="section-label">ARAB DESIGNERS</div><h1>Build a profile<br>people remember.</h1><p>Connect Discord to bring your avatar and profile banner into your designer page.</p><a class="btn primary xl full" href="${OAUTH_URL}">Continue with Discord <span>↗</span></a><a class="back-link" href="/home.html">← Back to home</a><div class="auth-note">No Discord banner? Your profile uses a clean black header instead of a random placeholder.</div></section></main>`;
}

async function designers(){
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e);}
  const all = Object.values(readProfiles());
  shell(`<section class="directory-head"><div><div class="section-label">COMMUNITY DIRECTORY</div><h1>Designers worth<br><span>discovering.</span></h1><p>Profiles, disciplines and visual work — all in one place.</p></div><div class="directory-stat"><strong>${all.length || '—'}</strong><span>local profiles</span></div></section><section class="section"><div class="designer-grid">${all.map((u,i)=>designerCard(u,i)).join('') || `<div class="empty-state wide"><span>✦</span><h3>The directory is just getting started.</h3><p>Sign in with Discord to create the first designer profile.</p><a class="btn primary" href="/login.html">Join the community ↗</a></div>`}</div></section>`);
}
function designerCard(u,i){
  const works=(u.designs||[]).length;
  const banner=profileBanner(u);
  return `<a class="designer-card-v2" href="/profile/${encodeURIComponent(u.username)}"><div class="designer-cover ${banner?'':'blank'}" ${banner?`style="background-image:url('${esc(banner)}')"`:''}><span>0${i+1}</span></div><div class="designer-body"><img src="${esc(safeImage(u.avatar))}" alt=""><div class="designer-copy"><h3>${esc(u.display_name||u.username)} ${u.verified?'<span class="verified-badge" title="Verified">✓</span>':''} ${u.role==='admin'||u.role==='staff'?'<span class="staff-badge" title="Staff">🛡</span>':''}</h3><p>@${esc(u.username)}</p></div><div class="designer-arrow">↗</div></div><div class="designer-meta"><span>${formatNumber(works)} projects</span><span>${banner?'Discord banner':'Available'}</span></div></a>`;
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
    d={username:target,display_name:same?(me.display_name||me.username):target,avatar:same?me.avatar:EYAD,banner:same?me.banner:'',discordBanner:same?me.banner:'',bio:'Designer focused on visual identity and digital experiences.',designs:[],links:[]};
  }
  const banner=profileBanner(d);
  setProfileMeta(d,target);
  const works=d.designs||[];
  const totalViews=works.reduce((a,w)=>a+getMetrics(w.id).views,0);
  const totalLikes=works.reduce((a,w)=>a+getMetrics(w.id).likes,0);
  shell(`<section class="profile-shell">
    <div class="profile-cover ${banner?'has-banner':'no-banner'}" ${banner?`style="background-image:url('${esc(banner)}')"`:''}><div class="cover-shade"></div><div class="cover-top"><span>${banner?'DISCORD PROFILE BANNER':'NO DISCORD BANNER'}</span>${same?'<span class="cover-safe">PROFILE HEADER</span>':''}</div></div>
    <div class="profile-main"><div class="profile-heading"><img class="profile-avatar-v2" src="${esc(safeImage(d.avatar))}" alt="${esc(d.display_name||d.username)}"><div class="profile-title"><div class="verified-line"><span class="status-dot"></span> Designer profile ${d.verified?'<span class="verified-badge" title="Verified">✓</span>':''} ${d.role==='admin'?'<span class="staff-badge" title="Staff">🛡</span>':''}</div><h1>${esc(d.display_name||d.username)}</h1><p>@${esc(d.username)}</p></div><div class="profile-actions">${same?'<a class="btn" href="/settings">Edit profile</a>':'<a class="btn primary" href="/contact?designer=${encodeURIComponent(target)}">Contact designer ↗</a>'}</div></div>
      <div class="profile-bio"><p>${esc(d.bio||'Designer focused on visual identity and digital experiences.')}</p><div class="profile-pills"><span>Graphic Design</span><span>UI/UX</span><span>Visual Identity</span><span>Creative Direction</span></div></div>
      <div class="profile-stats"><div><strong>${formatNumber(works.length)}</strong><span>Projects</span></div><div><strong>${formatNumber(totalViews)}</strong><span>Views</span></div><div><strong>${formatNumber(totalLikes)}</strong><span>Likes</span></div><div><strong>2018—26</strong><span>Experience</span></div></div>
    </div></section>
    <section class="section profile-work-section"><div class="section-head"><div><div class="section-label">PORTFOLIO</div><h2>Selected work.</h2><p>Explore projects and open the full presentation.</p></div></div><div class="work-grid-v2">${works.map((w,i)=>profileWorkCard(w,false,i)).join('') || `<div class="empty-state wide"><span>✦</span><h3>No projects published yet.</h3><p>This designer has not published work yet.</p></div>`}</div></section>`);
  bindWorkTiles();
}
function profileWorkCard(w,same,i){
  const m=getMetrics(w.id);
  return `<article class="work-card-v2" data-design-id="${esc(w.id)}" onclick="openWork('${esc(w.id)}')"><div class="work-visual">${mediaMarkup(w,'work-media-v2')}<span class="work-index">0${i+1}</span><span class="work-type">${esc(w.mediaLabel||'PROJECT')}</span></div><div class="work-card-info"><div><h3>${esc(w.title||'Untitled project')}</h3><p>${timeAgo(w.createdAt)}</p></div><div class="work-card-stats"><span>♡ ${formatNumber(m.likes)}</span><span>◉ ${formatNumber(m.views)}</span></div></div>${same?`<div class="work-owner-actions"><button class="icon-btn" data-edit="${esc(w.id)}">Edit</button><button class="icon-btn danger" data-delete="${esc(w.id)}">Remove</button></div>`:''}</article>`;
}

const CLOUD = window.ARAB_DESIGNERS_CONFIG || {};
const SUPABASE_URL = String(CLOUD.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = String(CLOUD.SUPABASE_ANON_KEY || '');
const SUPABASE_FUNCTION_URL = String(CLOUD.SUPABASE_FUNCTION_URL || (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/arab-designers-api` : ''));
const CLOUD_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY && !/YOUR-PROJECT|YOUR-PUBLISHABLE|YOUR-ANON/i.test(SUPABASE_URL + SUPABASE_ANON_KEY));
let cloudState = { profiles:{}, works:[] };
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
  const [profiles,works]=await Promise.all([
    cloudJson(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=display_name.asc`),
    cloudJson(`${SUPABASE_URL}/rest/v1/works?select=*&order=updated_at.desc`)
  ]);
  const map={};
  profiles.forEach(p=>map[p.username]={
    id:p.id,discord_id:p.discord_id,username:p.username,display_name:p.display_name,avatar:p.avatar||FALLBACK_LOGO,
    banner:p.banner||p.discord_banner||'',discordBanner:p.discord_banner||'',bio:p.bio||'',links:p.links||[],verified:!!p.verified,role:p.role||'designer',designs:[]
  });
  works.forEach(w=>{
    const owner=profiles.find(p=>p.id===w.profile_id); if(!owner)return;
    const item={id:w.id,title:w.title,mediaType:w.media_type,mediaLabel:w.media_label,src:w.media_url,storagePath:w.storage_path,views:Number(w.views||0),likes:Number(w.likes||0),createdAt:new Date(w.created_at).getTime(),updatedAt:new Date(w.updated_at).getTime()};
    if(map[owner.username])map[owner.username].designs.push(item);
  });
  cloudState={profiles:map,works:works.map(w=>{const p=profiles.find(x=>x.id===w.profile_id);const owner=p?map[p.username]:null;return {...w,owner,src:w.media_url,mediaType:w.media_type,mediaLabel:w.media_label,views:Number(w.views||0),likes:Number(w.likes||0),createdAt:new Date(w.created_at).getTime(),updatedAt:new Date(w.updated_at).getTime(),storagePath:w.storage_path};})};
  cloudLoaded=true;return cloudState;
}
function readProfiles(){return cloudState.profiles||{}}
function writeProfiles(){/* Cloud is authoritative. */}
function getMetrics(id){const w=cloudState.works.find(x=>x.id===id);return {views:Number(w?.views||0),likes:Number(w?.likes||0),liked:false};}
function mediaMarkup(x, cls='work-media'){
  const type=x.mediaType || x.media_type || 'image';
  const src=x.src || x.image || x.media_url || '';
  if(type==='video') return `<video class="${cls}" src="${esc(src)}" muted playsinline preload="metadata"></video>`;
  return `<img class="${cls}" src="${esc(src||BANNER)}" alt="${esc(x.title||'Work')}">`;
}
async function hydrateWorkMedia(){ return; }
async function refreshAfterMutation(){cloudLoaded=false;await loadCloudState(true);}
async function openWork(id){
  const found=findWork(id);if(!found)return;const {work,owner}=found;let metrics=getMetrics(id);
  try{const v=await cloudCall('view-work',{workId:id});metrics.views=Number(v.views||metrics.views);work.views=metrics.views}catch(e){console.warn(e)}
  const modal=document.createElement('div');modal.className='modal-backdrop';modal.id='workModal';modal.innerHTML=`<div class="work-modal" role="dialog" aria-modal="true"><button class="modal-close" id="closeWork">×</button><div class="modal-media">${mediaMarkup(work,'modal-media-el')}</div><div class="modal-content"><div class="modal-owner"><img src="${esc(safeImage(owner.avatar))}" alt=""><div><strong>${esc(owner.display_name||owner.username)}</strong><span>@${esc(owner.username)}</span></div><a href="/profile/${encodeURIComponent(owner.username)}">View profile ↗</a></div><div class="modal-title-row"><div><div class="section-label">PROJECT</div><h2>${esc(work.title||'Untitled project')}</h2></div><button class="like-btn" id="likeWork">♡ <span>${formatNumber(metrics.likes)}</span></button></div><div class="modal-stats"><span>◉ ${formatNumber(metrics.views)} views</span><span>♡ ${formatNumber(metrics.likes)} likes</span><span>${esc(work.mediaLabel||'Image')}</span></div><p class="modal-description">A selected visual project from the Arab Designers community. Open the designer profile to explore more work and connect directly.</p></div></div>`;
  document.body.appendChild(modal);document.body.classList.add('modal-open');const close=()=>{modal.remove();document.body.classList.remove('modal-open')};document.getElementById('closeWork').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',function escClose(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',escClose)}});
  document.getElementById('likeWork').onclick=async()=>{if(!me){notify('Sign in with Discord to like projects.');return}const btn=document.getElementById('likeWork');btn.disabled=true;const liked=!btn.classList.contains('liked');try{const result=await cloudCall('like-work',{workId:id,liked});metrics.likes=Number(result.likes||0);work.likes=metrics.likes;btn.classList.toggle('liked',liked);btn.querySelector('span').textContent=formatNumber(metrics.likes)}catch(e){notify(e.message||'Could not update the like.')}finally{btn.disabled=false}};
}
function findWork(id){const w=cloudState.works.find(x=>x.id===id);return w?{work:w,owner:w.owner}:null;}
function bindWorkTiles(){}
async function discover(){
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e);}
  const q=new URLSearchParams(location.search).get('q')?.toLowerCase().trim()||'';
  const profiles=readProfiles();let works=Object.values(profiles).flatMap(owner=>(owner.designs||[]).map(work=>({...work,owner})));
  if(q)works=works.filter(x=>`${x.title} ${x.owner.display_name} ${x.owner.username} ${x.mediaLabel}`.toLowerCase().includes(q));
  works.sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));
  shell(`<section class="discover-head"><div><div class="section-label">DISCOVER</div><h1>Work that makes<br><span>you stop scrolling.</span></h1><p>${q?`Results for “${esc(q)}”`:'A curated visual feed of projects from the community.'}</p></div><div class="discover-tools"><span>${formatNumber(works.length)} projects</span><a class="btn" href="/designers">Browse designers →</a></div></section><section class="section"><div class="masonry-grid">${works.map((x,i)=>discoverCard(x,i)).join('')||`<div class="empty-state wide"><span>✦</span><h3>${q?'No matching projects.':'The feed is waiting for its first project.'}</h3><p>${q?'Try another search or browse all designers.':'New work will appear here when the portfolio is populated.'}</p><a class="btn primary" href="/designers">Browse designers ↗</a></div>`}</div></section>`);
}
function discoverCard(x,i){const m=getMetrics(x.id);return `<article class="discover-card" data-design-id="${esc(x.id)}" onclick="openWork('${esc(x.id)}')"><div class="discover-media">${mediaMarkup(x,'discover-media-el')}<div class="discover-gradient"></div><div class="discover-top"><span>0${(i%9)+1}</span><span>${esc(x.mediaLabel||'PROJECT')}</span></div><div class="discover-play">↗</div></div><div class="discover-info"><div class="discover-owner"><img src="${esc(safeImage(x.owner.avatar))}" alt=""><div><strong>${esc(x.title||'Untitled project')}</strong><span>@${esc(x.owner.username)}</span></div></div><div class="discover-metrics"><span>♡ ${formatNumber(m.likes)}</span><span>◉ ${formatNumber(m.views)}</span></div></div></article>`;}

async function submitTicket(payload){
  const user = me ? `@${me.username}` : (payload.discord_user || payload.name || 'Guest');
  const body={username:'Arab Designers',avatar_url:BANNER,embeds:[{title:'New contact ticket',description:payload.message,color:0x5b8cff,author:{name:user},fields:[{name:'Name',value:payload.name||'—',inline:true},{name:'Email',value:payload.email||'—',inline:true},{name:'Request',value:payload.type||'—',inline:true},{name:'Designer',value:payload.designer||'Studio',inline:true},{name:'Discord',value:payload.discord_user||user,inline:false},{name:'Ticket',value:payload.ticket_id||'—',inline:true},{name:'Channel ID',value:TICKET_CHANNEL_ID,inline:true}],footer:{text:'Powered by Arab Designers · direct Discord webhook'},timestamp:new Date().toISOString()}]};
  const r=await fetch(DISCORD_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok)throw new Error(`Discord webhook ${r.status}`);
}
function makeTicketId(){return `AD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;}
function contact(){
  const params=new URLSearchParams(location.search); const designer=params.get('designer')||''; const ticketId=makeTicketId();
  shell(`<section class="contact-layout ticket-contact"><div class="contact-copy"><div class="section-label">ARAB DESIGNERS · CONTACT</div><h1>Start a<br><span>conversation.</span></h1><p>Send a request and it will arrive in our Discord workflow with your Discord identity and ticket number attached.</p><div class="contact-points"><div><b>01</b><span>Direct Discord delivery</span></div><div><b>02</b><span>Ticket ID: ${esc(ticketId)}</span></div><div><b>03</b><span>Continue the conversation in Discord</span></div></div><div class="ticket-note"><strong>Your tickets</strong><p>Website ticket notifications are enabled. A true two-way website chat with images and voice needs a Discord bot/backend; GitHub Pages alone cannot securely read Discord channel messages.</p></div></div><form id="contactForm" class="contact-form"><div class="form-form-head"><span>NEW TICKET</span><small>${designer?`For @${esc(designer)}`:'Arab Designers Studio'}</small></div><input type="hidden" name="ticket_id" value="${esc(ticketId)}"><input type="hidden" name="designer" value="${esc(designer)}"><input type="hidden" name="discord_user" value="${esc(me?`@${me.username}`:'Guest')}"><div class="form-grid"><div><label class="label">Name</label><input class="input" name="name" value="${esc(me?.display_name||'')}" placeholder="Your name" required></div><div><label class="label">Email</label><input class="input" name="email" type="email" placeholder="you@example.com" required></div></div><label class="label">Request type</label><select class="select" name="type"><option>Design project</option><option>Brand identity</option><option>UI/UX</option><option>Creative direction</option><option>Partnership</option><option>Technical support</option><option>Other</option></select><label class="label">Message</label><textarea class="textarea" name="message" required placeholder="Tell us what you need..."></textarea><button class="btn primary xl" id="submitBtn">Open ticket ↗</button><p class="form-note">Portfolio / website was removed. Your Discord username is attached automatically when signed in.</p></form></section>`);
  document.getElementById('contactForm').onsubmit=async e=>{e.preventDefault();const btn=document.getElementById('submitBtn');btn.disabled=true;btn.textContent='Opening ticket…';const payload=Object.fromEntries(new FormData(e.target));try{await submitTicket(payload);notify(`Ticket ${ticketId} sent to Discord.`);}catch(err){console.error(err);notify('Discord could not receive the ticket. Check the webhook.')}finally{btn.disabled=false;btn.textContent='Open ticket ↗'}};
}

async function settings(){
  if(!me){location.href='/login';return}
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e)}
  const profiles=readProfiles();const d=profiles[me.username]||{username:me.username,display_name:me.display_name||me.username,avatar:me.avatar,banner:me.banner,discordBanner:me.banner,bio:'',designs:[],links:[],verified:me.verified,role:me.role};
  const adminPanel=isAdmin()?`<section class="settings-card admin-card"><div class="settings-card-head"><div><b>Staff verification</b><span>Verify designers from the admin account.</span></div><span class="settings-live">ADMIN</span></div><div class="admin-list">${Object.values(profiles).map(p=>`<div class="admin-row"><div><strong>${esc(p.display_name||p.username)}</strong><span>@${esc(p.username)}</span></div><div class="admin-actions"><button class="icon-btn" data-verify-user="${esc(p.username)}">${p.verified?'Unverify':'Verify'}</button><button class="icon-btn" data-staff-user="${esc(p.username)}">${p.role==='staff'?'Remove staff':'Make staff'}</button></div></div>`).join('')||'<p class="form-note">No designers yet.</p>'}</div></section>`:'';
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
  if(p==='/discover'||p==='/discover.html')return await discover();
  if(p==='/about'||p==='/about.html')return about();
  if(p==='/designers'||p==='/designers.html')return await designers();
  if(p==='/contact'||p==='/contact.html')return contact();
  if(p==='/settings'||p==='/settings.html')return await settings();
  if(p.startsWith('/profile/'))return await profile(decodeURIComponent(p.split('/').slice(2).join('/')));
  return await home();
}
route().catch(err=>{console.error(err);if(app){const msg=String(err?.message||err||'Unknown error');app.innerHTML=`<main class="auth-page"><section class="auth-card"><div class="section-label">CONNECTION ERROR</div><h1>Cloud connection failed.</h1><p>Supabase is configured, but the site could not load its cloud data.</p><div class="error-box"><strong>Error</strong><code>${esc(msg)}</code></div><p class="form-note">If this says a table is missing, run <code>supabase/schema.sql</code>. If it mentions the function, deploy <code>arab-designers-api</code>. Then refresh.</p><a class="btn primary xl full" href="/home.html">Try again ↗</a></section></main>`}});
