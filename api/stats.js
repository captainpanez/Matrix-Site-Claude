const BOT_ID = '870549049684660294';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const r = await fetch(`https://top.gg/api/bots/${BOT_ID}`, {
      headers: { Authorization: process.env.TOPGG_TOKEN || '' },
    });

    if (!r.ok) throw new Error(`top.gg responded with ${r.status}`);

    const bot = await r.json();

    // Cache for 5 minutes on the CDN edge
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.json({
      servers:  bot.server_count   ?? 0,
      votes:    bot.monthly_points ?? 0,
      // member_count and commands_run require your own bot API —
      // add them here once you have an endpoint e.g.:
      // const bot2 = await fetch('https://your-bot-api/stats').then(r => r.json());
      // members:  bot2.member_count  ?? 0,
      // commands: bot2.commands_run  ?? 0,
    });
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
}
