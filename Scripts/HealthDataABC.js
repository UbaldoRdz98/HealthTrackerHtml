var caloriasxhora = 0;
var datosSaludDetalle = 0;
var tipoParam = '';
var idParam = 0;
var idDetail = 0;

function cancel(){
    window.location.href = '../Views/DatosSalud.html';
}

async function loadSelectActivitiesItems(){
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(ruta + '/catalogo-actividades/get', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const actividades = response.data;
        const selectActividad = $('#selectActivity');

        var band = false;

        actividades.forEach(actividad => {
            if(band == false){
                selectActividad.append(new Option(actividad.nombre, actividad.id));
                caloriasxhora = actividad.calorias_hora;
                band = true;
            } else {
                selectActividad.append(new Option(actividad.nombre, actividad.id));
            }
        });

    } catch (error) {
        console.error('Error getting activities:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    tipoParam = urlParams.get('tipo');
    idParam = urlParams.get('id');

    $("#titleHealthData").text(`${tipoParam} Health Data`);

    loadSelectActivitiesItems();

    if(tipoParam != 'Add') {
        getInfoHealthData(idParam);
        if (tipoParam == "See") {
            $('#selectActivity').prop('disabled', true);
            $('#fecha').prop('disabled', true);
            $('#duracion').prop('disabled', true);
            $('#distancia').prop('disabled', true);
            $('#calorias').prop('disabled', true);
            $('#saveButton').hide();
        }
    }
    
});

document.addEventListener('DOMContentLoaded', getUserInfo);

document.getElementById('selectActivity').addEventListener('change', function() {
    fetchActivitiesCalories($("#selectActivity").val());
    document.getElementById('duracion').value = '';
    document.getElementById('distancia').value = '';
    document.getElementById('calorias').value = '';
});

$('#duracion').on('input', function() {
    const intValue = parseInt($(this).val(), 10);
    var caloriasTotal = (60 * caloriasxhora) / intValue;
    $("#calorias").val(caloriasTotal);
});