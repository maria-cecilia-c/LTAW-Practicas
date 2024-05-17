const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = 9090;

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
  
  if (req.url === "/ls") {
    // Si la URL es "/ls", enviamos la lista de archivos como respuesta
    const fileList = returnFiles("./");
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fileList, 'utf8');
  }else if (req.url === "/mantenimiento") {
    // Si la URL es "/ls", enviamos la lista de archivos como respuesta
    const fileList = returnFiles("./");
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fileList, 'utf8');
  }  else {
    // Si la URL no es "/ls", intentamos leer el archivo normalmente
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
  }
});

server.listen(PUERTO, () => {
  console.log('Servidor activado! Escuchando en el puerto ' + PUERTO);
});

function returnFiles(dir, space = '') {
  let sendText = [];
  const archivos = fs.readdirSync(dir);

  archivos.forEach(archivo => {
    const filePath = dir + '/' + archivo;
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      // Si es un directorio, llamamos recursivamente a la función y añadimos su contenido con más espacio
      sendText.push(`<p>${space}${archivo}/</p>`);
      sendText.push(returnFiles(filePath, space + '---'));
    } else {
      // Si es un archivo, simplemente lo añadimos a la lista
      sendText.push(`<p>${space}${archivo}</p>`);
    }
  });

  return sendText.join(''); // Unimos todos los elementos del array en una sola cadena
}

function redirect(){
  window.location.href = "/mantenimiento.html";
}