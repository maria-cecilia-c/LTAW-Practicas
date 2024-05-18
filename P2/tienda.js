/*
===============================================
               importaciones
===============================================
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');



/*
===============================================
               constantes
===============================================
*/
const PUERTO = 8081;


/*
===============================================
               json
===============================================
*/
DATAJSON =  fs.readFileSync('tienda.json', 'utf-8')
DATAJSON = JSON.parse(DATAJSON)

let nombresProductos = [];

for (let i = 0; i < DATAJSON.productos.length; i++) {
    nombresProductos.push(DATAJSON.productos[i].nombre);
}
let productos = nombresProductos;
console.log(productos);



/*
===============================================
               server
===============================================
*/
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
   
    if (req.method === 'POST' && parsedUrl.pathname === '/procesar') {

            console.log('\n\x1b[33m%s\x1b[0m', '---- ¡Iniciando sesión! ----\n');
            req.on('data', (content)=> {
                content = (content.toString()).split("&")
                content =  convert2Dic(content,"=")
                if(content['userName'] != ""){
                    console.log(content['userName'])
                    check = checkUser(content['userName'] , content['password'] ,DATAJSON)
                    // TRUE: saludo y ahora puede añadir objetos al carrito
                    if (check[0]) {
                        console.log('\n\x1b[33m%s\x1b[0m','Usuario confirmado',content['userName'])
                        // Array que contiene las cookies que se desean establecer
                        res.setHeader('Set-Cookie', ["userName=" + content['userName']]);
                        res.writeHead(302, {
                            'Location': '/tienda.html'
                            
                        });
                        console.log('\n\x1b[36m%s\x1b[0m','Usuario ingresado en la tienda correctamente');
                        // Leer el archivo tienda.html
                       
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

                }else{
                    console.log('error')
                }
        });
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
                    fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf8');
                    });
                } else {
                    res.writeHead(500);
                    res.end('Error interno del servidor: ' + err.code);
                }
            } else {
              
                 if (parsedUrl.pathname == '/tienda.html'){
                    cookies = getCookies(req)
                   if (cookies.userName === 'JK') {
                        procesarArchivoHTML('tienda.html', 0, DATAJSON);
                    } else if (cookies.userName === 'root'){
                        procesarArchivoHTML('tienda.html', 1, DATAJSON);
                    }
                    fs.readFile("tienda.html", (err, data) => {
                    console.log('leyendo el archivo  ', cookies['userName'])

                        if (!err) {
                            data = data.toString();
                            data = data.replace("Login", cookies['userName']);
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(data);
                        } else {
                            console.error('Error al leer el archivo HTML:', err);
                            res.writeHead(500);
                            res.end('Error interno del servidor al leer el archivo HTML');
                        }
                    });
                   
                }
                if (parsedUrl.pathname === '/gorrito1.html') {
                    procesarArchivoHTML('gorrito1.html', 0, DATAJSON);
                } else if (parsedUrl.pathname === '/gorrito2.html') {
                    procesarArchivoHTML('gorrito2.html', 1, DATAJSON);
                } else if (parsedUrl.pathname === '/gorrito3.html') {
                    procesarArchivoHTML('gorrito3.html', 2, DATAJSON);
                }
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


function procesarArchivoHTML(nombreArchivo, posicionProducto, DATAJSON) {
    // Lee el archivo HTML correspondiente
    fs.readFile(nombreArchivo, 'utf8', (err, data) => {
        if (err) {
            return console.error('Error al leer el archivo HTML:', err);
        }
        
        // Verifica que la posición del producto sea válida
        if (posicionProducto < DATAJSON.productos.length) {
            // Obtiene el nombre y la descripción del producto en la posición especificada
            const producto = DATAJSON.productos[posicionProducto];
            const nombreProducto = producto.nombre;
            const descripcionProducto = producto.descripcion;
            const precioProducto = producto.precio;


            // Realiza el reemplazo del nombre y la descripción del producto en el HTML
            let nuevoContenido = data.replace("Nombre_Gorro", nombreProducto);
            nuevoContenido = nuevoContenido.replace("HTML_descrip", descripcionProducto);
            nuevoContenido = nuevoContenido.replace("HTML_precio", precioProducto);


            // Guarda los cambios en el archivo HTML
            fs.writeFile(nombreArchivo, nuevoContenido, 'utf8', (err) => {
                if (err) {
                    return console.error('Error al escribir el archivo HTML:', err);
                }
                console.log(`El reemplazo en ${nombreArchivo} se ha realizado con éxito.`);
            });
        } else {
            console.error(`La posición ${posicionProducto} está fuera del rango de productos.`);
        }

        //
        if (posicionProducto < DATAJSON.nombres.length) {
            // Obtiene el nombre y la descripción del producto en la posición especificada
            const nombres = DATAJSON.nombres[posicionProducto];
            const nombreUser = nombres.nombre;
        
            // Realiza el reemplazo del nombre y la descripción del producto en el HTML
            let nuevoContenido = data.replace("nick", nombreUser);

            // Guarda los cambios en el archivo HTML
            fs.writeFile(nombreArchivo, nuevoContenido, 'utf8', (err) => {
                if (err) {
                    return console.error('Error al escribir el archivo HTML:', err);
                }
                console.log(`El reemplazo en ${nombreArchivo} se ha realizado con éxito.`);
            });
        } else {
            console.error(`La posición ${posicionProducto} está fuera del rango de productos.`);
        }
    });
}





function convert2Dic(params , split){

    const dict = {};
    for (let i = 0; i < params.length; i++){
      param = params[i].split(split)
      dict[param[0]] = param[1];
    }
    return dict
}
  

//metemos en la función el usuario, contraseña, y el Json donte tenemos los usuarios
function checkUser(usuario,password,DATAJSON){
  found = false
  for (let i = 0; i <  DATAJSON.nombres.length; i++){

    if(DATAJSON.nombres[i].usuario == usuario && DATAJSON.nombres[i].password == password ){
      found = true;
      break;
    }
  }
  return [found]
}

  
  
function getCookies(req){
    let cookie = req.headers.cookie
    if (cookie) {
      cookie = cookie.replace(/\s/g, "");
      cookie = cookie.split(";")
      cookie = convert2Dic(cookie,"=")
      return cookie
    }else{
      return {}
    }
  }
  