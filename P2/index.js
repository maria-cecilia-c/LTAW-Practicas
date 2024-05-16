//-- PETICIONES AJAX
document.addEventListener("DOMContentLoaded", function() {
    // Cargar la información del JSON como lo estabas haciendo antes

    const searchInput = document.getElementById('caja');

    // Manejar evento keyup en el campo de búsqueda
    searchInput.addEventListener('keyup', function(event) {
        const searchTerm = event.target.value.trim(); // Obtener el término de búsqueda

        if (searchTerm === '') {
            clearSearchResults(); // Limpiar los resultados si la barra de búsqueda está vacía
            return;
        }

        // Realizar una solicitud AJAX al servidor para buscar productos
        fetch(`/search?query=${encodeURIComponent(searchTerm)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al buscar productos');
                }
                return response.json();
            })
            .then(data => {
                displaySearchResults(data); // Mostrar los resultados de búsqueda
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});

function clearSearchResults() {
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.innerHTML = ''; // Limpiar los resultados de búsqueda
}

function displaySearchResults(products) {
    const searchResultsDiv = document.getElementById('search-results');
    searchResultsDiv.innerHTML = ''; // Limpiar resultados anteriores

    if (products.length === 0) {
        searchResultsDiv.innerHTML = 'No se encontraron productos.';
        return;
    }

    const ul = document.createElement('ul');
    products.forEach(product => {
        const li = document.createElement('li');
        li.textContent = product.nombre;
        li.dataset.productUrl = product.url; // Agrega el URL del producto como atributo de datos
        li.addEventListener('click', function() {
            window.location.href = this.dataset.productUrl; // Redirecciona al URL del producto al hacer clic en el resultado
        });
        li.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#a0a0a0'; // Cambia el color de fondo al pasar el cursor sobre el resultado
        });
        li.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent'; // Restaura el color de fondo al quitar el cursor del resultado
        });
        ul.appendChild(li);
    });
    searchResultsDiv.appendChild(ul);
}