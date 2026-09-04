import crypto from 'node:crypto';
import { db } from './db.js';
import { parseCookies, json } from './http.js';
const secret = () => process.env.SESSION_SECRET || 'dev-only-change-me';
export function newId(){return crypto.randomBytes(32).toString('hex');}
export async function currentUser(req,res){
  const sid=parseCookies(req).ad_session; if(!sid) return null;
  const {rows}=await db().query(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=$1 AND s.expires_at>NOW()`,[sid]);
  if(!rows[0]) return null; return rows[0];
}
export async function requireUser(req,res){const u=await currentUser(req,res); if(!u){json(res,401,{error:'Authentication required'});return null;} return u;}
export async function requireAdmin(req,res){const u=await requireUser(req,res); if(!u)return null; const {rows}=await db().query('SELECT 1 FROM admins WHERE lower(email)=lower($1)',[u.email||'']); if(!rows[0]){json(res,403,{error:'Admin access required'});return null;} return u;}
export { secret };
