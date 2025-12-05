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
    const clave = document.getElementById("clavePDF").value || "12345678";

    if (!correo) {
        alert("Escribe un correo válido.");
        return;
    }

    const res = await fetch(`/enviar-reporte?correo=${correo}&clave=${clave}`);

    const data = await res.json();

    const msg = document.getElementById("mensajeEnvio");

    if (data.error) {
        msg.innerHTML = `<span class="text-danger">❌ Error: ${data.error}</span>`;
    } else {
        msg.innerHTML = `<span class="text-success">✔ PDF enviado correctamente al correo ${correo}</span>`;
    }
});
