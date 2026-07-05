const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'locales.json');

let locales = [];

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    locales = JSON.parse(raw);
    console.log(`Loaded ${locales.length} locales from ${DATA_FILE}`);
  } catch (err) {
    console.error('Failed to load locales.json:', err.message);
    process.exit(1);
  }
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2) + '\n');
}

function parseURL(reqUrl) {
  const url = new URL(reqUrl, `http://localhost:${PORT}`);
  const segments = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  return { url, segments };
}

function handleAPI(req, res, segments) {
  // GET /api/locales
  if (segments.length === 2 && segments[0] === 'api' && segments[1] === 'locales') {
    return sendJSON(res, 200, locales);
  }

  // GET /api/locales/:code
  if (segments.length === 3 && segments[0] === 'api' && segments[1] === 'locales') {
    const code = segments[2];
    const locale = locales.find(l => l.code === code);
    if (!locale) {
      return sendJSON(res, 404, { error: 'Locale not found', code });
    }
    return sendJSON(res, 200, locale);
  }

  sendJSON(res, 404, { error: 'Not found' });
}

function handleStatic(req, res) {
  // Serve public/index.html for /
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJSON(res, 404, { error: 'Not found' });
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const { segments } = parseURL(req.url);

  if (req.method !== 'GET') {
    sendJSON(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (segments[0] === 'api') {
    handleAPI(req, res, segments);
  } else {
    handleStatic(req, res);
  }
});

loadData();

server.listen(PORT, () => {
  console.log(`Locale Reference server running at http://localhost:${PORT}`);
});
