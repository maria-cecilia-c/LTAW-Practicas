//-- Cargar el módulo de electron
const electron = require('electron');
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');




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
    const PUERTO = 9093;
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
      console.log('Nombre de usuario:', username);
    
      //aqui teno el color seleccionado por el usuario
      const color = urlParams.get('color');
      console.log('Color seleccionado:', color);
    
    
      //-- Evento de desconexión
      socket.on('disconnect', function(){
        UsuariosConectados = UsuariosConectados - 1;
        console.log('** CONEXIÓN TERMINADA **'.yellow);
        io.send('CONEXIÓN TERMINADA ');
      });  
    
      //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
      socket.on("message", (msg)=> {
       //el msg es solo mensaje, en la terminal
        console.log("Mensaje Recibido!"+ username.green +': ' + msg.blue);
        comandosEspeciales(msg,socket,UsuariosConectados, username, color)
      });

      clients.push(UsuariosConectados)
      //'usersCon' es el nombre del evento o mensaje que se está enviando y el clients es la info
      win.webContents.send('UsuariosConect' ,clients)
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

  //   win.on('ready-to-show', () => { //Esta parte del código se activa cuando la ventana de la aplicación está lista para mostrarse.
  //     win.webContents.send('usersCon' ,clients) //Envía un mensaje llamado 'usersCon' junto con la información contenida en la variable clients al proceso de renderizado de la ventana. 

      
  //     const url = "http://" + ip.address() + ":" + PUERTO;
      
  //     win.webContents.send('conectionInformation' , JSON.stringify([ip.address(), PUERTO]))

  //     electron.ipcMain.handle('serverMess',(event,msg) => {
  //       io.emit("message", JSON.stringify([ "general", "server" ,msg]));
  //   })

  // })


  //-- En la parte superior se nos ha creado el menu
  //-- por defecto
  //-- Si lo queremos quitar, hay que añadir esta línea
  //win.setMenuBarVisibility(false)

  //-- Cargar contenido web en la ventana
  //-- La ventana es en realidad.... ¡un navegador!
  //win.loadURL('https://www.urjc.es/etsit');

  //-- Cargar interfaz gráfica en HTML
  win.loadFile("main.html");

  //-- Esperar a que la página se cargue y se muestre
  //-- y luego enviar el mensaje al proceso de renderizado para que 
  //-- lo saque por la interfaz gráfica
  win.on('ready-to-show', () => {
    win.webContents.send('print', "MENSAJE ENVIADO DESDE PROCESO MAIN");
  });

  //-- Enviar un mensaje al proceso de renderizado para que lo saque
  //-- por la interfaz gráfica
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


});


//-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
//-- renderizado. Al recibirlos se escribe una cadena en la consola
electron.ipcMain.handle('test', (event, msg) => {
  console.log("-> Mensaje: " + msg);
});


