document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get('id');
    const errorMessage = document.getElementById('error-message');

    if (!activityId) {
        errorMessage.textContent = 'No activity was specified to edit.';
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication token not found.');
        }

        const response = await axios.get(ruta + `/catalogo-actividades/getById/${activityId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const activity = response.data;
        document.getElementById('nombre').value = activity.nombre;
        document.getElementById('comentario').value = activity.comentario;
        document.getElementById('caloriasPorHora').value = activity.calorias_hora;

    } catch (error) {
        errorMessage.textContent = error.message || 'Error loading activity data';
    }
});

function cancel(){
    window.location.href = '../Views/Actividades.html';
}