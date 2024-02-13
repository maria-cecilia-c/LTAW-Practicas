const http = require('http');

//-- ESpeficicación
const PUERTO = 9090;

//-- Crear el servidor
const server = http.createServer((req, res) => {
    
  //-- Indicamos que se ha recibido una petición
  console.log("Petición recibida!");

  //-- Cabecera que indica el tipo de datos del
  //-- cuerpo de la respuesta: Texto plano
  res.setHeader('Content-Type', 'html');

  //-- Mensaje del cuerpo
  res.write(`<!DOCTYPE html>
  <html>
  <head>
      <meta charset='utf-8'>
      <meta http-equiv='X-UA-Compatible' content='IE=edge'>
      <title>Page Title</title>
      <meta name='viewport' content='width=device-width, initial-scale=1'>
  </head>
  <body>
      <p>Probando</p>
      <b>Negrita!</b>
  </body>
  </html>`);

  //-- Terminar la respuesta y enviarla
  res.end();
});

//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);

console.log("Happy server activado!. Escuchando en puerto: " + PUERTO);


// curl -vv 127.0.0.1:1234
