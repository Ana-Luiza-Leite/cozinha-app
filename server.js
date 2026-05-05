import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// Tipos MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // Log das requisições
  console.log(`${req.method} ${req.url}`);

  // Rota raiz redireciona para index.html
  let filePath = req.url === '/' ? '/index.html' : req.url;

  // Remover query string
  filePath = filePath.split('?')[0];

  // Construir caminho completo
  filePath = path.join(__dirname, filePath);

  // Evitar directory traversal
  const realPath = path.resolve(filePath);
  if (!realPath.startsWith(path.resolve(__dirname))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Acesso negado');
    return;
  }

  // Obter extensão do arquivo
  const ext = path.extname(filePath).toLowerCase();

  // Servir arquivo
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Arquivo não encontrado: ${req.url}`);
        console.error(`404: ${req.url}`);
      } else {
        res.writeHead(500);
        res.end('Erro no servidor');
        console.error(err);
      }
    } else {
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
    ✅ Servidor rodando em: http://localhost:${PORT}
    🍽️  Cozinha Inteligente está pronta!
    
    Pressione Ctrl+C para parar o servidor
  `);
});
