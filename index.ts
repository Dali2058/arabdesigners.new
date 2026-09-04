import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SECRET_KEYS = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}')
const SERVICE_KEY = SECRET_KEYS.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const DISCORD_API = 'https://discord.com/api/v10'

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders })
}


async function discordUser(token: string) {
  const r = await fetch(`${DISCORD_API}/users/@me`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error('Discord authorization failed')
  return await r.json()
}

async function requireDiscord(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) throw new Error('Missing Discord token')
  return await discordUser(token)
}

async function profileFor(u: any) {
  const avatar = u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${String(u.avatar).startsWith('a_') ? 'gif' : 'png'}?size=256`
    : null
  const banner = u.banner
    ? `https://cdn.discordapp.com/banners/${u.id}/${u.banner}.${String(u.banner).startsWith('a_') ? 'gif' : 'png'}?size=2048`
    : null
  const { data, error } = await admin.from('profiles').upsert({
    discord_id: u.id,
    username: u.username,
    display_name: u.global_name || u.username,
    avatar,
    discord_banner: banner,
    role: u.username === 'i.ixi.' ? 'admin' : undefined,
    verified: u.username === 'i.ixi.' ? true : undefined,
  }, { onConflict: 'discord_id' }).select('*').single()
  if (error) throw error
  return data
}

async function handle(req: Request) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)
  const body = await req.json().catch(() => ({}))
  const action = body.action

  if (action === 'view-work') {
    const { data, error } = await admin.rpc('increment_work_view', { p_work_id: String(body.workId || '') })
    if (error) return json({ error: error.message }, 400)
    return json({ views: Number(data || 0) })
  }

  let user: any
  try { user = await requireDiscord(req) } catch (e) { return json({ error: String(e.message || e) }, 401) }
  let profile = await profileFor(user)

  if (action === 'sync-profile') return json({ profile })

  if (action === 'profile-update') {
    const { data, error } = await admin.from('profiles').update({
      display_name: String(body.displayName || profile.display_name).slice(0, 80),
      bio: String(body.bio || '').slice(0, 1000),
      banner: String(body.banner || profile.discord_banner || '').slice(0, 1000),
      links: Array.isArray(body.links) ? body.links.slice(0, 10) : profile.links,
    }).eq('id', profile.id).select('*').single()
    if (error) throw error
    return json({ profile: data })
  }

  if (action === 'set-verification' || action === 'set-staff') {
    if (user.username !== 'i.ixi.') return json({ error: 'Admin only' }, 403)
    const target = String(body.username || '')
    if (!target) return json({ error: 'Username required' }, 400)
    const patch = action === 'set-verification' ? { verified: !!body.enabled } : { role: body.enabled ? 'staff' : 'designer' }
    const { data, error } = await admin.from('profiles').update(patch).eq('username', target).select('*').single()
    if (error) throw error
    return json({ profile: data, message: action === 'set-verification' ? (data.verified ? 'Designer verified.' : 'Verification removed.') : (data.role === 'staff' ? 'Staff badge enabled.' : 'Staff badge removed.') })
  }

  if (action === 'like-work') {
    const id = String(body.workId || '')
    const wantLiked = !!body.liked
    if (wantLiked) {
      const { error } = await admin.from('work_likes').upsert({ work_id: id, discord_id: user.id }, { onConflict: 'work_id,discord_id', ignoreDuplicates: true })
      if (error) throw error
    } else {
      const { error } = await admin.from('work_likes').delete().eq('work_id', id).eq('discord_id', user.id)
      if (error) throw error
    }
    const { count, error: countError } = await admin.from('work_likes').select('*', { count: 'exact', head: true }).eq('work_id', id)
    if (countError) throw countError
    const { error: updateError } = await admin.from('works').update({ likes: count || 0 }).eq('id', id)
    if (updateError) throw updateError
    return json({ liked: wantLiked, likes: count || 0 })
  }

  return json({ error: 'Unknown action' }, 400)
}

Deno.serve(async req => {
  try { return await handle(req) }
  catch (e) { console.error(e); return json({ error: String(e?.message || e) }, 500) }
})
