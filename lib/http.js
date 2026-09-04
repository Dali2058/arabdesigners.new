export function json(res, status, data) { res.status(status).setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(data)); }
export function parseCookies(req) { const out={}; for (const part of (req.headers.cookie||'').split(';')) { const i=part.indexOf('='); if(i>0) out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1)); } return out; }
export function setCookie(res,name,value,opts={}) { const attrs=[`${name}=${encodeURIComponent(value)}`,`Path=${opts.path||'/'}`,'HttpOnly','SameSite=Lax']; if(opts.maxAge!=null) attrs.push(`Max-Age=${opts.maxAge}`); if(opts.secure!==false) attrs.push('Secure'); res.setHeader('Set-Cookie',attrs.join('; ')); }
export function clearCookie(res,name){setCookie(res,name,'',{maxAge:0});}
export async function body(req){ if(req.method==='GET') return {}; let raw=''; for await (const c of req) raw+=c; try{return JSON.parse(raw||'{}')}catch{return {}} }
