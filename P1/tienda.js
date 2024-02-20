const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = 9090;

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/tiendita.html' : req.url;
  const filePath = path.join(__dirname, url);
  const extension = path.extname(filePath);
  let contentType = 'text/html';

  switch (extension) {
    case '.html':
      contentType = 'text/html';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code == 'ENOENT') {
        // Página no encontrada
        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf8');
        });
      } else {
        // Otro error del servidor
        res.writeHead(500);
        res.end('Error interno del servidor: ' + err.code);
      }
    } else {
      // Archivo encontrado, servir contenido
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

server.listen(PUERTO, () => {
  console.log('Servidor activado! Escuchando en el puerto ' + PUERTO);
});

//_dirname
//ruta absoluta del archivo solicitado (filePath).
//Esto es útil para garantizar que el servidor pueda encontrar y leer correctamente el archivo solicitado, 
//independientemente de la ubicación desde la que se esté ejecutando el servidor.
//implementar puerta trasera