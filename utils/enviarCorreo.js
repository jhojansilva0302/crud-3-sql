import nodemailer from "nodemailer";
import fs from "fs";

export async function enviarCorreo(destinatario, archivoPDF) {
  try {
    // ===============================
    // CONFIGURAR GMAIL
    // ===============================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jhojansilva0302@gmail.com",     // 👉 TU CORREO AQUÍ
        pass: "scqmwjvztwgtapxq",       // 👉 CONTRASEÑA DE APLICACIÓN AQUÍ
      },
    });

    // ===============================
    // ARMAR CORREO
    // ===============================
    const mailOptions = {
      from: '"Sistema CRUD" <jhojansilva0302@gmail.com>',
      to: destinatario,
      subject: "Reporte PDF - Sistema CRUD con PostgreSQL",
      text: "Hola, aquí tienes el reporte en PDF generado desde el sistema.",
      
      attachments: [
        {
          filename: "reporte.pdf",
          path: archivoPDF,
          contentType: "application/pdf",
        },
      ],
    };

    // ===============================
    // ENVIAR CORREO
    // ===============================
    await transporter.sendMail(mailOptions);

    console.log("Correo enviado correctamente");
    return true;

  } catch (error) {
    console.error("Error enviando correo:", error);
    throw error;
  }
}
