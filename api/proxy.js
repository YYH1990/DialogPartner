const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const apiKey = req.headers['x-api-key'] || '';
  const ver = req.headers['anthropic-version'] || '2023-06-01';

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    const options = {
      hostname: 'api.minimaxi.chat',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'anthropic-version': ver,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', chunk => { data += chunk; });
      proxyRes.on('end', () => {
        res.status(proxyRes.statusCode).json(JSON.parse(data));
      });
    });

    proxyReq.on('error', (e) => {
      res.status(502).json({ error: e.message });
    });

    proxyReq.write(body);
    proxyReq.end();
  });
};
