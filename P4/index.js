const electron = require('electron');
const ip = require('ip');

console.log("Hola desde el proceso de la web...");

//-- Obtener elementos de la interfaz
const btn_test = document.getElementById("btn_test");
const display = document.getElementById("display");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const info3 = document.getElementById("info3");
const info4 = document.getElementById("info4");
const print = document.getElementById("print");

//-- Acceder a la API de node para obtener la info
//-- Sólo es posible si nos han dado permisos desde
//-- el proceso princpal
info1.textContent = process.version;
info2.textContent = process.versions.chrome;
info3.textContent = process.versions.electron;

let msgservidor = false;
const lastMessages = [];

btn_test.onclick = () => {
    //display.innerHTML += "mensaje enviado a los clientes! ";
    //-- Enviar mensaje al proceso principal, le pones el nombre de test 
    electron.ipcRenderer.invoke('test', "HOLIS desde el servidor");
    msgservidor = true
    console.log(msgservidor)
}

if (msgservidor = true) {
    display.innerHTML += "mensaje enviado a los clientes! ";
} 

//-- Mensaje recibido del proceso MAIN
 electron.ipcRenderer.on('mensajeClientes', (event, message) => {
    const msgclientes = document.getElementById("msgClient") ;
    lastMessages.push(message);
    if (lastMessages.length > 3) {
        lastMessages.shift(); 
    }
    msgclientes.innerHTML = "";
    lastMessages.forEach(msg => {
        msgclientes.innerHTML += msg + "<br>";
    });
  

 });
 electron.ipcRenderer.on('infoUrl' , (event,message) => {
    const url = "http://" + ip.address() + ":" + message;
    info4.textContent = url;
    
})

//lista de usuarios conectados
electron.ipcRenderer.on('UsuariosConect' , (event,message) => {
    const listaUsers = document.getElementById("usersConNum") ;
    listaUsers.textContent = message.length

    const users = document.getElementById("user1") ;
    users.textContent = message[0]
    const users2 = document.getElementById("user2") ;
    users2.textContent = message[1]
    const users3 = document.getElementById("user3") ;
    users3.textContent = message[2]
    const users4 = document.getElementById("user4") ;
    users4.textContent = message[3]
    
})