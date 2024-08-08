function ABCHealthData(tipo, id) {
    window.location.href = `./DatosSaludABC.html?tipo=${encodeURIComponent(tipo)}&id=${encodeURIComponent(id)}`;
}

document.addEventListener('DOMContentLoaded', fetchHealthData);