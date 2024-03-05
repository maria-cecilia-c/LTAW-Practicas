// Hacer una solicitud al servidor para obtener los datos del archivo JSON
fetch('/tienda')
  .then(response => response.json())
  .then(data => {
    // Obtener el contenedor de productos
    const productosContainer = document.getElementById('productos-container');
    // Iterar sobre los productos y mostrarlos en el DOM
    data.productos.forEach(producto => {
      const productoElement = document.createElement('div');
      productoElement.classList.add('producto');
      productoElement.innerHTML = `
        <h3>${producto.nombre}</h3>
        <p>Precio: ${producto.precio}</p>
        <p>Descripción: ${producto.descripcion}</p>
      `;
      productosContainer.appendChild(productoElement);
    });
  })
  .catch(error => console.error('Error al obtener los datos del archivo JSON:', error));
