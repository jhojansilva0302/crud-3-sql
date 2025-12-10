import nodemailer from "nodemailer";

export async function enviarGeo(correo, lat, lon, nombre = "Ubicación enviada", imagenMapa) {
  try {
    const url = `https://www.google.com/maps?q=${lat},${lon}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "jhojansilva0302@gmail.com",
        pass: "scqmwjvztwgtapxq",
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: '"Sistema CRUD" <jhojansilva0302@gmail.com>',
      to: correo,
      subject: `Ubicación: ${nombre}`,
      html: `
        <h2>${nombre}</h2>
        <p>Coordenadas:</p>
        <ul>
          <li><strong>Latitud:</strong> ${lat}</li>
          <li><strong>Longitud:</strong> ${lon}</li>
        </ul>
        <p><a href="${url}" target="_blank">Ver en Google Maps</a></p>
        <br>
        <h3>Vista del mapa:</h3>
        <img src="cid:mapaLocal" style="width: 500px; border-radius: 10px;">
      `,
      attachments: [
        {
          filename: "mapa.png",
          path: imagenMapa,
          cid: "mapaLocal"
        }
      ]
    });

    console.log("Correo con mapa enviado");
    return true;

  } catch (error) {
    console.error("Error enviando correo con mapa:", error);
    throw error;
  }
}
