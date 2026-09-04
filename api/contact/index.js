import { db } from '../../lib/db.js';
import { body, json } from '../../lib/http.js';
import { currentUser } from '../../lib/auth.js';
const TYPES=new Set(['Apply Designer','Partnership','Contact Staff','Technical Support','Report','Other']);
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 try{const u=await currentUser(req,res); const b=await body(req); if(!TYPES.has(b.type)||!b.message?.trim())return json(res,400,{error:'Please complete the required fields.'});
  const email=String(b.email||'').trim().slice(0,200), message=String(b.message).trim().slice(0,2000), portfolio=String(b.portfolio||'').trim().slice(0,500);
  const r=await db().query(`INSERT INTO contact_requests(user_id,type,email,message,portfolio) VALUES($1,$2,$3,$4,$5) RETURNING id,created_at`,[u?.id||null,b.type,email,message,portfolio]);
  if(process.env.DISCORD_WEBHOOK_URL){
   const embed={title:'Arab Designers',description:'New Contact Request',color:0x3b45ff,url:process.env.SITE_URL||'http://arabdesigners.ddns.net/home',thumbnail:{url:'https://i.postimg.cc/FFT9tnKW/banner.png'},image:{url:'https://i.postimg.cc/FFT9tnKW/banner.png'},fields:[{name:'Type',value:b.type,inline:true},{name:'User',value:u?`@${u.username}`:'Guest',inline:true},{name:'Discord ID',value:u?.discord_id||'Not logged in',inline:true},{name:'Email',value:email||'Not provided',inline:false},{name:'Message',value:message.slice(0,1024),inline:false},{name:'Portfolio',value:portfolio||'Not provided',inline:false}],timestamp:new Date().toISOString(),footer:{text:'Arab Designers'}};
   await fetch(process.env.DISCORD_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[embed]})});
  }
  json(res,201,{ok:true,id:r.rows[0].id});
 }catch(e){console.error(e);json(res,500,{error:'Could not submit request.'});}
}
