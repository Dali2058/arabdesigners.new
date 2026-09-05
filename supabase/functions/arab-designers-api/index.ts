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
const ADMIN_USERNAME = 'i.ixi.'
const ALLOWED_FILE_EXT = ['png','jpg','jpeg','webp','gif','mp4','webm','mov','mp3','wav','ogg','m4a']

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


async function chatTarget(username: string) {
  const { data, error } = await admin.from('profiles')
    .select('id,discord_id,username,display_name,avatar')
    .eq('username', username).limit(1).single()
  if (error || !data) throw new Error('Designer not found')
  return data
}
async function chatSummary(userId: string) {
  const { data, error } = await admin.from('messages')
    .select('sender_id,receiver_id,content,attachment_name,created_at,read_at')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at',{ascending:false}).limit(500)
  if(error) throw error
  const map:any = {}
  for(const m of (data||[])){
    const other=m.sender_id===userId?m.receiver_id:m.sender_id
    if(!map[other]) map[other]={last:m,unread:0}
    if(m.receiver_id===userId && !m.read_at) map[other].unread++
  }
  const ids=Object.keys(map)
  if(!ids.length) return []
  const {data:profiles,error:pe}=await admin.from('profiles').select('discord_id,username,display_name,avatar').in('discord_id',ids)
  if(pe) throw pe
  return (profiles||[]).map((p:any)=>({username:p.username,display_name:p.display_name,avatar:p.avatar,last:map[p.discord_id].last,unread:map[p.discord_id].unread}))
    .sort((a:any,b:any)=>new Date(b.last.created_at).getTime()-new Date(a.last.created_at).getTime())
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

  if (action === 'view-profile') {
    const { data, error } = await admin.rpc('increment_profile_view', { p_username: String(body.username || '') })
    if (error) return json({ error: error.message }, 400)
    return json({ views: Number(data || 0) })
  }

  let user: any
  try { user = await requireDiscord(req) } catch (e) { return json({ error: String(e.message || e) }, 401) }
  let profile = await profileFor(user)


  if (action === 'chat-unread') {
    const { count, error } = await admin.from('messages').select('id',{count:'exact',head:true}).eq('receiver_id', user.id).is('read_at',null)
    if(error) throw error
    return json({ unread: count || 0 })
  }

  if (action === 'chat-list') {
    return json({ conversations: await chatSummary(user.id) })
  }

  if (action === 'chat-history') {
    const target = await chatTarget(String(body.username||''))
    const { data, error } = await admin.from('messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${target.discord_id}),and(sender_id.eq.${target.discord_id},receiver_id.eq.${user.id})`)
      .order('created_at',{ascending:true}).limit(500)
    if(error) throw error
    await admin.from('messages').update({read_at:new Date().toISOString()})
      .eq('receiver_id',user.id).eq('sender_id',target.discord_id).is('read_at',null)
    return json({ profile: target, messages: data||[] })
  }

  if (action === 'chat-send') {
    const target = await chatTarget(String(body.username||''))
    if(target.discord_id===user.id) return json({error:'You cannot message yourself'},400)
    const content=String(body.content||'').slice(0,3000)
    const attachmentUrl=String(body.attachmentUrl||'').slice(0,2000)
    if(!content && !attachmentUrl) return json({error:'Message is empty'},400)
    const {data,error}=await admin.from('messages').insert({
      sender_id:user.id,receiver_id:target.discord_id,content,
      attachment_url:attachmentUrl||null,
      attachment_type:body.attachmentType?String(body.attachmentType).slice(0,100):null,
      attachment_name:body.attachmentName?String(body.attachmentName).slice(0,255):null
    }).select('*').single()
    if(error) throw error
    return json({message:data})
  }

  if (action === 'chat-delete') {
    const messageId = String(body.messageId || '')
    if (!messageId) return json({ error: 'Message ID is required' }, 400)
    const { data: msg, error: me } = await admin.from('messages').select('id,sender_id,attachment_url').eq('id', messageId).single()
    if (me || !msg) return json({ error: 'Message not found' }, 404)
    if (msg.sender_id !== user.id) return json({ error: 'You can only delete your own messages' }, 403)
    if (msg.attachment_url) {
      try {
        const marker = '/storage/v1/object/public/chat/'
        const idx = String(msg.attachment_url).indexOf(marker)
        if (idx >= 0) {
          const path = String(msg.attachment_url).slice(idx + marker.length).split('?')[0]
          if (path) await admin.storage.from('chat').remove([path])
        }
      } catch (_) {}
    }
    const { error } = await admin.from('messages').delete().eq('id', messageId).eq('sender_id', user.id)
    if (error) throw error
    return json({ ok: true })
  }

  if (action === 'chat-upload-url') {
    const target = await chatTarget(String(body.username||''))
    if(target.discord_id===user.id) return json({error:'Invalid recipient'},400)
    const ext=String(body.ext||'bin').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8)||'bin'
    const path=`${user.id}/${crypto.randomUUID()}.${ext}`
    const {data,error}=await admin.storage.from('chat').createSignedUploadUrl(path)
    if(error) throw error
    return json({path,token:data.token})
  }

  if (action === 'sync-profile') {
    if (Array.isArray(body.connections)) {
      const { data, error } = await admin.from('profiles').update({
        connections: body.connections.slice(0, 10),
      }).eq('id', profile.id).select('*').single()
      if (error) throw error
      profile = data
    }
    return json({ profile })
  }

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

  const BADGE_LABELS: Record<string, string> = { early_supporter: 'Early Supporter', booster: 'Booster', partner: 'Partner' }
  if (action === 'set-badge') {
    if (user.username !== 'i.ixi.') return json({ error: 'Admin only' }, 403)
    const target = String(body.username || '')
    const badge = String(body.badge || '')
    if (!target || !Object.keys(BADGE_LABELS).includes(badge)) return json({ error: 'Invalid badge request' }, 400)
    const { data: targetProfile, error: fetchError } = await admin.from('profiles').select('badges').eq('username', target).single()
    if (fetchError) throw fetchError
    let badges: string[] = Array.isArray(targetProfile.badges) ? targetProfile.badges : []
    badges = body.enabled ? (badges.includes(badge) ? badges : [...badges, badge]) : badges.filter((b: string) => b !== badge)
    const { data, error } = await admin.from('profiles').update({ badges }).eq('username', target).select('*').single()
    if (error) throw error
    return json({ profile: data, message: `${BADGE_LABELS[badge]} ${body.enabled ? 'badge enabled.' : 'badge removed.'}` })
  }

  if (action === 'set-verification' || action === 'set-staff') {
    if (user.username !== 'i.ixi.') return json({ error: 'Admin only' }, 403)
    const target = String(body.username || '')
    if (!target) return json({ error: 'Username required' }, 400)
    // Badges are mutually exclusive: a profile shows either Verified or Staff, never both.
    let patch;
    if (action === 'set-verification') {
      patch = body.enabled ? { verified: true } : { verified: false };
      if (body.enabled && target !== 'i.ixi.') patch.role = 'designer'; // clear any Staff badge
    } else {
      patch = body.enabled ? { role: 'staff', verified: false } : { role: 'designer' };
    }
    const { data, error } = await admin.from('profiles').update(patch).eq('username', target).select('*').single()
    if (error) throw error
    return json({ profile: data, message: action === 'set-verification' ? (data.verified ? 'Designer verified.' : 'Verification removed.') : (data.role === 'staff' ? 'Staff badge enabled (other badges cleared).' : 'Staff badge removed.') })
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

  // ---- Portfolio work: upload, create, edit, delete, reorder ----

  if (action === 'work-upload-url') {
    const ext = String(body.ext || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!ALLOWED_FILE_EXT.includes(ext)) return json({ error: 'Unsupported file type' }, 400)
    const workId = String(body.workId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || crypto.randomUUID()
    const mediaId = String(body.mediaId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'cover'
    const path = `${profile.id}/${workId}/${mediaId}.${ext}`
    const { data, error } = await admin.storage.from('works').createSignedUploadUrl(path)
    if (error) return json({ error: error.message }, 400)
    return json({ path, token: data.token, workId })
  }

  if (action === 'create-work') {
    const { count } = await admin.from('works').select('id', { count: 'exact', head: true }).eq('profile_id', profile.id)
    if ((count || 0) >= 100) return json({ error: 'Work limit reached (100 projects per profile).' }, 400)

    const mediaType = String(body.mediaType || '')
    if (!['image', 'video', 'embed'].includes(mediaType)) return json({ error: 'Invalid media type' }, 400)
    const mediaUrl = String(body.mediaUrl || '').trim()
    if (mediaType === 'embed' ? !/^https:\/\//i.test(mediaUrl) : !mediaUrl) {
      return json({ error: mediaType === 'embed' ? 'Embed URL must start with https://' : 'Missing uploaded file URL' }, 400)
    }

    const { data: maxRow } = await admin.from('works').select('position').eq('profile_id', profile.id)
      .order('position', { ascending: false }).limit(1).maybeSingle()
    const nextPosition = (maxRow?.position ?? -1) + 1
    const workId = String(body.workId || crypto.randomUUID()).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || crypto.randomUUID()

    const { data, error } = await admin.from('works').insert({
      id: workId,
      profile_id: profile.id,
      title: String(body.title || 'Untitled project').slice(0, 120),
      description: String(body.description || '').slice(0, 400),
      category: String(body.category || '').slice(0, 60) || null,
      tags: Array.isArray(body.tags) ? body.tags.map((x: unknown) => String(x).trim().slice(0, 40)).filter(Boolean).slice(0, 10) : [],
      tools: String(body.tools || '').slice(0, 200) || null,
      media_url: mediaUrl,
      media_type: mediaType,
      media_label: String(body.mediaLabel || (mediaType === 'embed' ? 'Embed' : 'Image')).slice(0, 40),
      storage_path: String(body.storagePath || ''),
      position: nextPosition,
    }).select('*').single()
    if (error) throw error
    return json({ work: data })
  }

  if (action === 'create-work-block') {
    const workId = String(body.workId || '')
    const { data: w, error: fe } = await admin.from('works').select('profile_id').eq('id', workId).single()
    if (fe || !w) return json({ error: 'Work not found' }, 404)
    if (w.profile_id !== profile.id && user.username !== ADMIN_USERNAME) return json({ error: 'Not allowed' }, 403)
    const type = String(body.blockType || '')
    if (!['image','video','audio','embed','text'].includes(type)) return json({ error: 'Invalid block type' }, 400)
    const { data: maxRow } = await admin.from('work_blocks').select('position').eq('work_id', workId)
      .order('position', { ascending: false }).limit(1).maybeSingle()
    const position = (maxRow?.position ?? -1) + 1
    const { data, error } = await admin.from('work_blocks').insert({
      id: crypto.randomUUID(), work_id: workId, block_type: type,
      media_url: String(body.mediaUrl || ''), storage_path: String(body.storagePath || ''),
      content: String(body.content || '').slice(0, 10000), caption: String(body.caption || '').slice(0, 300),
      layout: ['full','half'].includes(String(body.layout)) ? String(body.layout) : 'full',
      gap: Math.max(0, Math.min(200, Number(body.gap || 16))),
      position
    }).select('*').single()
    if (error) throw error
    return json({ block: data })
  }

  if (action === 'list-work-blocks') {
    const workId = String(body.workId || '')
    const { data, error } = await admin.from('work_blocks').select('*').eq('work_id', workId).order('position', { ascending: true })
    if (error) throw error
    return json({ blocks: data || [] })
  }

  if (action === 'delete-work-block') {
    const blockId = String(body.blockId || '')
    const { data: b, error: fe } = await admin.from('work_blocks').select('id,work_id,storage_path').eq('id', blockId).single()
    if (fe || !b) return json({ error: 'Block not found' }, 404)
    const { data: w, error: we } = await admin.from('works').select('profile_id').eq('id', b.work_id).single()
    if (we || !w) return json({ error: 'Work not found' }, 404)
    if (w.profile_id !== profile.id && user.username !== ADMIN_USERNAME) return json({ error: 'Not allowed' }, 403)
    if (b.storage_path) await admin.storage.from('works').remove([b.storage_path])
    const { error } = await admin.from('work_blocks').delete().eq('id', blockId)
    if (error) throw error
    return json({ ok: true })
  }

  if (action === 'update-work') {
    const workId = String(body.workId || '')
    const { data: w, error: fe } = await admin.from('works').select('profile_id').eq('id', workId).single()
    if (fe || !w) return json({ error: 'Work not found' }, 404)
    if (w.profile_id !== profile.id && user.username !== ADMIN_USERNAME) return json({ error: 'Not allowed' }, 403)
    const { data, error } = await admin.from('works').update({
      title: String(body.title || 'Untitled project').slice(0, 120),
      description: String(body.description || '').slice(0, 400),
    }).eq('id', workId).select('*').single()
    if (error) throw error
    return json({ work: data })
  }

  if (action === 'admin-list-works') {
    if (user.username !== ADMIN_USERNAME) return json({ error: 'Admin only' }, 403)
    const { data, error } = await admin.from('works')
      .select('id,profile_id,title,description,category,tags,tools,media_url,media_type,media_label,storage_path,views,likes,position,created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error
    const ids = [...new Set((data || []).map((w: any) => w.profile_id).filter(Boolean))]
    let profiles: any[] = []
    if (ids.length) {
      const r = await admin.from('profiles').select('id,username,display_name,avatar').in('id', ids)
      if (r.error) throw r.error
      profiles = r.data || []
    }
    const pm = Object.fromEntries(profiles.map((p: any) => [p.id, p]))
    return json({ works: (data || []).map((w: any) => ({ ...w, profile: pm[w.profile_id] || null })) })
  }

  if (action === 'delete-work') {
    const workId = String(body.workId || '')
    const { data: w, error: fe } = await admin.from('works').select('profile_id,storage_path').eq('id', workId).single()
    if (fe || !w) return json({ error: 'Work not found' }, 404)
    if (w.profile_id !== profile.id && user.username !== ADMIN_USERNAME) return json({ error: 'Not allowed' }, 403)
    if (w.storage_path) { await admin.storage.from('works').remove([w.storage_path]).catch(() => {}) }
    const { data: blocks } = await admin.from('work_blocks').select('storage_path').eq('work_id', workId)
    const blockPaths = (blocks || []).map((b: any) => b.storage_path).filter(Boolean)
    if (blockPaths.length) await admin.storage.from('works').remove(blockPaths).catch(() => {})
    const { error: blockError } = await admin.from('work_blocks').delete().eq('work_id', workId)
    if (blockError) throw blockError
    const { error } = await admin.from('works').delete().eq('id', workId)
    if (error) throw error
    return json({ ok: true })
  }

  if (action === 'reorder-works') {
    const order = Array.isArray(body.order) ? body.order.map(String) : []
    const { data: rows, error: fe } = await admin.from('works').select('id').eq('profile_id', profile.id)
    if (fe) throw fe
    const owned = new Set((rows || []).map((r: any) => r.id))
    const filtered = order.filter((id: string) => owned.has(id))
    for (let i = 0; i < filtered.length; i++) {
      await admin.from('works').update({ position: i }).eq('id', filtered[i])
    }
    return json({ ok: true })
  }

  // ---- Comments (per work) ----

  if (action === 'add-comment') {
    const content = String(body.content || '').trim().slice(0, 500)
    if (!content) return json({ error: 'Comment cannot be empty' }, 400)
    const workId = String(body.workId || '')
    const { data, error } = await admin.from('work_comments').insert({
      work_id: workId,
      discord_id: user.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar: profile.avatar,
      content,
    }).select('*').single()
    if (error) throw error
    return json({ comment: data })
  }

  if (action === 'delete-comment') {
    const commentId = String(body.commentId || '')
    const { data: c, error: fe } = await admin.from('work_comments').select('discord_id').eq('id', commentId).single()
    if (fe || !c) return json({ error: 'Comment not found' }, 404)
    if (c.discord_id !== user.id && user.username !== ADMIN_USERNAME) return json({ error: 'Not allowed' }, 403)
    const { error } = await admin.from('work_comments').delete().eq('id', commentId)
    if (error) throw error
    return json({ ok: true })
  }

  if (action === 'liked-works') {
    const ids = Array.isArray(body.workIds) ? body.workIds.map(String) : []
    let q = admin.from('work_likes').select('work_id').eq('discord_id', user.id)
    if (ids.length) q = q.in('work_id', ids)
    const { data, error } = await q
    if (error) throw error
    return json({ workIds: (data || []).map((r: any) => r.work_id) })
  }

  return json({ error: 'Unknown action' }, 400)
}

Deno.serve(async req => {
  try { return await handle(req) }
  catch (e) { console.error(e); return json({ error: String(e?.message || e) }, 500) }
})
