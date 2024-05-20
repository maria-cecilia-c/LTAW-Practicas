//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();
let SOUND =  new Audio('happy-pop-2-185287.mp3');

socket.on("message", (msg)=>{ // msg = nick:mensaje
  display.innerHTML += '<p style="color:black">' + msg + '</p>';
  SOUND.play();
});

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
  if (msg_entry.value)
    socket.send(msg_entry.value);
  
  //-- Borrar el mensaje actual
  msg_entry.value = "";
}
