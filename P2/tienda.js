const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PUERTO = 8080;

// Cargar archivos
const FORMULARIO = fs.readFileSync('login.html', 'utf-8');
const RESPUESTA = fs.readFileSync('gorrito1.html', 'utf-8'); // !VER
const MAIN = fs.readFileSync('tienda.html', 'utf-8'); // !VER
const ERROR = fs.readFileSync('404.html', 'utf-8');

// Cargar JSON
let PRODUCTOS_JSON = fs.readFileSync('tienda.json', 'utf-8');
PRODUCTOS_JSON = JSON.parse(PRODUCTOS_JSON);

// Array para almacenar los nombres de los productos
let nombresProductos = [];

// Iterar sobre el array de productos en PRODUCTOS_JSON
for (let i = 0; i < PRODUCTOS_JSON.productos.length; i++) {
    nombresProductos.push(PRODUCTOS_JSON.productos[i].nombre);
}

// Mostrar los nombres de los productos en la consola
console.log(nombresProductos);

// Obtener el array de productos
let productos = nombresProductos;
console.log(productos);

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const recurso = parsedUrl.pathname === '/' ? '/tienda.html' : parsedUrl.pathname;
    const filePath = path.join(__dirname, recurso);
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
            contentType = 'application/javascript';
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

    if (req.method === 'POST' && parsedUrl.pathname === '/procesar') {
        console.log('\n\x1b[33m%s\x1b[0m', '---- ¡Iniciando sesión! ----\n');
        req.on('data', (content) => {
            content = content.toString().split("&");
            content = convert2Dic(content, "=");
            if (content['userName'] != "") {
                console.log(content['userName']);
                check = checkUser(content['userName'], content['password'], PRODUCTOS_JSON);
                if (check[0]) {
                    console.log('\n\x1b[33m%s\x1b[0m', 'Usuario confirmado', content['userName']);
                    res.setHeader('Set-Cookie', ["userName=" + content['userName']]);
                    res.writeHead(302, {
                        'Location': '/tienda.html'
                    });
                    console.log('\n\x1b[36m%s\x1b[0m', 'Usuario ingresado en la tienda correctamente');
                    fs.readFile("tienda.html", (err, data) => {
                        if (!err) {
                            res.end(data);
                        }
                    });
                } else {
                    console.log('FALSE');
                    res.writeHead(302, {
                        'Location': '/no-login.html'
                    });
                    res.end();
                }
            } else {
                console.log('error');
            }
        });
        return;
    }

    if (req.method === 'GET') {
        if (parsedUrl.pathname === '/productos') {
            console.log("Peticion de Productos!");
            contentType = "application/json";
            let param1 = parsedUrl.query.param1;
            param1 = param1 ? param1.toUpperCase() : '';
            console.log("  Param: " + param1);

            let result = productos.filter(prod => prod.toUpperCase().startsWith(param1));
            console.log(result);
            res.setHeader('Content-Type', contentType);
            res.end(JSON.stringify(result));
            return;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.readFile('404.html', (err, content) => {
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

/*
===============================================
               FUNCIONES
===============================================
*/
function convert2Dic(params, split) {
    const dict = {};
    for (let i = 0; i < params.length; i++) {
        let param = params[i].split(split);
        dict[param[0]] = param[1];
    }
    return dict;
}

function checkUser(usuario, password, DATAJSON) {
    let found = false;
    for (let i = 0; i < DATAJSON.nombres.length; i++) {
        if (DATAJSON.nombres[i].usuario == usuario && DATAJSON.nombres[i].password == password) {
            found = true;
            break;
        }
    }
    return [found];
}

function getCookies(req) {
    let cookie = req.headers.cookie;
    if (cookie) {
        cookie = cookie.replace(/\s/g, "");
        cookie = cookie.split(";");
        cookie = convert2Dic(cookie, "=");
        return cookie;
    } else {
        return {};
    }
}
