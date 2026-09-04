import { db } from '../../lib/db.js';
import { parseCookies, clearCookie, json } from '../../lib/http.js';
export default async function handler(req,res){ const sid=parseCookies(req).ad_session; if(sid) await db().query('DELETE FROM sessions WHERE id=$1',[sid]); clearCookie(res,'ad_session'); json(res,200,{ok:true}); }
