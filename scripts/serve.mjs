import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const types = {'/index.html': 'text/html; charset=utf-8', '/site.js': 'text/javascript; charset=utf-8', '/style.css': 'text/css; charset=utf-8', '/brand.png': 'image/png', '/release.json': 'application/json'};
const server = createServer(async (request, response) => {
  const path = request.url === '/' ? '/index.html' : request.url;
  if (!Object.hasOwn(types, path)) {response.writeHead(404).end(); return;}
  try {
    const data = await readFile(resolve('dist', '.' + path));
    response.writeHead(200, {
      'Content-Type': types[path],
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'",
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    }).end(data);
  } catch {
    response.writeHead(404).end();
  }
});
server.listen(4417, '127.0.0.1', () => process.stdout.write('Preview http://127.0.0.1:4417\n'));
process.once('SIGTERM', () => server.close());
