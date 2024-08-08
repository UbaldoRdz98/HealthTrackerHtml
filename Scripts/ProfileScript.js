function cancel() {
    window.location.href = '../Views/IndexLogin.html';
}

async function fetchProfile() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(ruta + '/users/getById/' + userId, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const profile = response.data;
        console.log(profile)
        $("#nombre").val(profile.nombre);
        $("#apellidoPaterno").val(profile.apellido_paterno);
        $("#apellidoMaterno").val(profile.apellido_materno);
        $("#fechaNacimiento").val(profile.fecha_nacimiento);
        $("#email").val(profile.email);
    } catch (error2) {
        console.error('Error al obtener las actividades:', error2);
    }
}

document.addEventListener('DOMContentLoaded', fetchProfile);