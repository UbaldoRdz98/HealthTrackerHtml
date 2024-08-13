var ruta = 'http://ec2-3-21-63-56.us-east-2.compute.amazonaws.com:3333';
var userId = localStorage.getItem('userId');
var idDetailOk = 0;

function formatDateToDDMMYYYY(isoDate) {
    const date = new Date(isoDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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
        console.error('Error getting user information:', error);
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
        console.error('Error getting token information:', error);
    }
}

async function logOut() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(ruta + '/logout', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        window.location.href = '../Views/index.html';
    } catch (error) {
        console.error('Error in Logout:', error);
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
            
            alert('Usuario Created!');
            window.location.href = '../Views/Login.html';
        } else {
            alert(response.data.message || 'Unknow Error');
        }
    })
    .catch(error => {
        alert(error.message || 'Error connecting to server');
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
            alert(response.data.message || 'Unknow Error');
        }
    })
    .catch(error => {
        alert(error.message || 'Error connecting to server');
    });
}

/* Actividades */
async function fetchActivities() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication token not found.');
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
                    <button onclick="editActivity(${activity.id})">Edit</button>
                    <button onclick="confirmDelete(${activity.id},'${activity.nombre}')">Delete</button>
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
            throw new Error('Authentication token not found.');
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
            throw new Error('Authentication token not found.');
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
            alert('Activity saved successfully');
            window.location.href = './Actividades.html';
        } else {
            alert(response.data.message || 'Unknow Error');
        }
    } catch (error) {
        alert(error.message || 'Error connecting to server');
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
            throw new Error('Authentication token not found.');
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
            alert('Activity updated successfully');
            window.location.href = './Actividades.html';
        } else {
            alert(response.data.message || 'Unknow Error');
        }
    } catch (error) {
        alert(error.message || 'Error connecting to server');
    }
}

function confirmDelete(activityId, nombre) {
    const confirmation = confirm(`Are you sure you want to delete this activity: ${nombre}?`);
    if (confirmation) {
        deleteActivity(activityId);
    }
}

async function deleteActivity(activityId) {
    const errorMessage = document.getElementById('error-message');
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication token not found.');
        }

        const response = await axios.delete(ruta + `/catalogo-actividades/delete/${activityId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            alert('Activity successfully deleted');
            window.location.reload();
        } else {
            alert('There are details, it cannot be deleted');
        }
    } catch (error) {
        alert('There are details, it cannot be deleted');
    }
}

/* Datos Salud */
async function fetchHealthData() {
    const healthDataBody = document.getElementById('healthDataBody');
    const errorMessage = document.getElementById('error-message');
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication token not found.');
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
                        <button class="delete-button" onclick="confirmDeleteHealth(${item.id}, ${item.id})">Delete</button>
                    </td>
                `;
                healthDataBody.appendChild(row);
            });
        } else {
            alert(error.message || 'Error connecting to server');
        }
    } catch (error) {
        alert(error.message || 'Error connecting to server');
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
        alert('You need to fill in all fields');
    }

}

async function saveHealthDataFather() {
    const actividadId = $("#selectActivity").val();
    const fechaRegistro = document.getElementById('fecha').value;
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication token not found.');
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
                saveHealthDataDetail(datosSaludDetalle);
            } else {
                alert(response.data.message || 'Unknow Error');
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
                alert(response.data.message || 'Unknow Error');
            }
        }
        

        
    } catch (error) {
        alert(error.message || 'Error connecting to server');
    }
}

async function saveHealthDataDetail(healthDataId) {
    const duracionMinutos = document.getElementById('duracion').value;
    const distanciaKm = document.getElementById('distancia').value;
    const caloriasQuemadas = document.getElementById('calorias').value;

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication token not found.');
        }

        if(tipoParam == 'Add') {
            var datosSaludId = healthDataId;
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
                alert(response.data.message || 'Unknow Error');
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
    
            if (response.data.code == 200) {
                alert('Saved Data Detail');
                window.location.href = './DatosSalud.html';
            } else {
                alert(response.data.message || 'Unknow Error');
            }
        }
        
    } catch (error) {
        alert(error.message || 'Error connecting to server');
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
        console.error('Error getting activities:', error);
    }
    
    $('#selectActivity').prop('disabled', true);
    try {
        const response = await axios.get(ruta + '/datos-salud-detalles/getById/' + id, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const healthDataDetail = response.data[0];
        console.log(response)
        idDetail = healthDataDetail.id;
        $('#duracion').val(healthDataDetail.duracion_minutos);
        $('#distancia').val(healthDataDetail.distancia_km);
        $('#calorias').val(healthDataDetail.calorias_quemadas);


    } catch (error) {
        console.error('Error getting activities:', error);
    }
}

async function fetchHealthDataDetailDelete(id) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(ruta + '/datos-salud-detalles/getById/' + id, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        var healthDataDetail2 = response.data[0][0];
        idDetailOk = healthDataDetail2.id;
        deleteHealthDetail(idDetailOk, id);
    } catch (error2) {
        console.error('Error getting activities:', error2);
    }
}

function confirmDeleteHealth(dataId, nombre) {
    const confirmation = confirm(`Are you sure you want to delete this Data: ${nombre}?`);
    if (confirmation) {
        fetchHealthDataDetailDelete(dataId);
    }
}

async function deleteHealthDetail(dataId, dataFatherId) {
    const errorMessage = document.getElementById('error-message');
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication token not found.');
        }

        const response = await axios.delete(ruta + `/datos-salud-detalles/delete/${dataId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token not found.');
                }
        
                const response = await axios.delete(ruta + `/datos-salud/delete/${dataFatherId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
        
                if (response.data.code == 200) {
                    alert('Daaa deleted');
                    window.location.reload();
                } else {
                    alert('There are details, it cannot be deleted');
                }
            } catch (error) {
                alert('There are details, it cannot be deleted');
            }
        } else {
            alert('There are details, it cannot be deleted');
        }
    } catch (error) {
        alert('There are details, it cannot be deleted');
    }
}

async function deleteHealth(_dataId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication token not found.');
        }

        const response = await axios.delete(ruta + `/datos-salud/delete/${_dataId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code == 200) {
            alert('Information deleted successfully');
            window.location.reload();
        } else {
            alert('There are details, it cannot be deleted');
        }
    } catch (error) {
        alert('There are details, it cannot be deleted');
    }
}

async function saveProfile() {
    try {
        const token = localStorage.getItem('authToken');
        const nombre = $('#nombre').val();
        const apellidoPaterno = $('#apellidoPaterno').val();
        const apellidoMaterno = $('#apellidoMaterno').val();
        const fechaNacimiento = $('#fechaNacimiento').val();
        const email = $('#email').val();
        const password = $('#password').val();
        
        if (!token) {
            throw new Error('Authentication token not found.');
        }
        
        var response;
        if (password != '') {
            response = await axios.put(ruta + '/users/update/' + userId, {
                nombre,
                apellidoPaterno,
                apellidoMaterno,
                fechaNacimiento,
                email,
                password
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } else {
            response = await axios.put(ruta + '/users/update/' + userId, {
                nombre,
                apellidoPaterno,
                apellidoMaterno,
                fechaNacimiento,
                email
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        if (response.data.code == 200) {
            alert('Save Data');
            window.location.href = '../Views/IndexLogin.html';
        } else {
            alert(response.data.message || 'Unknow Error');
        }
    } catch (error) {
        alert(error.message || 'Error connecting to server');
    }
}
/* Datos Salud */

document.addEventListener('DOMContentLoaded', validateToken);