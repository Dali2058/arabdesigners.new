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
  const duration = Math.min(9000, Math.max(2800, String(message||'').length * 55));
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
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

// ---- Profile badges (Staff, Verified, Early Supporter, Booster, Partner) ----
const BADGE_META = {
  staff:{img:'https://i.postimg.cc/sxkfySKJ/shield.png',label:'Staff'},
  verified:{img:'https://i.postimg.cc/3xCr5kGW/blue-verified-check-mark-badge-design-vector.png',label:'Verified'},
  early_supporter:{img:'https://i.postimg.cc/FzLmPzmz/elite.png',label:'Early Supporter'},
  booster:{img:'https://i.postimg.cc/prFx0rxL/booster.png',label:'Booster'},
  partner:{img:'https://i.postimg.cc/PJwh6Jhx/partner.png',label:'Partner'},
};
const TOGGLEABLE_BADGES = ['early_supporter','booster','partner'];
function badgeImg(type){ const m=BADGE_META[type]; if(!m) return ''; return `<img class="badge-icon" src="${m.img}" alt="${esc(m.label)}" title="${esc(m.label)}" loading="lazy">`; }
function hasBadge(d,type){ return Array.isArray(d?.badges) && d.badges.includes(type); }
function badgeList(d){
  const list=[];
  if(d?.verified) list.push('verified');
  if(d?.role==='admin'||d?.role==='staff') list.push('staff');
  (Array.isArray(d?.badges)?d.badges:[]).forEach(b=>{ if(BADGE_META[b] && !list.includes(b)) list.push(b); });
  return list;
}
function renderBadges(d){ return badgeList(d).map(badgeImg).join(''); }

// ---- Social platform badges (auto from Discord connections + manual links) ----
const PLATFORM_META = {
  youtube:{label:'YouTube',code:'YT',color:'#ff2d2d'},
  twitter:{label:'X',code:'X',color:'#e7e9ee'},
  x:{label:'X',code:'X',color:'#e7e9ee'},
  twitch:{label:'Twitch',code:'TW',color:'#9146ff'},
  instagram:{label:'Instagram',code:'IG',color:'#ff5fa2'},
  tiktok:{label:'TikTok',code:'TT',color:'#25f4ee'},
  github:{label:'GitHub',code:'GH',color:'#c9cbd3'},
  spotify:{label:'Spotify',code:'SP',color:'#1ed760'},
  reddit:{label:'Reddit',code:'RD',color:'#ff5a1f'},
  steam:{label:'Steam',code:'ST',color:'#66c0f4'},
  facebook:{label:'Facebook',code:'FB',color:'#1877f2'},
  behance:{label:'Behance',code:'BE',color:'#3b82ff'},
  dribbble:{label:'Dribbble',code:'DR',color:'#ea4c89'},
  linkedin:{label:'LinkedIn',code:'IN',color:'#3b9eff'},
  website:{label:'Website',code:'●',color:'#7aa2ff'},
  other:{label:'Link',code:'🔗',color:'#7aa2ff'},
};
const KNOWN_CONNECTION_TYPES = ['youtube','twitter','twitch','instagram','tiktok','github','spotify','reddit','steam','facebook'];
const LINK_PLATFORM_OPTIONS = ['website','behance','dribbble','linkedin','youtube','twitter','instagram','tiktok','twitch','github','other'];
function platformMeta(type){ return PLATFORM_META[String(type||'').toLowerCase()] || PLATFORM_META.other; }
function connectionUrl(type,name,id){
  switch(String(type||'').toLowerCase()){
    case 'youtube': return `https://www.youtube.com/channel/${id}`;
    case 'twitter': return `https://x.com/${name}`;
    case 'twitch': return `https://twitch.tv/${name}`;
    case 'instagram': return `https://instagram.com/${name}`;
    case 'tiktok': return `https://www.tiktok.com/@${name}`;
    case 'github': return `https://github.com/${name}`;
    case 'spotify': return `https://open.spotify.com/user/${id}`;
    case 'reddit': return `https://www.reddit.com/user/${name}`;
    case 'steam': return `https://steamcommunity.com/profiles/${id}`;
    case 'facebook': return `https://facebook.com/${id}`;
    default: return '#';
  }
}
function mapConnections(raw){
  if(!Array.isArray(raw)) return [];
  return raw
    .filter(c => c && c.visibility===1 && KNOWN_CONNECTION_TYPES.includes(String(c.type).toLowerCase()))
    .map(c => ({type:String(c.type).toLowerCase(), name:c.name, id:c.id, url:connectionUrl(c.type,c.name,c.id)}))
    .slice(0,10);
}
function socialBadges(d){
  const conns=(Array.isArray(d.connections)?d.connections:[]).filter(c=>c&&c.url&&c.url!=='#').map(c=>({type:c.type,label:c.name||platformMeta(c.type).label,url:c.url}));
  const manual=(Array.isArray(d.links)?d.links:[]).filter(l=>l&&l.url).map(l=>({type:l.type,label:platformMeta(l.type).label,url:l.url}));
  const all=[...conns,...manual];
  if(!all.length) return '';
  return `<div class="social-badges">${all.map(l=>{const m=platformMeta(l.type);return `<a class="social-badge" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" style="--pc:${m.color}"><span class="sb-code">${esc(m.code)}</span><span>${esc(l.label)}</span></a>`;}).join('')}</div>`;
}
function linkRow(l={}){
  const type=String(l.type||'website').toLowerCase();
  const opts=LINK_PLATFORM_OPTIONS.map(o=>`<option value="${o}" ${o===type?'selected':''}>${esc(platformMeta(o).label)}</option>`).join('');
  return `<div class="link-row" data-row><select class="select link-type">${opts}</select><input class="input link-url" placeholder="https://…" value="${esc(l.url||'')}"><button class="icon-btn danger" type="button" data-remove-row title="Remove">✕</button></div>`;
}
function wireLinkEditor(){
  const rows=document.getElementById('linkRows');
  const addBtn=document.getElementById('addLinkBtn');
  if(!rows||!addBtn)return;
  const wireRemovers=()=>rows.querySelectorAll('[data-remove-row]').forEach(b=>b.onclick=()=>b.closest('[data-row]')?.remove());
  addBtn.onclick=()=>{ rows.insertAdjacentHTML('beforeend', linkRow({})); wireRemovers(); };
  wireRemovers();
}
function collectLinkRows(){
  return Array.from(document.querySelectorAll('#linkRows [data-row]')).map(row=>({
    type:row.querySelector('.link-type')?.value||'website',
    url:row.querySelector('.link-url')?.value.trim()||''
  })).filter(l=>l.url).slice(0,10);
}

function nav(){
  const profile = me ? `/profile/${encodeURIComponent(me.username)}` : '/login';
  const mobileAuth = me ? `<a class="mobile-only" href="${profile}">My profile ↗</a><a class="mobile-only" href="/settings">Settings</a>${isAdmin()?'<a class="mobile-only admin-nav-link" href="/admin">Admin ↗</a>':''}` : `<a class="mobile-only" href="/login.html">Sign in with Discord ↗</a>`;
  return `<header class="topbar">
    <a class="brand" href="/home.html" aria-label="Arab Designers home">
      <span class="brand-mark"><img src="${LOGO}" onerror="this.src='${FALLBACK_LOGO}'" alt=""></span>
      <span><strong>Arab Designers</strong><small>Creative network</small></span>
    </a>
    <nav class="navlinks">
      <a href="/home">Home</a><a href="/designers">Designers</a><a href="/works">Works</a>${me?'<a class="publish-nav" href="/publish">+ Publish</a>':''}<a href="/about">About</a><a href="/contact">Contact</a>${isAdmin()?'<a class="admin-nav-link" href="/admin">Admin</a>':''}${mobileAuth}
    </nav>
    <div class="nav-right">
      <label class="search-wrap"><span>⌕</span><input id="globalSearch" placeholder="Search work or designers"></label>
      ${me ? `<a class="messages-nav" href="/messages" title="Messages"><span class="messages-icon">◌</span><i id="messageUnreadDot"></i></a><a class="profile-chip" href="${profile}"><img src="${esc(me.avatar||FALLBACK_LOGO)}" alt=""><span>${esc(me.display_name||me.username)}</span></a>` : `<a class="btn primary nav-login" href="/login.html"><span class="login-full">Sign in with Discord</span><span class="login-short">Login</span></a>`}
      <button class="icon-btn menu-trigger" id="menuBtn" aria-label="Menu">☰</button>
    </div>
  </header>`;
}

async function refreshMessageBadge(){
  if(!me)return;
  try{const r=await cloudCall('chat-unread');const dot=document.getElementById('messageUnreadDot');if(dot){dot.textContent=r.unread>0?(r.unread>9?'9+':r.unread):'';dot.classList.toggle('show',r.unread>0)}}catch{}
}

function footer(){
  return `<footer class="footer"><div class="footer-main"><div><div class="footer-brand"><span class="brand-mark"><img src="${LOGO}" onerror="this.src='${FALLBACK_LOGO}'" alt=""></span><strong>Arab Designers</strong></div><p>A premium space for Arabic creatives, profiles and creative talent.</p></div><div><b>Explore</b><a href="/designers">Designers</a><a href="/about">About</a><a href="/contact">Contact</a></div><div><b>Studio</b><a href="/contact">Start a project</a><a href="/settings">Creator settings</a>${isAdmin()?'<a href="/admin">Admin panel</a>':''}<a href="/login.html">Join community</a></div></div><div class="footer-bottom"><span>© 2026 Arab Designers</span><span>Built for people who care about the details.</span></div></footer>`;
}
function shell(content){
  document.body.classList.remove('home-active');
  app.innerHTML = nav() + `<main class="page">${content}</main>` + footer();
  refreshMessageBadge();
  clearInterval(window.__messageBadgeTimer); window.__messageBadgeTimer=setInterval(refreshMessageBadge,5000);
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
  <section class="section home-cta"><div><div class="section-label">JOIN THE NETWORK</div><h2>Put your name<br><span>on the directory.</span></h2><p>Sign in with Discord and your designer profile will be created in the cloud and appear automatically on the Designers page.</p></div><a class="btn primary xl" href="/designers">Explore Designers Now ↗</a></section>`);
  document.body.classList.add('home-active');
}


async function publishPage(){
  if(!me){ location.href='/login.html'; return; }
  shell(`<section class="publish-studio">
    <div class="publish-topbar">
      <a class="publish-brand" href="/works" aria-label="Back to works"><span class="publish-back">‹</span><strong>Arab Designers</strong></a>
      <div class="publish-actions"><button class="btn publish-draft" id="saveDraftBtn" type="button">Save as Draft</button><button class="btn primary publish-green" id="publishNowBtn" type="button">Publish</button></div>
    </div>
    <div class="publish-workspace">
      <main class="publish-canvas">
        <div class="publish-canvas-inner">
          <div class="publish-placeholder" id="publishPreview">
            <div class="publish-placeholder-icon">＋</div>
            <h2>Start building your project</h2>
            <p>Add an image to create the cover of your work.</p>
            <button class="publish-big-action" id="chooseCoverBtn" type="button">▧ <span>Image</span></button>
          </div>
        </div>
      </main>
      <aside class="publish-sidebar">
        <div class="publish-side-title">Add Content</div>
        <div class="publish-tools">
          <button type="button" data-publish-tool="image"><span>▧</span><b>Image</b></button>
          <button type="button" data-publish-tool="text"><span>T</span><b>Text</b></button>
          <button type="button" data-publish-tool="grid"><span>▦</span><b>Photo Grid</b></button>
          <button type="button" data-publish-tool="video"><span>▶</span><b>Video / Audio</b></button>
          <button type="button" data-publish-tool="embed"><span>&lt;/&gt;</span><b>Embed</b></button>
          <button type="button" data-publish-tool="lightroom"><span>LR</span><b>Lightroom</b></button>
          <button type="button" data-publish-tool="prototype"><span>⌁</span><b>Prototype</b></button>
          <button type="button" data-publish-tool="3d"><span>◇</span><b>3D</b></button>
        </div>
        <div class="publish-side-title">Edit Project</div>
        <div class="publish-edit-tools">
          <button type="button" id="projectStylesBtn"><span>✦</span><b>Styles</b></button>
          <button type="button" id="projectSettingsBtn"><span>⚙</span><b>Settings</b></button>
        </div>
        <div class="publish-custom-button"><button type="button">Custom Button</button><p>Customize the call to action on your project</p></div>
        <div class="publish-assets"><div class="publish-side-title">Attach Assets</div><button type="button" id="attachAssetsBtn">⌕&nbsp; Attach Assets</button><p>Add files like fonts, illustrations, photos, zips, or templates as free or paid downloads.</p></div>
      </aside>
    </div>
  </section>
  <input id="publishFile" type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime">
  <div class="modal-overlay" id="publishDetailsModal"><div class="modal-card publish-details-card">
    <div class="modal-head"><h3>Publish your work</h3><button class="icon-btn" id="closePublishDetails" type="button">✕</button></div>
    <form id="publishDetailsForm">
      <label class="label">Project title</label><input class="input" name="title" maxlength="120" placeholder="e.g. Brand Identity — Al Noor" required>
      <label class="label">Description</label><textarea class="textarea" name="description" maxlength="400" placeholder="Tell people about this project…"></textarea>
      <div class="publish-cover-mini" id="publishCoverMini"></div>
      <p class="form-note">Your uploaded cover will appear on Works and your public profile.</p>
      <button class="btn primary full" type="submit" id="confirmPublishBtn">Publish work ↗</button>
    </form>
  </div></div>`);

  let coverFile=null, coverUpload=null;
  const fileInput=document.getElementById('publishFile');
  const preview=document.getElementById('publishPreview');
  const mini=document.getElementById('publishCoverMini');
  const choose=()=>fileInput.click();
  document.getElementById('chooseCoverBtn')?.addEventListener('click',choose);
  document.querySelectorAll('[data-publish-tool]').forEach(b=>b.addEventListener('click',()=>{
    const tool=b.dataset.publishTool;
    if(tool==='image'||tool==='grid'||tool==='video') choose();
    else notify(tool==='text'?'Text blocks can be added after the cover is published.':`${b.querySelector('b')?.textContent||'This tool'} is ready for the next editor update.`);
  }));
  document.getElementById('attachAssetsBtn')?.addEventListener('click',()=>notify('Attach Assets is ready — upload support can be enabled from project settings.'));
  document.getElementById('projectStylesBtn')?.addEventListener('click',()=>notify('Project styles will apply to the published project.'));
  document.getElementById('projectSettingsBtn')?.addEventListener('click',()=>notify('Project settings are available before publishing.'));
  document.getElementById('saveDraftBtn')?.addEventListener('click',()=>notify('Draft saved locally. Publish when you are ready.'));
  fileInput.onchange=()=>{
    const f=fileInput.files?.[0]; if(!f)return;
    if(f.size>31457280){notify('File is larger than 30MB.');fileInput.value='';return;}
    coverFile=f;
    const url=URL.createObjectURL(f);
    preview.innerHTML=f.type.startsWith('video/')?`<video src="${url}" controls playsinline></video>`:`<img src="${url}" alt="Project cover"><div class="publish-preview-overlay"><b>${esc(f.name)}</b><span>Cover preview</span></div>`;
    mini.innerHTML=f.type.startsWith('video/')?`<video src="${url}" controls></video>`:`<img src="${url}" alt="">`;
  };
  const openDetails=()=>{ if(!coverFile){notify('Choose an image or video first.');return;} document.getElementById('publishDetailsModal').classList.add('open'); };
  document.getElementById('publishNowBtn')?.addEventListener('click',openDetails);
  document.getElementById('closePublishDetails')?.addEventListener('click',()=>document.getElementById('publishDetailsModal')?.classList.remove('open'));
  document.getElementById('publishDetailsModal')?.addEventListener('click',e=>{if(e.target.id==='publishDetailsModal')e.target.classList.remove('open')});
  document.getElementById('publishDetailsForm').onsubmit=async e=>{
    e.preventDefault();
    const fd=new FormData(e.target), btn=document.getElementById('confirmPublishBtn');
    btn.disabled=true;btn.textContent='Publishing…';
    try{
      const ext=(coverFile.name.split('.').pop()||'bin').toLowerCase();
      const type=coverFile.type.startsWith('video/')?'video':'image';
      const workId=uid();
      const up=await cloudCall('work-upload-url',{workId,ext});
      const {error}=await window.__ARAB_SB.storage.from('works').uploadToSignedUrl(up.path,up.token,coverFile);
      if(error)throw error;
      const pub=window.__ARAB_SB.storage.from('works').getPublicUrl(up.path).data.publicUrl;
      const r=await cloudCall('create-work',{workId,mediaType:type,mediaUrl:pub,mediaLabel:type==='video'?'Video':'Image',storagePath:up.path,title:fd.get('title'),description:fd.get('description')});
      notify('Work published successfully.');
      location.href=`/profile/${encodeURIComponent(me.username)}#works`;
    }catch(err){notify(err.message||'Could not publish work.');btn.disabled=false;btn.textContent='Publish work ↗';}
  };
}

function worksPage(){
  const all=[];
  Object.entries(cloudState.works||{}).forEach(([pid,list])=>{
    const p=Object.values(cloudState.profiles||{}).find(x=>x.id===pid);
    (list||[]).forEach(w=>all.push({...w,designer:p||{username:'designer',display_name:'Designer',avatar:FALLBACK_LOGO}}));
  });
  all.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
  shell(`<section class="works-page-head"><div><div class="section-label">THE WORKS</div><h1>Work worth<br><span>being seen.</span></h1><p>Explore the latest projects published by designers across Arab Designers.</p></div>${me?`<a class="btn primary xl" href="/publish">+ Publish work</a>`:''}</section>
  <section class="section"><div class="works-grid works-feed" id="worksGrid">${all.length?all.map(w=>`<div class="work-feed-item"><div class="work-feed-author"><img src="${esc(safeImage(w.designer.avatar))}" alt=""><div><a href="/profile/${encodeURIComponent(w.designer.username)}">${esc(w.designer.display_name||w.designer.username)}</a><span>@${esc(w.designer.username)}</span></div></div>${workCard(w,false)}</div>`).join(''):`<div class="empty-state wide"><span>✦</span><h3>No published work yet</h3><p>Designers can publish their first project from their profile.</p></div>`}</div></section>`);
  document.querySelectorAll('[data-open-work]').forEach(b=>b.onclick=()=>openWorkViewer(b.dataset.openWork));
  document.querySelectorAll('[data-like-work]').forEach(b=>b.onclick=async(e)=>{
    e.stopPropagation(); const w=findWork(b.dataset.likeWork); if(!w)return;
    if(!me){notify('Sign in with Discord to like work.');return}
    const liked=!cloudState.likedWorks?.has(w.id);
    try{const r=await cloudCall('like-work',{workId:w.id,liked});w.likes=r.likes;if(liked)cloudState.likedWorks.add(w.id);else cloudState.likedWorks.delete(w.id);document.querySelectorAll(`[data-like-work="${w.id}"]`).forEach(el=>{el.innerHTML=`${liked?'♥':'♡'} <span>${formatNumber(w.likes)}</span>`;el.classList.toggle('liked',liked)})}catch(err){notify(err.message||'Could not update like.')}
  });
  document.getElementById('closeWorkViewer')?.addEventListener('click',()=>document.getElementById('workViewer')?.classList.remove('open'));
  document.getElementById('workViewer')?.addEventListener('click',e=>{if(e.target.id==='workViewer')e.target.classList.remove('open')});
  app.insertAdjacentHTML('beforeend',modalsMarkup(false));
  if(all.length)refreshLikedWorks(all.map(w=>w.id));
}
async function messagesPage(){
  if(!me){ location.href='/login.html'; return; }
  shell(`<section class="messages-page"><div class="messages-head"><div><div class="section-label">MESSAGES</div><h1>Your conversations.</h1></div><span class="messages-live">LIVE</span></div><div class="messenger" id="messenger"><aside class="conversation-list" id="conversationList"><div class="conversation-empty">Loading conversations…</div></aside><section class="chat-pane" id="chatPane"><div class="chat-empty">Select a designer to start chatting.</div></section></div></section>`);
  await initMessenger(new URLSearchParams(location.search).get('designer')||'');
}
async function initMessenger(initialDesigner=''){
  let active='', timer=null, conversations=[];
  const listEl=()=>document.getElementById('conversationList'), pane=()=>document.getElementById('chatPane');
  async function loadConversations(){
    try{const r=await cloudCall('chat-list'); conversations=r.conversations||[]; listEl().innerHTML=conversations.length?conversations.map(c=>`<button class="conversation ${active===c.username?'active':''}" data-chat-user="${esc(c.username)}"><img src="${esc(safeImage(c.avatar))}"><span><b>${esc(c.display_name||c.username)}</b><small>@${esc(c.username)}</small></span>${c.unread?`<i class="unread-dot">${c.unread>9?'9+':c.unread}</i>`:''}</button>`).join(''):'<div class="conversation-empty">No conversations yet.<br>Open a designer profile and press Contact.</div>'; listEl().querySelectorAll('[data-chat-user]').forEach(b=>b.onclick=()=>openChat(b.dataset.chatUser));}
    catch(e){listEl().innerHTML=`<div class="conversation-empty">${esc(e.message||'Could not load conversations.')}</div>`}
  }
  async function openChat(username){
    active=username; await loadConversations();
    pane().innerHTML='<div class="chat-loading">Loading messages…</div>';
    try{
      const r=await cloudCall('chat-history',{username}); const p=r.profile||{username,display_name:username,avatar:FALLBACK_LOGO}; active=username;
      pane().innerHTML=`<div class="chat-top"><img src="${esc(safeImage(p.avatar))}"><div><b>${esc(p.display_name||p.username)}</b><span>@${esc(p.username)}</span></div><a class="btn" href="/profile/${encodeURIComponent(p.username)}">Profile ↗</a></div><div class="chat-messages" id="chatMessages"></div><form class="chat-compose" id="chatCompose"><input type="file" id="chatFile" hidden accept="image/*,video/*,audio/*,.pdf,.zip"><button type="button" class="chat-attach" id="chatAttach" title="Attach file">＋</button><button type="button" class="chat-record" id="chatRecord" title="Record voice">●</button><textarea id="chatText" rows="1" maxlength="3000" placeholder="Write a message…"></textarea><button class="btn primary" type="submit">Send</button></form>`;
      const render=msgs=>{const box=document.getElementById('chatMessages');box.innerHTML=msgs.length?msgs.map(m=>`<div class="chat-msg ${m.sender_id===me.id?'mine':''}">${m.attachment_url?`<div class="chat-attachment">${m.attachment_type?.startsWith('audio/')?`<audio src="${esc(m.attachment_url)}" controls></audio>`:m.attachment_type?.startsWith('video/')?`<video src="${esc(m.attachment_url)}" controls playsinline></video>`:m.attachment_type?.startsWith('image/')?`<a href="${esc(m.attachment_url)}" target="_blank"><img src="${esc(m.attachment_url)}" alt="attachment"></a>`:`<a href="${esc(m.attachment_url)}" target="_blank">📎 ${esc(m.attachment_name||'Attachment')}</a>`}</div>`:''}${m.content?`<div class="bubble">${esc(m.content)}</div>`:''}<time>${timeAgo(new Date(m.created_at).getTime())}</time></div>`).join(''):'<div class="chat-no-messages">No messages yet. Say hello 👋</div>';box.scrollTop=box.scrollHeight;};
      const load=async()=>{try{const rr=await cloudCall('chat-history',{username});render(rr.messages||[])}catch{}};
      await load(); await loadConversations();
      document.getElementById('chatText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();document.getElementById('chatCompose')?.requestSubmit()}});
      document.getElementById('chatCompose').onsubmit=async e=>{e.preventDefault();const text=document.getElementById('chatText').value.trim();if(!text)return;const btn=e.target.querySelector('button[type=submit]');btn.disabled=true;try{await cloudCall('chat-send',{username,content:text});document.getElementById('chatText').value='';await load();await loadConversations()}catch(err){notify(err.message||'Could not send message.')}finally{btn.disabled=false}};
      document.getElementById('chatAttach').onclick=()=>document.getElementById('chatFile').click();
      document.getElementById('chatFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const ext=(f.name.split('.').pop()||'bin').toLowerCase();const up=await cloudCall('chat-upload-url',{username,ext,mime:f.type,name:f.name});const {error}=await window.__ARAB_SB.storage.from('chat').uploadToSignedUrl(up.path,up.token,f);if(error)throw error;const pub=window.__ARAB_SB.storage.from('chat').getPublicUrl(up.path).data.publicUrl;await cloudCall('chat-send',{username,attachmentUrl:pub,attachmentType:f.type,attachmentName:f.name});await load();await loadConversations()}catch(err){notify(err.message||'Upload failed.')}e.target.value=''};
      let recording=false,rec=null,chunks=[];
      document.getElementById('chatRecord').onclick=async()=>{const b=document.getElementById('chatRecord');if(!recording){try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});rec=new MediaRecorder(stream);chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});try{const up=await cloudCall('chat-upload-url',{username,ext:'webm',mime:blob.type,name:'voice-message.webm'});const {error}=await window.__ARAB_SB.storage.from('chat').uploadToSignedUrl(up.path,up.token,blob);if(error)throw error;const pub=window.__ARAB_SB.storage.from('chat').getPublicUrl(up.path).data.publicUrl;await cloudCall('chat-send',{username,attachmentUrl:pub,attachmentType:blob.type,attachmentName:'Voice message'}) ;await load();await loadConversations()}catch(err){notify(err.message||'Voice message failed.')}};rec.start();recording=true;b.classList.add('recording');b.textContent='■';notify('Recording… click again to send')}catch(err){notify('Microphone permission is required.')}}else{recording=false;b.classList.remove('recording');b.textContent='●';rec?.stop()}};
    }catch(e){pane().innerHTML=`<div class="chat-empty">${esc(e.message||'Could not open conversation.')}</div>`}
  }
  await loadConversations();
  if(initialDesigner) await openChat(initialDesigner);
  clearInterval(timer); timer=setInterval(()=>{if(active)openChat(active);else loadConversations()},5000);
}

function about(){
  shell(`<section class="about-hero about-hero-v2"><div><div class="section-label">ABOUT · EYAD MOHAMED</div><h1>Design with<br><span>direction.</span></h1><p>Graphic designer, UI/UX specialist and creative director building visual identities, digital experiences and systems that feel deliberate.</p><div class="about-actions"><a class="btn primary" href="/contact">Work together ↗</a><a class="text-link" href="/designers">Meet the designers →</a></div><div class="about-signature"><span>2018—2026</span><span>Visual identity</span><span>UI/UX</span><span>Creative direction</span></div></div><div class="about-portrait about-portrait-v2"><img src="${EYAD}" alt="Eyad Mohamed"><div class="portrait-overlay"></div><div class="portrait-tag">EYAD MOHAMED<br><small>ARAB DESIGNERS · FOUNDER</small></div></div></section>
  <section class="section story-grid about-story-v2"><div class="section-label">THE APPROACH</div><div><h2>Clear thinking.<br><span>Strong visuals.</span></h2><p>بدأت رحلتي في التصميم عام 2018، ومن وقتها وأنا أشتغل بين الهوية البصرية، المحتوى الرقمي، الواجهات والتجارب المختلفة. اشتغلت مع استوديوهات وفرق إبداعية متعددة، وركزت في كل تجربة على تحويل الفكرة إلى نظام بصري واضح وقابل للاستخدام.</p><p>Today the focus is simple: composition, typography, contrast, motion and digital interaction — all working together instead of competing for attention.</p><div class="about-facts"><div><strong>01</strong><span>Visual identity systems</span></div><div><strong>02</strong><span>Digital & UI/UX experiences</span></div><div><strong>03</strong><span>Creative direction</span></div></div></div></section>
  <section class="section timeline-modern"><div class="section-label">2018 — 2026</div><div class="timeline-list"><article><b>2018</b><div><h3>The beginning</h3><p>تكوين، ألوان، خطوط وهوية بصرية وبناء أساس قوي في التصميم.</p></div></article><article><b>2019—21</b><div><h3>Studio experience</h3><p>عمل مع استوديوهات وفرق إبداعية متعددة على هويات وحملات ومحتوى.</p></div></article><article><b>2022—24</b><div><h3>Identity + digital</h3><p>الأنظمة البصرية، الواجهات، السوشيال وart direction مع اهتمام أكبر بالتفاصيل.</p></div></article><article><b>2025—26</b><div><h3>Design with direction</h3><p>مشاريع وتجارب تجمع الهوية والاستخدام والحركة والوضوح في تجربة واحدة.</p></div></article></div></section>`);
}

function contact(){
  const params=new URLSearchParams(location.search);
  const designer=(params.get('designer')||'').trim();
  const points=`<div class="contact-points">
        <div><b>Response time</b><span>Usually within 24–48 hours.</span></div>
        <div><b>Delivery</b><span>Sent straight to our Discord from your account.</span></div>
        <div><b>Privacy</b><span>Only visible to the Arab Designers team.</span></div>
      </div>`;
  if(!me){
    shell(`<section class="contact-layout">
      <div class="contact-copy">
        <div class="section-label">GET IN TOUCH</div>
        <h1>Start a<br><span>project.</span></h1>
        <p>${designer?`Send a message about working with <b>@${esc(designer)}</b> — `:'Tell us about your project — '}it goes straight to the Arab Designers Discord, sent from your Discord account.</p>
        ${points}
      </div>
      <div class="contact-form">
        <div class="form-form-head"><span>SIGN IN REQUIRED</span><small>Contact via Discord</small></div>
        <p class="form-note" style="font-size:12px;line-height:1.8;margin:16px 0 20px">Connect your Discord account to send a message. This way the message clearly comes from you — no email needed, and we know exactly who to reply to.</p>
        <a class="btn primary xl full" href="/login.html">Continue with Discord ↗</a>
      </div>
    </section>`);
    return;
  }
  shell(`<section class="contact-layout">
    <div class="contact-copy">
      <div class="section-label">GET IN TOUCH</div>
      <h1>Start a<br><span>project.</span></h1>
      <p>${designer?`Send a message about working with <b>@${esc(designer)}</b> — `:'Tell us about your project — '}it goes straight to the Arab Designers Discord.</p>
      ${points}
    </div>
    <form id="contactForm" class="contact-form">
      <div class="form-form-head"><span>NEW MESSAGE</span><small>Sending as you</small></div>
      <div class="contact-sender"><img src="${esc(safeImage(me.avatar))}" alt=""><div><strong>${esc(me.display_name||me.username)}</strong><span>@${esc(me.username)}</span></div></div>
      <label class="label">Subject</label>
      <input class="input" name="subject" value="${designer?`Project with @${esc(designer)}`:''}" required>
      <label class="label">Message</label>
      <textarea class="textarea" name="message" required placeholder="Tell us about your project…"></textarea>
      <button class="btn primary" type="submit">Send message ↗</button>
      <p class="form-note">Sent directly to the Arab Designers Discord as @${esc(me.username)} — no email needed.</p>
    </form>
  </section>`);
  document.getElementById('contactForm').onsubmit=async e=>{
    e.preventDefault();
    const btn=e.target.querySelector('button[type="submit"]');
    const data=Object.fromEntries(new FormData(e.target));
    const originalLabel=btn.textContent;
    btn.disabled=true;btn.textContent='Sending…';
    try{
      const fields=[
        {name:'From',value:`${me.display_name||me.username} (@${me.username})`,inline:true},
        {name:'Discord ID',value:String(me.id||'—'),inline:true}
      ];
      if(designer)fields.push({name:'About designer',value:'@'+designer,inline:true});
      fields.push({name:'Message',value:String(data.message||'').slice(0,1000)});
      const r=await fetch(DISCORD_WEBHOOK_URL,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({embeds:[{title:data.subject||'New contact form message',color:0x5b8cff,author:{name:`${me.display_name||me.username} (@${me.username})`,icon_url:me.avatar},fields,timestamp:new Date().toISOString()}]})
      });
      if(!r.ok)throw new Error('Could not deliver the message to Discord (status '+r.status+').');
      notify('Message sent — we will get back to you on Discord.');
      e.target.reset();
    }catch(err){
      notify(err.message||'Could not send the message. Try again.');
    }finally{
      btn.disabled=false;btn.textContent=originalLabel;
    }
  };
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
  const badges=renderBadges(u);
  const labels=badgeList(u).map(b=>BADGE_META[b].label);
  const tagline=u.bio?esc(String(u.bio).replace(/\s+/g,' ').slice(0,90)):'Designer profile on Arab Designers.';
  return `<a class="designer-card-v2" href="/profile/${encodeURIComponent(u.username)}">
    <div class="dc-banner ${banner?'':'blank'}" ${banner?`style="background-image:url('${esc(banner)}')"`:''}></div>
    <img class="dc-avatar" src="${esc(safeImage(u.avatar))}" alt="">
    <div class="dc-body">
      <div class="dc-name">${esc(u.display_name||u.username)}${badges?`<span class="badge-row">${badges}</span>`:''}</div>
      <div class="dc-handle">@${esc(u.username)}</div>
      <p class="dc-tagline">${tagline}</p>
      <div class="dc-stats"><span>${labels.length?labels.join(' · '):'◉ Community member'}</span><span>${banner?'Discord banner':'Arab Designers'}</span></div>
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

// ---- Portfolio work: cards, viewer modal, upload modal ----
function workThumb(w){
  if(w.mediaType==='video') return `<video src="${esc(w.mediaUrl)}" muted loop playsinline preload="metadata"></video>`;
  if(w.mediaType==='embed') return `<div class="work-embed-thumb"><span>↗</span><small>${esc(w.mediaLabel||'Embed')}</small></div>`;
  return `<img src="${esc(w.mediaUrl)}" alt="${esc(w.title||'')}" loading="lazy">`;
}
function workCard(w,editable){
  const liked=cloudState.likedWorks?.has(w.id);
  return `<div class="work-card" data-work-id="${esc(w.id)}">
    <button class="work-open" data-open-work="${esc(w.id)}" type="button">
      <span class="work-thumb ${esc(w.mediaType)}">${workThumb(w)}</span>
      <span class="work-overlay"><span>${esc(w.title||'Untitled project')}</span></span>
    </button>
    <div class="work-foot">
      <span class="work-stat" title="Views">👁 ${formatNumber(w.views)}</span>
      <button class="work-like ${liked?'liked':''}" data-like-work="${esc(w.id)}" type="button">${liked?'♥':'♡'} <span>${formatNumber(w.likes)}</span></button>
      ${editable?`<span class="work-edit-actions"><button class="icon-btn" data-move-work="${esc(w.id)}" data-dir="up" type="button" title="Move up">↑</button><button class="icon-btn" data-move-work="${esc(w.id)}" data-dir="down" type="button" title="Move down">↓</button><button class="icon-btn danger" data-delete-work="${esc(w.id)}" type="button" title="Delete">✕</button></span>`:''}
    </div>
  </div>`;
}
function worksSection(profileId,same,displayName){
  const works=(cloudState.works?.[profileId]||[]);
  return `<section class="section works-section"><div class="works-head"><div><div class="section-label">SELECTED WORK</div><h2>${same?'Your projects.':`${esc(displayName)}’s projects.`}</h2></div>${same?'<button class="btn primary" id="addWorkBtn" type="button">+ Add work</button>':''}</div><div class="works-grid" id="worksGrid">${works.length?works.map(w=>workCard(w,same)).join(''):`<div class="empty-state wide"><span>✦</span><h3>No work yet</h3><p>${same?'Add your first project to showcase it on your profile.':'This designer hasn’t published any work yet.'}</p></div>`}</div></section>${modalsMarkup(same)}`;
}
function modalsMarkup(same){
  return `<div class="modal-overlay" id="workViewer"><div class="modal-card wide">
    <div class="modal-head"><h3 id="workViewerTitle"></h3><button class="icon-btn" id="closeWorkViewer" type="button">✕</button></div>
    <div class="work-viewer-media" id="workViewerMedia"></div>
    <p class="work-viewer-desc" id="workViewerDesc"></p>
    <div class="work-viewer-stats"><span id="workViewerViews"></span><button class="work-like lg" id="workViewerLike" type="button"></button></div>
    <div class="comments-section">
      <h4>Comments</h4>
      <div class="comments-list" id="commentsList"><p class="form-note">Loading comments…</p></div>
      ${me?`<form id="commentForm" class="comment-form"><input class="input" name="content" maxlength="500" placeholder="Add a comment…" autocomplete="off" required><button class="btn primary" type="submit">Send</button></form>`:`<p class="form-note">Sign in with Discord to like or comment.</p>`}
    </div>
  </div></div>${same?`<div class="modal-overlay" id="addWorkModal"><div class="modal-card">
    <div class="modal-head"><h3>Add work</h3><button class="icon-btn" id="closeAddWork" type="button">✕</button></div>
    <div class="upload-tabs">
      <button class="upload-tab active" data-upload-tab="file" type="button">Image / Video / GIF</button>
      <button class="upload-tab" data-upload-tab="embed" type="button">Embed link</button>
    </div>
    <form id="addWorkForm">
      <label class="label">Title</label>
      <input class="input" name="title" maxlength="120" placeholder="Project title" required>
      <label class="label">Description <span class="form-note" style="display:inline">(optional)</span></label>
      <textarea class="textarea" name="description" maxlength="400" placeholder="What's this project about?"></textarea>
      <div data-upload-pane="file">
        <label class="label">File</label>
        <input class="input" type="file" name="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime">
        <p class="form-note">Images, GIFs or videos, up to 30MB.</p>
      </div>
      <div data-upload-pane="embed" style="display:none">
        <label class="label">Embed URL</label>
        <input class="input" name="embedUrl" placeholder="https://www.youtube.com/embed/…">
        <p class="form-note">Paste a direct embed link (YouTube/Vimeo "embed" URL, CodePen, Figma, etc).</p>
      </div>
      <button class="btn primary full" type="submit" id="addWorkSubmit">Publish work ↗</button>
    </form>
  </div></div>`:''}`;
}
function findWork(workId){
  for(const list of Object.values(cloudState.works||{})){ const w=list.find(x=>x.id===workId); if(w)return w; }
  return null;
}
function renderWorkMedia(w){
  if(w.mediaType==='video') return `<video src="${esc(w.mediaUrl)}" controls playsinline></video>`;
  if(w.mediaType==='embed') return `<iframe src="${esc(w.mediaUrl)}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" referrerpolicy="no-referrer" allowfullscreen></iframe>`;
  return `<img src="${esc(w.mediaUrl)}" alt="${esc(w.title||'')}">`;
}
function commentRow(c){
  const mine=me&&me.username===c.username;
  return `<div class="comment-row" data-comment-id="${esc(c.id)}"><img src="${esc(safeImage(c.avatar))}" alt=""><div class="comment-body"><div class="comment-head"><strong>${esc(c.display_name||c.username)}</strong><span>${timeAgo(new Date(c.created_at).getTime())}</span></div><p>${esc(c.content)}</p></div>${(mine||isAdmin())?`<button class="icon-btn danger" data-delete-comment="${esc(c.id)}" type="button" title="Delete">✕</button>`:''}</div>`;
}
async function openWorkViewer(workId){
  const w=findWork(workId); if(!w)return;
  const modal=document.getElementById('workViewer'); if(!modal)return;
  document.getElementById('workViewerTitle').textContent=w.title||'Untitled project';
  document.getElementById('workViewerMedia').innerHTML=renderWorkMedia(w);
  document.getElementById('workViewerDesc').textContent=w.description||'';
  document.getElementById('workViewerDesc').style.display=w.description?'':'none';
  document.getElementById('workViewerViews').textContent=`👁 ${formatNumber(w.views)} views`;
  const likeBtn=document.getElementById('workViewerLike');
  const paintLike=()=>{ const liked=cloudState.likedWorks?.has(w.id); likeBtn.innerHTML=`${liked?'♥':'♡'} <span>${formatNumber(w.likes)}</span>`; likeBtn.classList.toggle('liked',!!liked); };
  paintLike();
  likeBtn.onclick=async()=>{
    if(!me){notify('Sign in with Discord to like work.');return}
    const liked=!cloudState.likedWorks?.has(w.id);
    try{
      const r=await cloudCall('like-work',{workId:w.id,liked});
      w.likes=r.likes; if(liked)cloudState.likedWorks.add(w.id); else cloudState.likedWorks.delete(w.id);
      paintLike();
      document.querySelectorAll(`[data-work-id="${w.id}"] [data-like-work]`).forEach(b=>{b.innerHTML=`${liked?'♥':'♡'} <span>${formatNumber(w.likes)}</span>`;b.classList.toggle('liked',liked);});
    }catch(e){notify(e.message||'Could not update like.')}
  };
  const list=document.getElementById('commentsList');
  list.innerHTML='<p class="form-note">Loading comments…</p>';
  modal.classList.add('open');
  cloudCall('view-work',{workId:w.id}).then(r=>{ if(typeof r.views==='number'){w.views=r.views; document.getElementById('workViewerViews').textContent=`👁 ${formatNumber(w.views)} views`;} }).catch(()=>{});
  try{
    const comments=await cloudJson(`${SUPABASE_URL}/rest/v1/work_comments?select=*&work_id=eq.${encodeURIComponent(w.id)}&order=created_at.asc`);
    list.innerHTML=comments.length?comments.map(commentRow).join(''):'<p class="form-note">No comments yet.</p>';
    document.querySelectorAll('[data-delete-comment]').forEach(b=>b.onclick=async()=>{
      try{ await cloudCall('delete-comment',{commentId:b.dataset.deleteComment}); b.closest('[data-comment-id]')?.remove(); }
      catch(e){notify(e.message||'Could not delete comment.')}
    });
  }catch(e){list.innerHTML='<p class="form-note">Could not load comments.</p>';}
  const form=document.getElementById('commentForm');
  if(form)form.onsubmit=async e=>{
    e.preventDefault();
    const content=new FormData(e.target).get('content');
    try{
      const r=await cloudCall('add-comment',{workId:w.id,content});
      if(list.querySelector('.form-note'))list.innerHTML='';
      list.insertAdjacentHTML('beforeend',commentRow(r.comment));
      e.target.reset();
    }catch(err){notify(err.message||'Could not post comment.')}
  };
}
async function uploadWorkFile(file){
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  const mediaType=file.type.startsWith('video/')?'video':'image';
  const workId=uid();
  const up=await cloudCall('work-upload-url',{workId,ext});
  const sb=window.__ARAB_SB;
  if(!sb) throw new Error('Cloud storage is not configured.');
  const {error}=await sb.storage.from('works').uploadToSignedUrl(up.path,up.token,file);
  if(error) throw new Error(error.message||'Upload failed.');
  const {data:pub}=sb.storage.from('works').getPublicUrl(up.path);
  return {workId:up.workId,mediaType,mediaUrl:pub.publicUrl,storagePath:up.path,mediaLabel:mediaType==='video'?'Video':(file.type==='image/gif'?'GIF':'Image')};
}
function wireWorks(profileId,same,displayName){
  document.querySelectorAll('[data-open-work]').forEach(b=>b.onclick=()=>openWorkViewer(b.dataset.openWork));
  document.querySelectorAll('[data-like-work]').forEach(b=>b.onclick=async(e)=>{
    e.stopPropagation();
    const workId=b.dataset.likeWork; const w=findWork(workId); if(!w)return;
    if(!me){notify('Sign in with Discord to like work.');return}
    const liked=!cloudState.likedWorks?.has(workId);
    try{
      const r=await cloudCall('like-work',{workId,liked});
      w.likes=r.likes; if(liked)cloudState.likedWorks.add(workId); else cloudState.likedWorks.delete(workId);
      document.querySelectorAll(`[data-like-work="${workId}"]`).forEach(el=>{el.innerHTML=`${liked?'♥':'♡'} <span>${formatNumber(w.likes)}</span>`;el.classList.toggle('liked',liked);});
    }catch(err){notify(err.message||'Could not update like.')}
  });
  document.getElementById('closeWorkViewer')?.addEventListener('click',()=>document.getElementById('workViewer')?.classList.remove('open'));
  document.getElementById('workViewer')?.addEventListener('click',e=>{ if(e.target.id==='workViewer') e.target.classList.remove('open'); });
  if(!same)return;
  const addBtn=document.getElementById('addWorkBtn');
  const addModal=document.getElementById('addWorkModal');
  addBtn?.addEventListener('click',()=>addModal?.classList.add('open'));
  document.getElementById('closeAddWork')?.addEventListener('click',()=>addModal?.classList.remove('open'));
  addModal?.addEventListener('click',e=>{ if(e.target.id==='addWorkModal') e.target.classList.remove('open'); });
  let activeTab='file';
  document.querySelectorAll('[data-upload-tab]').forEach(t=>t.onclick=()=>{
    activeTab=t.dataset.uploadTab;
    document.querySelectorAll('[data-upload-tab]').forEach(x=>x.classList.toggle('active',x===t));
    document.querySelectorAll('[data-upload-pane]').forEach(p=>p.style.display=p.dataset.uploadPane===activeTab?'':'none');
  });
  const form=document.getElementById('addWorkForm');
  form.onsubmit=async e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const submitBtn=document.getElementById('addWorkSubmit');
    submitBtn.disabled=true; submitBtn.textContent='Publishing…';
    try{
      let payload;
      if(activeTab==='embed'){
        const embedUrl=String(fd.get('embedUrl')||'').trim();
        if(!/^https:\/\//i.test(embedUrl)) throw new Error('Embed URL must start with https://');
        payload={workId:uid(),mediaType:'embed',mediaUrl:embedUrl,mediaLabel:'Embed',storagePath:''};
      }else{
        const file=fd.get('file');
        if(!file||!file.size) throw new Error('Choose a file to upload.');
        if(file.size>31457280) throw new Error('File is larger than 30MB.');
        payload=await uploadWorkFile(file);
      }
      const r=await cloudCall('create-work',{...payload,title:fd.get('title'),description:fd.get('description')});
      const w=r.work;
      (cloudState.works[profileId] ||= []).push({id:w.id,profileId:w.profile_id,title:w.title,description:w.description||'',mediaUrl:w.media_url,mediaType:w.media_type,mediaLabel:w.media_label,storagePath:w.storage_path,views:w.views||0,likes:w.likes||0,createdAt:w.created_at});
      notify('Work published.');
      addModal.classList.remove('open'); form.reset();
      await profile(me.username);
    }catch(err){ notify(err.message||'Could not publish work.'); submitBtn.disabled=false; submitBtn.textContent='Publish work ↗'; }
  };
  document.querySelectorAll('[data-delete-work]').forEach(b=>b.onclick=async(e)=>{
    e.stopPropagation();
    if(!confirm('Delete this work? This cannot be undone.'))return;
    try{
      await cloudCall('delete-work',{workId:b.dataset.deleteWork});
      cloudState.works[profileId]=(cloudState.works[profileId]||[]).filter(w=>w.id!==b.dataset.deleteWork);
      notify('Work deleted.');
      await profile(me.username);
    }catch(err){notify(err.message||'Could not delete work.')}
  });
  document.querySelectorAll('[data-move-work]').forEach(b=>b.onclick=async(e)=>{
    e.stopPropagation();
    const list=cloudState.works[profileId]||[];
    const idx=list.findIndex(w=>w.id===b.dataset.moveWork);
    const dir=b.dataset.dir==='up'?-1:1;
    const swapIdx=idx+dir;
    if(idx<0||swapIdx<0||swapIdx>=list.length)return;
    [list[idx],list[swapIdx]]=[list[swapIdx],list[idx]];
    try{
      await cloudCall('reorder-works',{order:list.map(w=>w.id)});
      await profile(me.username);
    }catch(err){notify(err.message||'Could not reorder work.')}
  });
}

async function profile(username){
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e);}
  const target=username || me?.username || 'designer';
  const same=!!(me && me.username===target);
  const profiles=readProfiles();
  let d=profiles[target];
  if(!d){
    d={username:target,display_name:same?(me.display_name||me.username):target,avatar:same?me.avatar:EYAD,banner:same?me.banner:'',discordBanner:same?me.banner:'',bio:'Designer focused on visual identity and digital experiences.',links:[],connections:[],badges:[]};
  }
  const banner=profileBanner(d);
  setProfileMeta(d,target);
  const works=(cloudState.works?.[d.id]||[]);
  shell(`<section class="profile-shell">
    <div class="profile-cover ${banner?'has-banner':'no-banner'}" ${banner?`style="background-image:url('${esc(banner)}')"`:''}><div class="cover-shade"></div><div class="cover-top"><span>${banner?'DISCORD PROFILE BANNER':'NO DISCORD BANNER'}</span>${same?'<span class="cover-safe">PROFILE HEADER</span>':''}</div></div>
    <div class="profile-main"><div class="profile-heading"><img class="profile-avatar-v2" src="${esc(safeImage(d.avatar))}" alt="${esc(d.display_name||d.username)}"><div class="profile-title"><div class="verified-line"><span class="status-dot"></span> Designer profile <span class="badge-row">${renderBadges(d)}</span></div><h1>${esc(d.display_name||d.username)}</h1><p>@${esc(d.username)}</p></div><div class="profile-actions">${same?'<a class="btn" href="/settings">Edit profile</a>':`<a class="btn primary" href="/messages?designer=${encodeURIComponent(target)}">Contact designer ↗</a>`}</div></div>
      <div class="profile-bio"><p>${esc(d.bio||'Designer focused on visual identity and digital experiences.')}</p><div class="profile-pills"><span>Graphic Design</span><span>UI/UX</span><span>Visual Identity</span><span>Creative Direction</span></div>${socialBadges(d)}</div>
      <div class="profile-stats"><div><strong>${formatNumber(d.views||0)}</strong><span>Profile views</span></div><div><strong>${works.length}</strong><span>Projects</span></div><div><strong>Discord</strong><span>Connected</span></div><div><strong>${d.verified?'Verified':'Open'}</strong><span>Status</span></div></div>
    </div></section>
    ${worksSection(d.id,same,d.display_name||d.username)}`);
  wireWorks(d.id,same,d.display_name||d.username);
  if(!same) cloudCall('view-profile',{username:target}).then(r=>{ if(typeof r.views==='number'){ d.views=r.views; document.querySelector('.profile-stats strong')&&(document.querySelector('.profile-stats strong').textContent=formatNumber(r.views)); } }).catch(()=>{});
  if(works.length) refreshLikedWorks(works.map(w=>w.id)).then(()=>{ document.querySelectorAll('[data-like-work]').forEach(b=>{ const w=findWork(b.dataset.likeWork); if(!w)return; const liked=cloudState.likedWorks.has(w.id); b.innerHTML=`${liked?'♥':'♡'} <span>${formatNumber(w.likes)}</span>`; b.classList.toggle('liked',liked); }); });
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
  if(!r.ok){
    let msg=data.error||data.message||`Cloud action failed (${r.status})`;
    if(r.status===401) msg=`${msg} — the Edge Function is rejecting the request before it runs. In Supabase → Edge Functions → arab-designers-api → Settings, turn OFF "Enforce JWT Verification" (this function checks the Discord token itself), or redeploy with: supabase functions deploy arab-designers-api --no-verify-jwt`;
    throw new Error(msg);
  }
  return data;
}
async function loadCloudState(force=false){
  if(cloudLoaded&&!force)return cloudState;
  requireCloud();
  const [profiles,works]=await Promise.all([
    cloudJson(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=display_name.asc`),
    cloudJson(`${SUPABASE_URL}/rest/v1/works?select=*&order=position.asc,created_at.asc`).catch(()=>[])
  ]);
  const map={};
  profiles.forEach(p=>map[p.username]={
    id:p.id,discord_id:p.discord_id,username:p.username,display_name:p.display_name,avatar:p.avatar||FALLBACK_LOGO,
    banner:p.banner||p.discord_banner||'',discordBanner:p.discord_banner||'',bio:p.bio||'',links:p.links||[],connections:p.connections||[],badges:p.badges||[],verified:!!p.verified,role:p.role||'designer',views:p.views||0
  });
  const worksByProfile={};
  (works||[]).forEach(w=>{
    (worksByProfile[w.profile_id] ||= []).push({id:w.id,profileId:w.profile_id,title:w.title,description:w.description||'',mediaUrl:w.media_url,mediaType:w.media_type,mediaLabel:w.media_label,storagePath:w.storage_path,views:w.views||0,likes:w.likes||0,createdAt:w.created_at});
  });
  cloudState={profiles:map,works:worksByProfile,likedWorks:cloudState.likedWorks||new Set()};
  cloudLoaded=true;return cloudState;
}
async function refreshLikedWorks(workIds){
  if(!me||!workIds.length)return;
  try{
    const r=await cloudCall('liked-works',{workIds});
    cloudState.likedWorks=new Set(r.workIds||[]);
  }catch(e){console.warn('Could not load likes:',e);}
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
  const rows=Object.values(profiles).map(p=>`<div class="admin-row admin-row-card"><div class="admin-user"><img src="${esc(safeImage(p.avatar))}" alt=""><div><strong>${esc(p.display_name||p.username)}</strong><span>@${esc(p.username)}</span></div></div><div class="admin-badges">${renderBadges(p)}</div><div class="admin-actions"><button class="icon-btn" data-verify-user="${esc(p.username)}">${p.verified?'Unverify':'Verify'}</button><button class="icon-btn" data-staff-user="${esc(p.username)}">${p.role==='staff'?'Remove staff':'Make staff'}</button>${TOGGLEABLE_BADGES.map(b=>`<button class="icon-btn" data-badge-user="${esc(p.username)}" data-badge-type="${b}">${hasBadge(p,b)?`Remove ${BADGE_META[b].label}`:`Give ${BADGE_META[b].label}`}</button>`).join('')}</div></div>`).join('');
  shell(`<section class="settings-head admin-page-head"><div><div class="section-label">ADMIN CONTROL</div><h1>Manage the<br><span>community.</span></h1><p>Verify designers and manage Staff badges from the admin account.</p></div><div class="settings-head-actions"><a class="btn" href="/designers">View directory ↗</a><a class="btn" href="/settings">Settings</a></div></section><section class="section admin-dashboard"><div class="admin-dashboard-head"><div><b>${Object.keys(profiles).length}</b><span>registered profiles</span></div><span class="settings-live">ADMIN · i.ixi.</span></div><div class="admin-list">${rows||'<p class="form-note">No designer accounts have joined yet.</p>'}</div></section>`);
  document.querySelectorAll('[data-verify-user],[data-staff-user]').forEach(b=>b.onclick=async()=>{const username=b.dataset.verifyUser||b.dataset.staffUser;const p=profiles[username];const action=b.dataset.verifyUser?'set-verification':'set-staff';try{const r=await cloudCall(action,{username,enabled:b.dataset.verifyUser? !p.verified : p.role!=='staff'});notify(r.message||'Updated');await adminPage();}catch(e){notify(e.message||'Admin action failed')}});
  document.querySelectorAll('[data-badge-user]').forEach(b=>b.onclick=async()=>{const username=b.dataset.badgeUser;const type=b.dataset.badgeType;const p=profiles[username];try{const r=await cloudCall('set-badge',{username,badge:type,enabled:!hasBadge(p,type)});notify(r.message||'Updated');await adminPage();}catch(e){notify(e.message||'Admin action failed')}});
}

async function settings(){
  if(!me){location.href='/login';return}
  try{await loadCloudState();}catch(e){console.warn('Cloud unavailable:',e)}
  const profiles=readProfiles();const d=profiles[me.username]||{username:me.username,display_name:me.display_name||me.username,avatar:me.avatar,banner:me.banner,discordBanner:me.banner,bio:'',links:[],connections:[],badges:[],verified:me.verified,role:me.role};
  const links=Array.isArray(d.links)?d.links:[];
  const connections=Array.isArray(d.connections)?d.connections:[];
  const linksRows=links.map(l=>linkRow(l)).join('');
  const connChips=connections.length?connections.map(c=>{const m=platformMeta(c.type);return `<a class="conn-chip" href="${esc(c.url||'#')}" target="_blank" rel="noopener noreferrer" style="--pc:${m.color}"><b>${esc(m.code)}</b>${esc(c.name||m.label)}</a>`;}).join(''):'<span class="form-note">No linked accounts detected from Discord yet.</span>';
  const adminPanel=isAdmin()?`<section class="settings-card admin-card"><div class="settings-card-head"><div><b>Admin control</b><span>Verification and Staff management.</span></div><span class="settings-live">ADMIN</span></div><p class="form-note">Manage designer verification and Staff badges from the dedicated admin dashboard.</p><a class="btn primary" href="/admin">Open admin dashboard ↗</a></section>`:'';
  shell(`<section class="settings-head"><div><div class="section-label">CREATOR CONTROL</div><h1>Make your profile<br><span>feel like you.</span></h1><p>Your profile identity is stored in the cloud.</p></div><div class="settings-head-actions"><a class="btn" href="/profile/${encodeURIComponent(me.username)}">View profile ↗</a><button class="btn danger" id="logoutBtn" type="button">Log out</button></div></section><section class="settings-layout">
    <form id="profileForm" class="settings-card">
      <div class="settings-card-head"><div><b>Profile identity</b><span>Only your name and bio can be edited here.</span></div><span class="settings-live">CLOUD LIVE</span></div>
      <div class="settings-preview"><img src="${esc(safeImage(d.avatar))}" alt=""><div><strong>${esc(d.display_name||d.username)}</strong><span>@${esc(d.username)}</span></div>${renderBadges(d)?`<span class="badge-row">${renderBadges(d)}</span>`:''}</div>
      <label class="label">Display name</label>
      <input class="input" name="display_name" value="${esc(d.display_name||d.username)}" maxlength="80">
      <label class="label">Bio</label>
      <textarea class="textarea" name="bio" maxlength="1000">${esc(d.bio||'')}</textarea>
      <p class="form-note" style="margin:10px 0 0">Your avatar and banner always follow your Discord account and aren't editable here.</p>
      <div class="links-editor">
        <div class="links-editor-head"><label class="label" style="margin:0">Extra platforms</label><button class="icon-btn" type="button" id="addLinkBtn">+ Add platform</button></div>
        <div id="linkRows">${linksRows}</div>
        <p class="form-note">Add links to Behance, Dribbble, your website or anything else — shown as badges on your profile.</p>
      </div>
      <button class="btn primary" type="submit">Save profile ↗</button>
    </form>
    <div class="settings-side">
      <section class="settings-card connections-card">
        <div class="settings-card-head"><div><b>Linked Discord accounts</b><span>Detected automatically, no setup needed.</span></div><span class="settings-live">AUTO-SYNCED</span></div>
        <div class="conn-chip-list">${connChips}</div>
        <p class="form-note">Link YouTube, X and other accounts under Discord Settings → Connections, then sign in again here to refresh your badges.</p>
      </section>
      ${adminPanel}
    </div>
  </section>`);
  wireLinkEditor();
  document.getElementById('logoutBtn')?.addEventListener('click',logout);
  document.getElementById('profileForm').onsubmit=async e=>{
    e.preventDefault();
    const payload=Object.fromEntries(new FormData(e.target));
    const links=collectLinkRows();
    try{
      const result=await cloudCall('profile-update',{displayName:payload.display_name,bio:payload.bio,links});
      const cp=result?.profile||{};
      saveMe({...me,display_name:cp.display_name||payload.display_name,banner:cp.banner||cp.discord_banner||me.banner,bio:cp.bio||payload.bio,verified:!!cp.verified,role:cp.role||me.role});
      await refreshAfterMutation();
      notify('Profile updated in the cloud');
      await settings();
    }catch(err){notify(err.message||'Could not update profile.')}
  };
  document.querySelectorAll('[data-verify-user],[data-staff-user]').forEach(b=>b.onclick=async()=>{const username=b.dataset.verifyUser||b.dataset.staffUser;const p=profiles[username];const action=b.dataset.verifyUser?'set-verification':'set-staff';try{const r=await cloudCall(action,{username,enabled:b.dataset.verifyUser? !p.verified : p.role!=='staff'});notify(r.message||'Updated');await refreshAfterMutation();await settings();}catch(e){notify(e.message||'Admin action failed')}});
}

async function handleOAuth(){
  const hash=new URLSearchParams(location.hash.slice(1));const token=hash.get('access_token');if(!token)return false;saveToken(token);
  try{
    const r=await fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:'Bearer '+token}});if(!r.ok)throw new Error('oauth');
    const u=await r.json();const avatar=avatarUrl(u);const discordBanner=bannerUrl(u);
    const user={id:u.id,username:u.username,display_name:u.global_name||u.username,avatar,banner:discordBanner,premium_type:u.premium_type||0,hasDiscordBanner:!!u.banner,role:u.username===ADMIN_USERNAME?'admin':'designer',verified:u.username===ADMIN_USERNAME};
    saveMe(user);
    let connections=[];
    try{
      const cr=await fetch('https://discord.com/api/v10/users/@me/connections',{headers:{Authorization:'Bearer '+token}});
      if(cr.ok) connections=mapConnections(await cr.json());
    }catch(ce){console.warn('Could not read Discord connections:',ce);}
    const synced=await cloudCall('sync-profile',{connections});
    if(synced?.profile){saveMe({...user,verified:!!synced.profile.verified,role:synced.profile.role||user.role,banner:synced.profile.banner||synced.profile.discord_banner||user.banner,avatar:synced.profile.avatar||user.avatar});}
    cloudLoaded=false;await loadCloudState(true);history.replaceState({},'',location.pathname+location.search);location.href='/home.html';return true
  }catch(e){console.error(e);notify(e.message||'Cloud/Discord login could not be completed.');return false}
}

if(CLOUD_CONFIGURED && window.supabase?.createClient){window.__ARAB_SB=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});}

async function route(){
  if(await handleOAuth())return;
  const p=location.pathname.replace(/\/+$/,'')||'/';
  if(p==='/'||p==='/index.html'||p==='/home'||p==='/home.html')return await home();
  if(p==='/login'||p==='/login.html')return login();
  if(p==='/about'||p==='/about.html')return about();
  if(p==='/designers'||p==='/designers.html')return await designers();
  if(p==='/works'||p==='/works.html') { await loadCloudState(); return worksPage(); }
  if(p==='/publish'||p==='/publish.html') return await publishPage();
  if(p==='/messages'||p==='/messages.html') return await messagesPage();
  if(p==='/contact'||p==='/contact.html')return contact();
  if(p==='/settings'||p==='/settings.html')return await settings();
  if(p==='/admin'||p==='/admin.html')return await adminPage();
  if(p.startsWith('/profile/'))return await profile(decodeURIComponent(p.split('/').slice(2).join('/')));
  return await home();
}
route().catch(err=>{console.error(err);if(app){const msg=String(err?.message||err||'Unknown error');app.innerHTML=`<main class="auth-page"><section class="auth-card"><div class="section-label">CONNECTION ERROR</div><h1>Cloud connection failed.</h1><p>Supabase is configured, but the site could not load its cloud data.</p><div class="error-box"><strong>Error</strong><code>${esc(msg)}</code></div><p class="form-note">If this says a table is missing, run <code>supabase/schema.sql</code>. If it mentions the function, deploy <code>arab-designers-api</code>. Then refresh.</p><a class="btn primary xl full" href="/home.html">Try again ↗</a></section></main>`}});
