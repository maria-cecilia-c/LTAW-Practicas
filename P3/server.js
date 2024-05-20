/*
===============================================
               importaciones
===============================================
*/
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const app = express();

/*
===============================================
               constantes y variables
===============================================
*/
const PUERTO = 9090;
let UsuariosConectados = 0;
let SOUND =  new Audio('happy-pop-2-185287.mp3');

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);



/*
===============================================
    PUNTOS DE ENTRADA DE LA APLICACION WEB
===============================================
*/

app.use('/', express.static(__dirname +'/'));
app.use(express.static('public'));

//---------------------------------------------
//------------------- GESTION SOCKETS IO-------
//---------------------------------------------
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);
  io.send('Nueva conexión');
  UsuariosConectados = UsuariosConectados + 1;
  // Obtener la URL actual del socket
  const url = socket.handshake.headers.referer;
  console.log('URL actual:', url);

  // Parsear la URL para obtener el valor del parámetro username
  const urlParams = new URLSearchParams(new URL(url).search);
  const username = urlParams.get('username');
  console.log('Nombre de usuario:', username);

  //aqui teno el color seleccionado por el usuario
  const color = urlParams.get('color');
  console.log('Color seleccionado:', color);


  //-- Evento de desconexión
  socket.on('disconnect', function(){
    UsuariosConectados = UsuariosConectados - 1;
    console.log('** CONEXIÓN TERMINADA **'.yellow);
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
   //el msg es solo mensaje, en la terminal
    console.log("Mensaje Recibido!"+ username.green +': ' + msg.blue);
    comandosEspeciales(msg,socket,UsuariosConectados, username, color)
    SOUND.play();
  });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);





/*
===============================================
               funciones
===============================================
*/
function comandosEspeciales(comand, socket, UsuariosConectados, username, color){ 

  switch(comand){

      case "/help":
          socket.emit("message" ,("Los comandos soportados son /help /list /hello /date"))
          return;

      case "/list":
          socket.emit("message", ("Número de usuarios conectados: " + UsuariosConectados));
          return;
          
      case "/hello":
          socket.emit("message" , ("Recuerda: Vida antes que muerte, fuerza antes que debeilidad y viaje antes que destino"));
          return;

      case "/date":
          socket.emit("message" , (getDate()))
          break;

      default:
        
        io.send('<span style="color:' + color + '">' + username + '</span>: ' + comand);

        return;
}
}


function getDate(){
  const fechaActual = new Date();
  const dia = fechaActual.getDate().toString().padStart(2, '0');
  const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
  const anio = fechaActual.getFullYear();
  const hora = fechaActual.getHours().toString().padStart(2, '0');
  const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
  const segundos = fechaActual.getSeconds().toString().padStart(2, '0');

  const fechaHora = `Es el dia: ${dia}/${mes}/${anio} , a las ${hora}:${minutos} y ${segundos} segundos`;
  return fechaHora
}

