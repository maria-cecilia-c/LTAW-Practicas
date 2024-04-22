const http = require('http');
const fs = require('fs');
const path = require('path');
//si hay definida cookie hacer lo que toque, si no, pues enseñar un _toastERROR que diga registrate
const PUERTO = 9090;
const FORMULARIO = fs.readFileSync('login.html', 'utf-8');
const RESPUESTA = fs.readFileSync('gorrito1.html', 'utf-8'); //!VER 
const RESPUESTA_LOGIN = fs.readFileSync('tienda.html', 'utf-8'); //!VER 

//----------json
DATAJSON =  fs.readFileSync('tienda.json', 'utf-8')
DATAJSON = JSON.parse(DATAJSON)
console.log(DATAJSON)
cargarTienda("tienda.json")


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

   
   
    //if (req.method === 'POST') {
    //    
    //}


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


//------------Lectura JSON
//JSON.stringify(variable)inversa de variable a json
function cargarTienda(nombreArchivo) {
    let content = RESPUESTA;
    try {
        const tienda_json = fs.readFileSync(nombreArchivo);
        const tienda = JSON.parse(tienda_json);
        console.log("Productos en la tienda: " + tienda.productos.length);
        //tienda.productos.forEach((productos, index)=>{
        //    console.log("Producto " + (index + 1) + ": " + productos.nombre);
        //});
          let nombre = tienda.productos[0].nombre;
          console.log(nombre)
          content = content.replace("NOMBRE", nombre);
        return tienda;
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
  