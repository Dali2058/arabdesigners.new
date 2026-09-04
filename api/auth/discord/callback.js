import crypto from 'node:crypto';
import { db } from '../../../lib/db.js';
import { parseCookies, setCookie } from '../../../lib/http.js';
import { newId } from '../../../lib/auth.js';
export default async function handler(req,res){
 try{
  const url=new URL(req.url,`https://${req.headers.host}`), code=url.searchParams.get('code'), state=url.searchParams.get('state');
  if(!code||!state||state!==parseCookies(req).ad_oauth_state) return res.status(400).send('Invalid OAuth state.');
  const token=await fetch('https://discord.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID,client_secret:process.env.DISCORD_CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:process.env.DISCORD_REDIRECT_URI})});
  const td=await token.json(); if(!token.ok) throw new Error(td.error_description||'OAuth token exchange failed');
  const ur=await fetch('https://discord.com/api/users/@me',{headers:{Authorization:`Bearer ${td.access_token}`}}); const d=await ur.json(); if(!ur.ok) throw new Error('Discord user request failed');
  const avatar=d.avatar?`https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png?size=256`:null;
  const banner=d.banner?`https://cdn.discordapp.com/banners/${d.id}/${d.banner}.png?size=1024`:null;
  const display=d.global_name||d.username;
  const q=await db().query(`INSERT INTO users(discord_id,username,display_name,avatar,banner,email) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(discord_id) DO UPDATE SET username=EXCLUDED.username,display_name=EXCLUDED.display_name,avatar=EXCLUDED.avatar,banner=EXCLUDED.banner,email=EXCLUDED.email,updated_at=NOW() RETURNING id`,[d.id,d.username,display,avatar,banner,d.email||null]);
  const sid=newId(); await db().query(`INSERT INTO sessions(id,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 days')`,[sid,q.rows[0].id]);
  setCookie(res,'ad_session',sid,{maxAge:60*60*24*30});
  res.writeHead(302,{Location:'/home'});res.end();
 }catch(e){console.error(e);res.status(500).send('Authentication failed. Check server configuration.');}
}
