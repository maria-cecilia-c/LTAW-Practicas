const http = require('http');
const fs = require('fs');
const path = require('path');

//-- ESpeficicación
const PUERTO = 9090;

//-- Crear el servidor
const server = http.createServer((req, res) => {

   const filePath =  path.join("/home/alumnos/mccampos/LTAW/LTAW-Practicas/P1", "tiendita.html");
  //-- Indicamos que se ha recibido una petición
  console.log("Petición recibida!");

  //-- Cabecera que indica el tipo de datos del
  //-- cuerpo de la respuesta: Texto plano
  //res.setHeader('Content-Type', 'text/html');

  //-- Leer el archivo HTML y enviarlo como respuesta
  //hacer el path

  fs.readFile(filePath,(err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500);
      res.end('Error interno del servidor');
      
    } else{
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
    }
  });
});

//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);

console.log("Happy server activado!. Escuchando en puerto: " + PUERTO);
