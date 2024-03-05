const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const PUERTO = 9090;


//-- Leer el fichero JSON
tienda_json = fs.readFileSync('/home/alumnos/mccampos/LTAW/LTAW-Practicas/P2/tienda.json', 'utf-8');
//-- Crear la estructura tienda a partir del contenido del fichero
tienda = JSON.parse(tienda_json);
//-- Mostrar informacion sobre la tienda
console.log("Productos en la tienda: " + tienda.productos.length);

//----------------------
const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/tienda.html' : req.url;
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
      case '.json':
      contentType = 'application/json'; // Ajusta el tipo de contenido para el archivo JSON
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
        // Página no encontrada, rata bañandose
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


// Define una ruta para obtener el archivo JSON
//app.get('/tienda', (req, res) => {
//  const tienda_json = fs.readFileSync('/home/alumnos/mccampos/LTAW/LTAW-Practicas/P2/tienda.json', 'utf-8');
//  const tienda = JSON.parse(tienda_json);
//  res.json(tienda);
//});

server.listen(PUERTO, () => {
  console.log('Servidor activado! Escuchando en el puerto ' + PUERTO);
});

//_dirname
//ruta absoluta del archivo solicitado (filePath).
//Esto es útil para garantizar que el servidor pueda encontrar y leer correctamente el archivo solicitado, 
//independientemente de la ubicación desde la que se esté ejecutando el servidor.
//implementar puerta trasera