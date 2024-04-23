//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');

const PUERTO = 9091;
let UsuariosConectados = 0;
//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  res.send('Bienvenido a mi aplicación Web!!!' + '<p><a href="/chat.html">Test</a></p>');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);
  UsuariosConectados = UsuariosConectados + 1;

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    UsuariosConectados = UsuariosConectados - 1;
    console.log('** CONEXIÓN TERMINADA **'.yellow);
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);
    comandosEspeciales(msg,socket)
  });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);





//-----------------FUNCIONES------------------------

function comandosEspeciales(comand, socket, UsuariosCOnectados){ 

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

      default:
        io.send(comand);
        return;

      case "/date":
          socket.emit("message" , (getDate()))
          break;
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
}
