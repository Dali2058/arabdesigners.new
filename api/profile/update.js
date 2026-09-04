import { db } from '../../lib/db.js';
import { body, json } from '../../lib/http.js';
import { requireUser } from '../../lib/auth.js';
const platforms=['YouTube','X','Instagram','TikTok','Behance','GitHub','Dribbble','LinkedIn'];
export default async function handler(req,res){const u=await requireUser(req,res);if(!u)return;if(req.method!=='PUT')return json(res,405,{error:'Method not allowed'});const b=await body(req);const bio=String(b.bio||'').slice(0,500),banner=String(b.banner||'').slice(0,1000);await db().query('UPDATE users SET bio=$1,banner=COALESCE(NULLIF($2,\'\'),banner),updated_at=NOW() WHERE id=$3',[bio,banner,u.id]);if(Array.isArray(b.socialLinks)){for(const x of b.socialLinks){if(platforms.includes(x.platform)&&/^https?:\/\//i.test(x.url||'')) await db().query(`INSERT INTO social_links(user_id,platform,url) VALUES($1,$2,$3) ON CONFLICT(user_id,platform) DO UPDATE SET url=EXCLUDED.url`,[u.id,x.platform,String(x.url).slice(0,500)]);}}json(res,200,{ok:true});}
