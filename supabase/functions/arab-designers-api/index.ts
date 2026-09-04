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
const BUCKET = 'works'
const MAX_BYTES = 30 * 1024 * 1024

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders })
}

function extFor(filename: string, contentType: string) {
  const fromName = filename.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]
  if (fromName && ['png','jpg','jpeg','webp','gif','mp4','webm','mov'].includes(fromName)) return fromName === 'jpg' ? 'jpeg' : fromName
  const map: Record<string,string> = {
    'image/png':'png','image/jpeg':'jpeg','image/webp':'webp','image/gif':'gif',
    'video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov'
  }
  return map[contentType] || 'bin'
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

  if (action === 'create-upload') {
    const size = Number(body.size || 0)
    const contentType = String(body.contentType || '')
    const filename = String(body.filename || 'work')
    const allowed = new Set(['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
    if (!allowed.has(contentType)) return json({ error: 'Unsupported file type' }, 400)
    if (!size || size > MAX_BYTES) return json({ error: 'File is larger than 30 MB' }, 400)
    const ext = extFor(filename, contentType)
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`
    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false })
    if (error) throw error
    return json({ path, token: data.token })
  }

  if (action === 'publish-work') {
    const id = String(body.id || crypto.randomUUID())
    const title = String(body.title || 'Untitled project').slice(0, 140)
    const mediaUrl = String(body.mediaUrl || '')
    const mediaType = body.mediaType === 'video' ? 'video' : 'image'
    const mediaLabel = String(body.mediaLabel || (mediaType === 'video' ? 'Video' : 'Image')).slice(0, 30)
    const storagePath = String(body.storagePath || '')
    if (!mediaUrl || !storagePath || !storagePath.startsWith(`${user.id}/`)) return json({ error: 'Invalid media' }, 400)

    const { data: existing } = await admin.from('works').select('*').eq('id', id).maybeSingle()
    if (existing && existing.profile_id !== profile.id) return json({ error: 'Not allowed' }, 403)

    const row = {
      id,
      profile_id: profile.id,
      title,
      media_url: mediaUrl,
      media_type: mediaType,
      media_label: mediaLabel,
      storage_path: storagePath,
    }
    const { data, error } = await admin.from('works').upsert(row).select('*').single()
    if (error) throw error

    if (existing?.storage_path && existing.storage_path !== storagePath) {
      await admin.storage.from(BUCKET).remove([existing.storage_path])
    }
    return json({ work: data })
  }

  if (action === 'delete-work') {
    const id = String(body.workId || '')
    const { data: work, error: getError } = await admin.from('works').select('*').eq('id', id).maybeSingle()
    if (getError) throw getError
    if (!work) return json({ ok: true })
    if (work.profile_id !== profile.id) return json({ error: 'Not allowed' }, 403)
    const { error } = await admin.from('works').delete().eq('id', id)
    if (error) throw error
    if (work.storage_path) await admin.storage.from(BUCKET).remove([work.storage_path])
    return json({ ok: true })
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
