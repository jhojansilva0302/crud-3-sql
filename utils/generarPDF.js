import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

// =========================
//  Verificar si qpdf existe
// =========================
function verificarQPDF() {
    return new Promise((resolve) => {
        exec("qpdf --version", (err, stdout) => {
            if (err) {
                console.error("❌ ERROR: qpdf NO está disponible en el sistema.");
                return resolve(false);
            }
            console.log("✔ qpdf detectado:", stdout.trim());
            resolve(true);
        });
    });
}

export async function generarPDF(productos) {

    // Verificar qpdf antes de continuar
    const qpdfDisponible = await verificarQPDF();
    if (!qpdfDisponible) {
        throw new Error("qpdf no está instalado o no está en el PATH del sistema.");
    }

    console.log("✔ Generando PDF temporal…");

    const nombreArchivo = `reporte_${Date.now()}.pdf`;
    const rutaPDF = path.join("public", nombreArchivo);

    const password = productos.length > 0 ? productos[0].id.toString() : "1234";

    // Crear PDF
    const pdfDoc = await PDFDocument.create();
    const fontTitulo = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontTexto = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let page = pdfDoc.addPage();
    let y = 750;

    page.drawText("REPORTE DE PRODUCTOS", {
        x: 150,
        y,
        size: 20,
        font: fontTitulo
    });

    y -= 40;

    page.drawText("NOMBRE", { x: 60, y, size: 14, font: fontTitulo });
    page.drawText("PRECIO", { x: 350, y, size: 14, font: fontTitulo });

    y -= 30;

    for (const p of productos) {
        page.drawText(p.nombre, { x: 60, y, size: 12, font: fontTexto });
        page.drawText(`$ ${p.precio}`, { x: 350, y, size: 12, font: fontTexto });
        y -= 20;
    }

    // Guardar PDF sin cifrar
    const tempFile = path.join("public", "temp.pdf");
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(tempFile, pdfBytes);

    console.log("✔ PDF temporal creado:", tempFile);

    // comando qpdf para cifrar
    const comando = `qpdf --encrypt ${password} ${password} 256 -- "${tempFile}" "${rutaPDF}"`;

    console.log("🔐 Ejecutando cifrado con qpdf…");
    console.log("Comando:", comando);

    // Ejecutar el comando
    await new Promise((resolve, reject) => {
        exec(comando, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ ERROR ejecutando qpdf:", error.message);
                console.error("STDERR:", stderr);
                return reject(error);
            }

            console.log("✔ PDF cifrado correctamente.");
            resolve();
        });
    });

    // Borrar archivo temporal
    fs.unlinkSync(tempFile);

    console.log("✔ Limpieza completa. Archivo final:", rutaPDF);

    // ✅ Devolver nombre de archivo y contraseña
return { nombreArchivo, password };

}
