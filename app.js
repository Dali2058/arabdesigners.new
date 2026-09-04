async function submitTicket(payload){
  if(!DISCORD_WEBHOOK_URL) return false;

  const embed = {
    title: '📩 New Contact Request',
    description: 'A new request was submitted from Arab Designers.',
    color: 0x5865F2,

    fields: [
      {
        name: '👤 Name',
        value: String(payload.name || 'Not provided').slice(0, 1024),
        inline: true
      },
      {
        name: '📧 Email',
        value: String(payload.email || 'Not provided').slice(0, 1024),
        inline: true
      },
      {
        name: '📁 Request Type',
        value: String(payload.type || 'Other').slice(0, 1024),
        inline: true
      },
      {
        name: '🌐 Portfolio / Website',
        value: String(payload.portfolio || 'Not provided').slice(0, 1024),
        inline: false
      },
      {
        name: '💬 Message',
        value: String(payload.message || 'No message').slice(0, 4000),
        inline: false
      }
    ],

    footer: {
      text: 'Arab Designers • Contact System'
    },

    timestamp: new Date().toISOString()
  };

  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'Arab Designers',
      embeds: [embed],
      allowed_mentions: {
        parse: []
      }
    })
  });

  if(!response.ok){
    const errorText = await response.text().catch(() => '');
    console.error('Discord webhook error:', response.status, errorText);
    throw new Error('Discord webhook failed');
  }

  return true;
}
