document.addEventListener('DOMContentLoaded', async function() {
    // Obtener el ID de la actividad de la URL o de alguna otra forma
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get('id');
    const errorMessage = document.getElementById('error-message');

    if (!activityId) {
        errorMessage.textContent = 'No se especificó ninguna actividad para editar.';
        return;
    }

    try {
        // Obtener el token de autenticación desde localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }

        // Realizar la solicitud GET para obtener los datos de la actividad
        const response = await axios.get(ruta + `/catalogo-actividades/getById/${activityId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const activity = response.data;
        // Llenar los campos del formulario con los datos de la actividad
        document.getElementById('nombre').value = activity.nombre;
        document.getElementById('comentario').value = activity.comentario;
        document.getElementById('caloriasPorHora').value = activity.calorias_hora;

    } catch (error) {
        errorMessage.textContent = error.message || 'Error al cargar los datos de la actividad';
    }
});

function cancel(){
    window.location.href = '../Views/Actividades.html';
}