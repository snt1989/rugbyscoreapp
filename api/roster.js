// Vercel Serverless Function: メンバー表の画像を Claude で読み取る
// 環境変数 ANTHROPIC_API_KEY が必要です(任意: ANTHROPIC_MODEL)。
const PROMPT = '添付の画像は、ラグビーの試合のメンバー表です(選手名簿、または記録用紙のメンバー欄)。背番号1〜23の選手を読み取り、JSONだけで返してください。\nチームが1つだけ写っていても、ホーム(左)とアウェイ(右)の2チームが写っていても、次の形式で、写っているチームの数だけ入れてください。\n{"teams":[{"side":"home か away か unknown","team":"チーム名(書かれていれば。なければ空文字)","players":[{"no":背番号(数字),"name":"苗字 名前","grade":"学年(数字だけ。なければ空文字)","fr":フロントロー適合の○が付いていればtrue,"cap":ゲームキャプテンの印(背番号を丸で囲むなど)があればtrue}]}]}\n記録用紙では、左の表がHome、右の表がAwayです。読めない文字は推測せず、その項目を空にしてください。画像にない選手を作らないでください。苗字と名前の間は半角スペース1つにしてください。画像が複数あるときは、すべてをまとめて読み取ってください。JSON以外の文字は出力しないでください。';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(501).json({ error: 'no_api_key' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const imgs = body && Array.isArray(body.images) ? body.images.slice(0, 3) : [];
  if (!imgs.length) return res.status(400).json({ error: 'no_image' });
  const content = [];
  for (const im of imgs) {
    const data = im && typeof im.data === 'string' ? im.data : '';
    if (!data || data.length > 3.2e6 || !/^[A-Za-z0-9+/=]+$/.test(data)) return res.status(400).json({ error: 'bad_image' });
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } });
  }
  content.push({ type: 'text', text: PROMPT });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 4000, messages: [{ role: 'user', content }] }),
    });
    if (r.status === 429) return res.status(429).json({ error: 'rate_limited' });
    if (!r.ok) return res.status(502).json({ error: 'upstream', status: r.status });
    const j = await r.json();
    const text = (j.content || []).map(c => c.text || '').join('');
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return res.status(422).json({ error: 'invalid_json' });
    return res.status(200).json({ result: JSON.parse(m[0]) });
  } catch (e) {
    return res.status(500).json({ error: 'server' });
  }
};
