import axios from "axios";
import fs from "fs";

export async function obtenerMapa(lat, lon) {
  const API_KEY = "pk.e368c92f83d071e0c42c3ef21de0e452"; // ← reemplazar

  const url = `https://maps.locationiq.com/v3/staticmap?key=${API_KEY}&center=${lat},${lon}&zoom=16&size=600x400&markers=icon:large-red-cutout|${lat},${lon}`;

  const rutaImagen = `./public/mapa_${Date.now()}.png`;

  const response = await axios({
    url,
    responseType: "arraybuffer"
  });

  fs.writeFileSync(rutaImagen, response.data);

  return rutaImagen;
}
