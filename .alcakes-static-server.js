const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'frontend');
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
http.createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  if (clean === '/favicon.ico') {
    const fallbackIcon = path.join(root, 'assets', 'images', 'alcakes_logo.png');
    fs.stat(fallbackIcon, (iconErr, iconStat) => {
      if (iconErr || !iconStat.isFile()) {
        res.writeHead(204);
        return res.end();
      }
      res.writeHead(200, {'Content-Type': 'image/png'});
      return fs.createReadStream(fallbackIcon).pipe(res);
    });
    return;
  }
  let file = path.join(root, clean === '/' ? 'index.html' : clean);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  });
}).listen(5500, () => console.log('Frontend em http://localhost:5500'));
