import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { PDFDocument as PDFLib } from "pdf-lib";

export async function generarPDF(productos) {
    const nombreArchivo = `reporte_${Date.now()}.pdf`;
    const rutaPDF = path.join("public", nombreArchivo);

    // 📌 1. Crear PDF temporal
    const rutaTemp = path.join("public", "temp_" + nombreArchivo);
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(rutaTemp);
    doc.pipe(stream);

    // Header
    doc.fontSize(22).text("REPORTE DE PRODUCTOS", {
        align: "center",
    });

    doc.moveDown();

    // Listado
    productos.forEach((p, i) => {
        doc.fontSize(14).text(
            `${i + 1}. Nombre: ${p.nombre} | Precio: $${p.precio}`
        );
        doc.moveDown(0.5);
    });

    doc.end();

    // Esperar a que termine de escribir
    await new Promise((resolve) => stream.on("finish", resolve));

    // 📌 2. Abrir PDF temporal y encriptarlo con pdf-lib
    const bytes = fs.readFileSync(rutaTemp);
    const pdfDoc = await PDFLib.load(bytes);

    const pdfBytes = await pdfDoc.save({
        encrypt: {
            userPassword: "12345678",   // contraseña
            ownerPassword: "12345678",
            permissions: {
                printing: "highResolution",
                modifying: false,
                copying: false,
            },
        },
    });

    // Guardar PDF final encriptado
    fs.writeFileSync(rutaPDF, pdfBytes);

    // Borrar temporal
    fs.unlinkSync(rutaTemp);

    return nombreArchivo;
}
