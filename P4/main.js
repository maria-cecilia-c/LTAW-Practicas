//-- Cargar el módulo de electron
const electron = require('electron');
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const { client } = require('websocket');
const fs = require('fs');

const data = fs.readFileSync('palabrasBetadas.json', 'utf8');
const palabrasBetadas = JSON.parse(data).palabrasBetadas;

console.log("Arrancando electron...");

//-- Variable para acceder a la ventana principal
//-- Se pone aquí para que sea global al módulo principal
let win = null;
let clients = []
//-- Punto de entrada. En cuanto electron está listo,
//-- ejecuta esta función
electron.app.on('ready', () => {
    console.log("Evento Ready!");

   
    //--------------CHAT
    const PUERTO = 9090;


    let UsuariosConectados = 0;   

    const app = express();

    const server = http.Server(app);
    const io = socket(server);
    //-- biblioteca socket.io para el cliente
    app.use('/', express.static(__dirname +'/'));   

    //-- El directorio publico contiene ficheros estáticos
    app.use(express.static('public'));

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
      socket.emit('message', '¡Bienvenido al chat '+username+'!');
      console.log('Nombre de usuario:', username);
      clients.push(username)
      win.webContents.send('UsuariosConect' ,clients)
     
      
      //aqui teno el color seleccionado por el usuario
      const color = urlParams.get('color');
      console.log('Color seleccionado:', color);
    
    
      //-- Evento de desconexión
      socket.on('disconnect', function(){
        UsuariosConectados = UsuariosConectados - 1;
        console.log('** CONEXIÓN TERMINADA **'.yellow);
        io.send('CONEXIÓN TERMINADA ');
        
        clients = clients.filter(item => item != username)
        clients.push(username)
        win.webContents.send('UsuariosConect' ,clients)

      });  
    
      //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
      socket.on("message", (msg)=> {
       //el msg es solo mensaje, en la terminal
        console.log("Mensaje Recibido!"+ username.green +': ' + msg.blue);
        win.webContents.send('mensajeClientes' ,msg)
        comandosEspeciales(msg,socket,UsuariosConectados, username, color)
      });

      //'usersCon' es el nombre del evento o mensaje que se está enviando y el clients es la info
    });
    //-- Lanzar el servidor HTTP
    //-- ¡Que empiecen los juegos de los WebSockets!
    server.listen(PUERTO);
    console.log("Escuchando en puerto: " + PUERTO);
    //------------------------------


    //-- Crear la ventana principal de nuestra aplicación
    win = new electron.BrowserWindow({
        width: 600,   //-- Anchura 
        height: 600,  //-- Altura

        //-- Permitir que la ventana tenga ACCESO AL SISTEMA
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
    });

     win.on('ready-to-show', () => { //Esta parte del código se activa cuando la ventana de la aplicación está lista para mostrarse.
       win.webContents.send('UsuariosConect' ,clients) //Envía un mensaje llamado 'usersCon' junto con la información contenida en la variable clients al proceso de renderizado de la ventana. 
       win.webContents.send('infoUrl' , PUERTO)
     })

   

  win.loadFile("main.html");

  win.on('ready-to-show', () => {
    win.webContents.send('print', "MENSAJE ENVIADO DESDE PROCESO MAIN");
  });

 
  win.webContents.send('print', "MENSAJE ENVIADO DESDE PROCESO MAIN");



//funciones 

function comandosEspeciales(comand, socket, UsuariosConectados, username, color){ 

  switch(comand){

      case "/help":
          socket.emit("message" ,("Los comandos soportados son /help /list /hello /date"))
          return;

      case "/list":
          socket.emit("message", ("Número de usuarios conectados: " + UsuariosConectados));
          return;
          
      case "/hello":
          socket.emit("message" , ("Recuerda: Vida antes que muerte, fuerza antes que debilidad y viaje antes que destino"));
          return;

      case "/date":
          socket.emit("message" , (getDate()))
          break;

          default:
            // Verificar si el comando contiene palabras betadas
            for (let palabra of palabrasBetadas) {
                if (comand.includes(palabra)) {
                    socket.emit("message", "Eso no está permitido");
                    return;
                }
            }

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


//-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
//-- renderizado. Al recibirlos se escribe una cadena en la consola
electron.ipcMain.handle('test', (event, msg) => {
  console.log("-> Mensaje: " + msg);
  io.emit('message', msg)
});

});





