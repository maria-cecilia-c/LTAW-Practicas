const http = require('http');
const fs = require('fs');
const path = require('path');
//si hay definida cookie hacer lo que toque, si no, pues enseñar un _toastERROR que diga registrate
const PUERTO = 9091;
const FORMULARIO = fs.readFileSync('login.html', 'utf-8');
const RESPUESTA = fs.readFileSync('gorrito1.html', 'utf-8'); //!VER 
const RESPUESTA_LOGIN = fs.readFileSync('tienda.html', 'utf-8'); //!VER 

//----------json
DATAJSON =  fs.readFileSync('tienda.json', 'utf-8')
DATAJSON = JSON.parse(DATAJSON)
console.log(DATAJSON)
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
            console.log('----Login----')
            req.on('data', (content)=> {
                content = (content.toString()).split("&")
                content =  convert2Dic(content,"=")
                if(content['userName'] != ""){
                    console.log(content['userName'])
                    check = checkUser(content['userName'] , content['password'] ,DATAJSON)
                    // TRUE: saludo y ahora puede añadir objetos al carrito
                    if (check[0]) {
                        console.log('TRUE');
                        // Array que contiene las cookies que se desean establecer
                        res.setHeader('Set-Cookie', ["userName=" + content['userName']]);
                        res.writeHead(302, {
                            'Location': '/tienda.html'
                        });
                        console.log('Estamos en tienda html');
                        // Leer el archivo tienda.html
                        fs.readFile("tienda.html", (err, data) => {
                            if (!err) {
                                // Obtener las cookies del cliente
                                const cookies = getCookies(req);
                                // Modificar el contenido de tienda.html
                                data = manageMain(data, cookies);
                                // Enviar el contenido modificado como respuesta
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
                if (url === '/gorrito1.html') {
                     // Lee el archivo HTML
                fs.readFile('gorrito1.html', 'utf8', (err, data) => {
                    if (err) {
                        return console.error('Error al leer el archivo HTML:', err);
                    }               
            
                    // Carga la tienda desde el JSON
                    const tienda = cargarTienda(DATAJSON);   //nombre, descripcion
                          
                    if (tienda) {
                        // Obtiene el primer nombre y descripción
                        const primerNombre = tienda[0].nombre;
                        const primerDescripcion = tienda[0].descripcion;

                        // Realiza el reemplazo del nombre del producto en el HTML
                        let nuevoContenido = data.replace("Nombre_Gorro", primerNombre);  
                        
                        nuevoContenido = nuevoContenido.replace("HTML_descrip", primerDescripcion);
                        
                        fs.writeFile('gorrito1.html', nuevoContenido, 'utf8', (err) => {
                            if (err) {
                                return console.error('Error al escribir el archivo HTML:', err);
                            }
                            console.log('El reemplazo se ha realizado con éxito.');
                        });
                    } else {
                        console.error('No se pudo cargar la tienda desde el JSON.');
                    }               
                }); 
                }
                if (url === '/gorrito2.html') {
                    // Lee el archivo HTML
               fs.readFile('gorrito2.html', 'utf8', (err, data) => {
                   if (err) {
                       return console.error('Error al leer el archivo HTML:', err);
                   }               
           
                   // Carga la tienda desde el JSON
                   const tienda = cargarTienda(DATAJSON);   //nombre, descripcion
                         
                   if (tienda) {
                       // Obtiene el primer nombre y descripción
                       const segundoNombre = tienda[1].nombre;
                       const segundaDescripcion = tienda[1].descripcion;

                       // Realiza el reemplazo del nombre del producto en el HTML
                       let nuevoContenido = data.replace("Nombre_Gorro2", segundoNombre);  
                       
                       nuevoContenido = nuevoContenido.replace("HTML_descrip2", segundaDescripcion);
                       
                       fs.writeFile('gorrito2.html', nuevoContenido, 'utf8', (err) => {
                           if (err) {
                               return console.error('Error al escribir el archivo HTML:', err);
                           }
                           console.log('El reemplazo se ha realizado con éxito.');
                       });
                   } else {
                       console.error('No se pudo cargar la tienda desde el JSON.');
                   }               
               }); 
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


//------------Lectura JSON
//JSON.stringify(variable)inversa de variable a json
function cargarTienda(DATAJSON) {
    try {
        console.log("Productos en la tienda: " + DATAJSON.productos.length);
        let productos = [];
        DATAJSON.productos.forEach(producto => {
            productos.push({
                nombre: producto.nombre,
                descripcion: producto.descripcion
            });
            console.log("Producto: " + producto.nombre);
            console.log("Descripción: " + producto.descripcion);
        });
        return productos;
    } catch (error) {
        console.error('Error al cargar el archivo JSON:', error);
        return null;
    }
}





//---------------------FUNCIONES--------------------------

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




function manageMain(data, cookies) {
  data = data.toString();
  if (cookies['userName'] != null) {
      data = data.replace("usuario", cookies['userName']);
      //se cambia el usuario por pepe, pero no se ve en el front
  } else {
      console.log('error');
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
  