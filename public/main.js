async function cargar() {
    const res = await fetch("/listar");
    const productos = await res.json();

    const tabla = document.getElementById("tabla");
    tabla.innerHTML = "";

    productos.forEach(p => {
        tabla.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.precio}</td>
                <td>
                    <a href="editar.html?id=${p.id}" class="btn btn-primary btn-sm">Editar</a>
                    <button onclick="borrar(${p.id})" class="btn btn-danger btn-sm">Borrar</button>
                </td>
            </tr>
        `;
    });
}

async function borrar(id) {
    if (!confirm("¿Seguro que deseas eliminarlo?")) return;

    await fetch(`/borrar/${id}`, { method: "DELETE" });
    cargar();
}

cargar();
document.getElementById("btnEnviarPDF").addEventListener("click", async () => {
    const correo = document.getElementById("correoDestino").value;

    if (!correo) {
        alert("Escribe un correo válido.");
        return;
    }

    // Llamamos al endpoint que genera el PDF y lo envía
    const res = await fetch(`/enviar-reporte?correo=${correo}`);
    const data = await res.json();

    const msg = document.getElementById("mensajeEnvio");

    if (data.error) {
        msg.innerHTML = `<span class="text-danger">❌ Error: ${data.error}</span>`;
    } else {
        // Mostrar mensaje con la contraseña
        msg.innerHTML = `
            <span class="text-success">✔ PDF enviado correctamente al correo ${correo}</span><br>
            <span class="fw-bold">Su contraseña es: ${data.password}</span>
        `;
    }
});


// ===============================
// 📍 ENVIAR UBICACIÓN POR CORREO
// ===============================
document.getElementById("btnEnviarUbicacion").addEventListener("click", async () => {
    const correo = prompt("📧 Ingresa el correo al que quieres enviar la ubicación:");
    if (!correo) return;

    if (!navigator.geolocation) {
        alert("El navegador no soporta geolocalización");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const nombre = prompt(" Nombre de la ubicación (ej: Mi Casa)") || "Ubicación enviada";

        const url = `http://localhost:3000/enviar-geo?correo=${correo}&lat=${lat}&lon=${lon}&nombre=${nombre}`;

        const res = await fetch(url);
        const data = await res.json();

        alert(data.mensaje || "Ubicación enviada");
    });
});


// ===============================
//  ABRIR CHAT DEL BOT DE TELEGRAM
// ===============================
document.getElementById("btnAbrirTelegram").addEventListener("click", () => {
    // usuario de bot
    window.open("http://t.me/serverstivenbot", "_blank");
});

