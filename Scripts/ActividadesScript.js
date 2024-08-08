// Función para el botón "Nuevo"
function addNewActividad() {
    // Redirigir o mostrar formulario para agregar nueva actividad
    window.location.href = './ActividadesNew.html';
}

// Función de ejemplo para editar actividad
function editActivity(id) {
    // Redirigir o abrir formulario de edición con el ID de la actividad
    window.location.href = `./ActividadesEdit.html?id=${id}`;
}

// Llamar a la función para cargar datos al cargar la página
document.addEventListener('DOMContentLoaded', fetchActivities);