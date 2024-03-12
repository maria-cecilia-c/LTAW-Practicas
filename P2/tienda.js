const http = require('http');
const fs = require('fs');
const path = require('path');
const PUERTO = 9090;

const FORMULARIO = fs.readFileSync('login.html', 'utf-8');
const RESPUESTA = fs.readFileSync('gorrito1.html', 'utf-8'); //!VER 

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
            contentType = 'application/json';
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

    if (req.method === 'POST' && req.url === '/procesar') {

          //-- Si hay datos en el cuerpo, se imprimen
        req.on('data', (cuerpo) => {       
          //-- Los datos del cuerpo son caracteres
          req.setEncoding('utf8');
          console.log(`Cuerpo (${cuerpo.length} bytes)`)
          console.log(` ${cuerpo}`);
        });        


        // Manejar el final de la solicitud
        req.on('end', () => {
            // Generar la respuesta
            res.setHeader('Content-Type', 'text/html');
            res.write(RESPUESTA);
            res.end();
        });
    } else {
        // Manejar las solicitudes GET para otros recursos
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf8');
                    });
                } else {
                    res.writeHead(500);
                    res.end('Error interno del servidor: ' + err.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf8');
            }
        });
    }
});

server.listen(PUERTO, () => {
    console.log('Servidor activado! Escuchando en el puerto ' + PUERTO);
});
