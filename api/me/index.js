import { currentUser } from '../../lib/auth.js';
import { json } from '../../lib/http.js';
export default async function handler(req,res){ const u=await currentUser(req,res); json(res,200,{authenticated:!!u,user:u?{id:u.id,discordId:u.discord_id,username:u.username,displayName:u.display_name,avatar:u.avatar,banner:u.banner,bio:u.bio,verified:u.verification_status==='verified'}:null}); }
