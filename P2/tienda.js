const http = require('http');
const fs = require('fs');
const path = require('path');
const { cookie } = require('express/lib/response');
//si hay definida cookie hacer lo que toque, si no, pues enseñar un _toastERROR que diga registrate
const PUERTO = 8080;
const FORMULARIO = fs.readFileSync('login.html', 'utf-8');
const RESPUESTA = fs.readFileSync('gorrito1.html', 'utf-8'); //!VER 
const RESPUESTA_LOGIN = fs.readFileSync('tienda.html', 'utf-8'); //!VER 

//----------json
DATAJSON =  fs.readFileSync('tienda.json', 'utf-8')
DATAJSON = JSON.parse(DATAJSON)
cargarTienda(DATAJSON)


//-------
const server = http.createServer((req, res) => {
    const url = req.url === '/' ? '/tienda.html' : req.url;
    const filePath = path.join(__dirname, url);
    const extension = path.extname(filePath);
    
    //console.log("  Ruta: " + url);

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

   
    if (req.method === 'POST') {

        if (url == '/procesar'){
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
        
    // Manejar las solicitudes GET para otros recursos
    } else {
        
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
                 if (url == '/tienda.html'){
                    cookies = getCookies(req)
                    console.log('COOKIEEES en get: ', cookies)
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
                    //data = manageMain(data, DATABASE ,cookies)  
                    //OK(res,data)
                }
                if (url === '/gorrito1.html') {
                    procesarArchivoHTML('gorrito1.html', 0, DATAJSON);
                } else if (url === '/gorrito2.html') {
                    procesarArchivoHTML('gorrito2.html', 1, DATAJSON);
                } else if (url === '/gorrito3.html') {
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

function cargarTienda(DATAJSON) {
    try {
        console.log("Productos en la tienda: " + DATAJSON.productos.length);
        let productos = [];
        DATAJSON.productos.forEach(producto => {
            productos.push({
                nombre: producto.nombre,
                descripcion: producto.descripcion
            });
            //console.log("Producto: " + producto.nombre);
            //console.log("Descripción: " + producto.descripcion);
        });
        return productos;
    } catch (error) {
        console.error('Error al cargar el archivo JSON:', error);
        return null;
    }
}


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




function reemplazarNombreUsuario(data, cookies) {
    // Convierte el contenido a una cadena si aún no lo es
    data = data.toString();
    
    // Verifica si el nombre de usuario está definido en las cookies
    if (cookies['userName'] != null) {
        // Reemplaza "inicie sesion" con el nombre de usuario
        data = data.replace("Login", cookies['userName']);
    } else {
        // Si el nombre de usuario no está definido, muestra un mensaje de error
        console.error('El nombre de usuario no está definido en las cookies.');
        // Podrías devolver un valor predeterminado o lanzar una excepción aquí
    }
    
    return data;
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
  