var ruta = 'http://ec2-3-21-63-56.us-east-2.compute.amazonaws.com:3333';
var userId = localStorage.getItem('userId');
function formatDateToDDMMYYYY(isoDate) {
    const date = new Date(isoDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

function showAlert(message, type) {
    const alertElement = $(`#${type}Alert`);
    alertElement.text(message).fadeIn();

    setTimeout(function() {
        alertElement.fadeOut();
    }, 50000);
}

async function getUserInfo() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(ruta + '/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        localStorage.setItem('userId', response.data.id);
    } catch (error) {
        console.error('Error al obtener las actividades:', error);
    }
}

async function validateToken() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(ruta + '/verificar-token', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if(response.data == false) {
            const rutaPath = window.location.pathname;
            const segmentos = rutaPath.split('/');
            const ultimoSegmento = segmentos.pop() || segmentos.pop();
            if(ultimoSegmento != 'Login.html'){
                window.location.href = '../Views/Login.html';
            }
        }
    } catch (error) {
        console.error('Error al obtener las actividades:', error);
    }

}

function register() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';
    const formData = new FormData(document.getElementById('registrationForm'));

    const data = {
        nombre: formData.get('nombre'),
        apellidoPaterno: formData.get('apellidoPaterno'),
        apellidoMaterno: formData.get('apellidoMaterno'),
        fechaNacimiento: formData.get('fechaNacimiento'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    axios.post(ruta + '/register', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.data.code == 201) {
            
            alert('Usuario Creado!');
            window.location.href = '../Views/Login.html';
        } else {
            alert(response.data.message || 'Error desconocido');
            //errorMessage.textContent = response.data.message || 'Error desconocido';
        }
    })
    .catch(error => {
        alert(error.message || 'Error al conectar con el servidor');
        //errorMessage.textContent = error.message || 'Error al conectar con el servidor';
    });
}

function login() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const data = {
        email: email,
        password: password
    };
    axios.post(ruta + '/login', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            showAlert('Login Success!', 'success');
            window.location.href = '../Views/IndexLogin.html';
        } else {
            alert(response.data.message || 'Error desconocido');
            //errorMessage.textContent = response.data.message || 'Error desconocido';
        }
    })
    .catch(error => {
        alert(error.message || 'Error al conectar con el servidor');
        //errorMessage.textContent = error.message || 'Error al conectar con el servidor';
    });
}

/* Actividades */
async function fetchActivities() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }
        
        const response = await axios.get(ruta + '/catalogo-actividades/get', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const activities = response.data;
        const tbody = document.querySelector('#activitiesTable tbody');
        tbody.innerHTML = '';

        activities.forEach(activity => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${activity.id}</td>
                <td>${activity.nombre}</td>
                <td>${activity.calorias_hora}</td>
                <td>
                    <button onclick="editActivity(${activity.id})">Editar</button>
                    <button onclick="confirmDelete(${activity.id},'${activity.nombre}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
}

async function fetchActivitiesCalories(id) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }
        
        const response = await axios.get(ruta + '/catalogo-actividades/getById/' + id, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const activities = response.data;
        caloriasxhora = activities.calorias_hora;
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
}

async function saveActivity() {
    const nombre = document.getElementById('nombre').value;
    const comentario = document.getElementById('comentario').value;
    const caloriasHora = document.getElementById('caloriasPorHora').value;
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = '';

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }

        const response = await axios.post(ruta + '/catalogo-actividades/create', {
            nombre,
            comentario,
            caloriasHora
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.code == 201) {
            alert('Actividad guardada con éxito');
            window.location.href = './Actividades.html';
        } else {
            alert(response.data.message || 'Error desconocido');
        }
    } catch (error) {
        alert(error.message || 'Error al conectar con el servidor');
    }
}

async function updateActivity() {
    const nombre = document.getElementById('nombre').value;
    const comentario = document.getElementById('comentario').value;
    const caloriasHora = document.getElementById('caloriasPorHora').value;
    const errorMessage = document.getElementById('error-message');

    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get('id');

    errorMessage.textContent = '';

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }

        const response = await axios.put(ruta + `/catalogo-actividades/update/${activityId}`, {
            nombre,
            comentario,
            caloriasHora
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.code == 200) {
            alert('Actividad actualizada con éxito');
            window.location.href = './Actividades.html';
        } else {
            alert(response.data.message || 'Error desconocido');
        }
    } catch (error) {
        alert(error.message || 'Error al conectar con el servidor');
    }
}

function confirmDelete(activityId, nombre) {
    const confirmation = confirm(`¿Estás seguro de que deseas eliminar esta actividad: ${nombre}?`);
    if (confirmation) {
        deleteActivity(activityId);
    }
}

async function deleteActivity(activityId) {
    const errorMessage = document.getElementById('error-message');
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }

        const response = await axios.delete(ruta + `/catalogo-actividades/delete/${activityId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            alert('Actividad eliminada con éxito');
            window.location.reload();
        } else {
            alert(response.data.message || 'Error desconocido');
        }
    } catch (error) {
        alert(error.message || 'Error al conectar con el servidor');
    }
}

/* Datos Salud */
async function fetchHealthData() {
    const healthDataBody = document.getElementById('healthDataBody');
    const errorMessage = document.getElementById('error-message');
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }

        const response = await axios.get(ruta + '/datos-salud/get', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status == 200) {
            const healthData = response.data;
            healthDataBody.innerHTML = '';
            healthData.forEach(item => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}</td>
                    <td>${item.actividad}</td>
                    <td>${formatDateToDDMMYYYY(item.fecha_registro)}</td>
                    <td class="action-buttons">
                        <button class="edit-button" onclick="ABCHealthData('Edit', ${item.id})">Edit</button>
                        <button class="detail-button" onclick="ABCHealthData('See', ${item.id})">See</button>
                        <button class="delete-button" onclick="ABCHealthData('Delete', ${item.id})">Delete</button>
                    </td>
                `;
                healthDataBody.appendChild(row);
            });
        } else {
            alert(error.message || 'Error al conectar con el servidor');
        }
    } catch (error) {
        alert(error.message || 'Error al conectar con el servidor');
    }
}

async function saveHealthData(){
    const actividadId = $("#selectActivity").val();
    const fechaRegistro = document.getElementById('fecha').value;
    const duracionMinutos = document.getElementById('duracion').value;
    const distanciaKm = document.getElementById('distancia').value;
    const caloriasQuemadas = document.getElementById('calorias').value;

    if ((actividadId != '' & actividadId != 0) & (fechaRegistro != '') & (duracionMinutos != '') & (distanciaKm != '') & (caloriasQuemadas != '')){
        saveHealthDataFather();
    } else {
        alert('Necesita llenar todos los campos');
    }

}

async function saveHealthDataFather() {
    const actividadId = $("#selectActivity").val();
    const fechaRegistro = document.getElementById('fecha').value;
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }
        var url = ''
        if(tipoParam == 'Add') {
            const response = await axios.post(ruta + '/datos-salud/create', {
                userId,
                actividadId,
                fechaRegistro
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.code == 201) {
                datosSaludDetalle = response.data.data.id;
                saveHealthDataDetail(response.data.data.id);
            } else {
                alert(response.data.message || 'Error desconocido');
            }
        } else {
            const response = await axios.put(ruta + '/datos-salud/update/' + idParam, {
                userId,
                actividadId,
                fechaRegistro
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.code == 200) {
                saveHealthDataDetail(datosSaludDetalle);
            } else {
                alert(response.data.message || 'Error desconocido');
            }
        }
        

        
    } catch (error) {
        alert(error.message || 'Error al conectar con el servidor');
    }
}

async function saveHealthDataDetail(healthDataId) {
    const duracionMinutos = document.getElementById('duracion').value;
    const distanciaKm = document.getElementById('distancia').value;
    const caloriasQuemadas = document.getElementById('calorias').value;

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }
console.log(1)
        if(tipoParam == 'Add') {
            const response = await axios.post(ruta + '/datos-salud-detalles/create', {
                datosSaludId,
                duracionMinutos,
                distanciaKm,
                caloriasQuemadas
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.data.code == 201) {
                alert('Saved Data');
                window.location.href = './DatosSalud.html';
            } else {
                alert(response.data.message || 'Error desconocido');
            }
        } else {
            const response = await axios.put(ruta + '/datos-salud-detalles/update/' + idDetail, {
                duracionMinutos,
                distanciaKm,
                caloriasQuemadas
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(response)
    
            if (response.data.code == 201) {
                alert('Saved Data Detail');
                window.location.href = './DatosSalud.html';
            } else {
                alert(response.data.message || 'Error desconocido');
            }
        }
        
    } catch (error) {
        alert(error.message || 'Error al conectar con el servidor');
    }
}

async function getInfoHealthData(id) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.get(ruta + '/datos-salud/getById/' + id, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const healthData = response.data;
        $("#selectActivity").val(healthData.actividad_id);
        const act = healthData.actividad_id
        fetchActivitiesCalories(act);
        $('#fecha').val(healthData.fecha_registro);
    } catch (error) {
        console.error('Error al obtener las actividades:', error);
    }
    
    $('#selectActivity').prop('disabled', true);
    try {
        const response = await axios.get(ruta + '/datos-salud-detalles/getById/' + id, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const healthDataDetail = response.data[0][0];
        idDetail = healthDataDetail.id;
        $('#duracion').val(healthDataDetail.duracion_minutos);
        $('#distancia').val(healthDataDetail.distancia_km);
        $('#calorias').val(healthDataDetail.calorias_quemadas);


    } catch (error) {
        console.error('Error al obtener las actividades:', error);
    }
}
/* Datos Salud */

document.addEventListener('DOMContentLoaded', validateToken);