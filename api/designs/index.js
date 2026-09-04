import { db } from '../../lib/db.js';
import { body, json } from '../../lib/http.js';
import { requireUser } from '../../lib/auth.js';
export default async function handler(req,res){
 const u=req.method==='POST'?await requireUser(req,res):null;if(req.method==='POST'&&!u)return;
 if(req.method==='POST'){const b=await body(req); if(!b.title||!b.image)return json(res,400,{error:'Title and image URL are required.'}); const r=await db().query('INSERT INTO designs(user_id,title,image) VALUES($1,$2,$3) RETURNING *',[u.id,String(b.title).slice(0,180),String(b.image).slice(0,2000)]);return json(res,201,{design:r.rows[0]});}
 if(req.method==='GET'){const r=await db().query(`SELECT d.*,u.username,u.display_name,u.avatar,u.verification_status FROM designs d JOIN users u ON u.id=d.user_id ORDER BY d.created_at DESC LIMIT 30`);return json(res,200,{designs:r.rows});}
 json(res,405,{error:'Method not allowed'});
}
