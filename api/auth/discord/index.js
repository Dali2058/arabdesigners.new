import crypto from 'node:crypto';
import { setCookie } from '../../../lib/http.js';
export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).end();
  const state=crypto.randomBytes(24).toString('hex');
  setCookie(res,'ad_oauth_state',state,{maxAge:600});
  const p=new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID||'',redirect_uri:process.env.DISCORD_REDIRECT_URI||'',response_type:'code',scope:'identify email'});
  p.set('state',state);
  res.writeHead(302,{Location:`https://discord.com/oauth2/authorize?${p}`});res.end();
}
