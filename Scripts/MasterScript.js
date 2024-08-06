var ruta = 'http://18.118.227.186:3333';

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
            console.log(0)
            window.location.href = '../Views/Login.html';
            console.log(1)
        } else {
            errorMessage.textContent = response.data.message || 'Error desconocido';
        }
    })
    .catch(error => {
        errorMessage.textContent = error.message || 'Error al conectar con el servidor';
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
            alert('Inicio de sesión exitoso');
            // Redirigir o mostrar mensaje de éxito
            // window.location.href = '/ruta-deseada';
        } else {
            errorMessage.textContent = response.data.message || 'Error desconocido';
        }
    })
    .catch(error => {
        errorMessage.textContent = error.message || 'Error al conectar con el servidor';
    });
}
