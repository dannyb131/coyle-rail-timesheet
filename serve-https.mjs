import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'dist');
const port = 4173;

const opts = {
  pfx: fs.readFileSync(path.join(__dirname, 'local-cert.pfx')),
  passphrase: 'password',
};

const types = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

https.createServer(opts, (req, res) => {
  const url = req.url.split('?')[0].split('#')[0];
  const filePath = path.join(dist, url === '/' ? '/index.html' : url);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(dist, 'index.html')));
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`HTTPS server on https://0.0.0.0:${port}`);
});
