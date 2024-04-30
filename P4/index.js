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
const url = "http://" + ip.address() + ":" + 2020;
info4.textContent = url;

btn_test.onclick = () => {
    display.innerHTML += "TEST! ";
    console.log("Botón apretado!");

    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('test', "MENSAJE DE PRUEBA: Boton apretado");
}

//-- Mensaje recibido del proceso MAIN
electron.ipcRenderer.on('print', (event, message) => {
    console.log("Recibido: " + message);
    print.textContent = message;
  });