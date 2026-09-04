// Example private proxy for the contact form.
// Deploy this on Cloudflare Workers / Vercel / another server and keep DISCORD_WEBHOOK_URL secret.
// The frontend sends { name, email, type, portfolio, message, channelId, source }.

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const body = await request.json();
    const content = [
      '**New Arab Designers contact request**',
      `**Name:** ${body.name || '—'}`,
      `**Email:** ${body.email || '—'}`,
      `**Type:** ${body.type || '—'}`,
      `**Portfolio:** ${body.portfolio || '—'}`,
      `**Channel ID:** ${body.channelId || '—'}`,
      `**Message:** ${body.message || '—'}`
    ].join('\n');
    const r = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } })
    });
    return new Response(r.ok ? 'ok' : 'discord error', { status: r.ok ? 200 : 502 });
  }
};
