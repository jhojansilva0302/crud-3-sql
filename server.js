import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { generarPDF } from "./utils/generarPDF.js";
import { enviarCorreo } from "./utils/enviarCorreo.js";
import path from "path";
import { obtenerMapa } from "./utils/obtenerMapa.js";
import { enviarGeo } from "./utils/enviarGeo.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ===============================
//  LISTAR
// ===============================
app.get("/listar", async (req, res) => {
    const result = await pool.query("SELECT * FROM productos ORDER BY id ASC");
    res.json(result.rows);
});

// ===============================
//  AGREGAR
// ===============================
app.post("/agregar", async (req, res) => {
    const { nombre, precio } = req.body;

    const result = await pool.query(
        "INSERT INTO productos(nombre, precio) VALUES ($1, $2) RETURNING *",
        [nombre, precio]
    );

    res.json({ mensaje: "Producto agregado", producto: result.rows[0] });
});

// ===============================
//  OBTENER POR ID
// ===============================
app.get("/editar/:id", async (req, res) => {
    const id = req.params.id;

    const result = await pool.query(
        "SELECT * FROM productos WHERE id = $1",
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: "No existe el producto" });
    }

    res.json(result.rows[0]);
});

// ===============================
//  EDITAR
// ===============================
app.put("/editar/:id", async (req, res) => {
    const id = req.params.id;
    const { nombre, precio } = req.body;

    await pool.query(
        "UPDATE productos SET nombre = $1, precio = $2 WHERE id = $3",
        [nombre, precio, id]
    );

    res.json({ mensaje: "Producto actualizado" });
});

// ===============================
//  BORRAR
// ==============================
app.delete("/borrar/:id", async (req, res) => {
    const id = req.params.id;

    await pool.query("DELETE FROM productos WHERE id = $1", [id]);

    res.json({ mensaje: "Producto eliminado" });
});
// ===============================
//  GENERAR PDF + ENVIAR AL CORREO
// ===============================
app.get("/enviar-reporte", async (req, res) => {
    try {
        const correo = req.query.correo;

        if (!correo) {
            return res.status(400).json({ error: "Falta el correo: ?correo=correo@gmail.com" });
        }

        // Obtener productos desde SQL
        const result = await pool.query("SELECT * FROM productos ORDER BY id ASC");
        const productos = result.rows;

        // Generar PDF cifrado y obtener nombre de archivo y contraseña
        const { nombreArchivo, password } = await generarPDF(productos);
        const rutaPDF = path.join("public", nombreArchivo);

        // Enviar correo incluyendo la contraseña en el mensaje
        await enviarCorreo(correo, rutaPDF, password);

        // Responder al frontend con mensaje y contraseña
        res.json({
            mensaje: `PDF generado, cifrado y enviado al correo.`,
            password: password
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar o enviar el PDF" });
    }
});


import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_TOKEN = "8558510927:AAG8lr_x_Y3NqtMgVA4cIf0ppXgYmdxO7mQ";

const bot = new TelegramBot(TELEGRAM_TOKEN, {
    polling: {
        interval: 300,
        timeout: 60,
        autoStart: true
    }
});

// Evitar caída del servidor por ECONNRESET
bot.on("polling_error", (err) => {
    console.log("Polling error:", err.message);
});

// Mensajes
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const texto = msg.text?.toLowerCase() || "";

    console.log("Mensaje recibido:", texto);

    if (texto === "/start") {
        return bot.sendMessage(
            chatId,
            "¡Hola! Soy el bot del CRUD  \n\nComandos:\n" +
            "/listar - Ver productos\n" +
            "/info - Información del bot"
        );
    }

    if (texto === "/info") {
        return bot.sendMessage(chatId, "Soy un bot conectado al CRUD con PostgreSQL.");
    }

    if (texto === "/listar") {
        const result = await pool.query("SELECT * FROM productos ORDER BY id ASC");

        if (result.rows.length === 0) {
            return bot.sendMessage(chatId, "No hay productos aún");
        }

        let respuesta = "*Lista de productos:*\n\n";
        result.rows.forEach(p => {
            respuesta += `• *${p.nombre}* — $${p.precio}\n`;
        });

        return bot.sendMessage(chatId, respuesta, { parse_mode: "Markdown" });
    }



    bot.sendMessage(chatId, "No entendí el comando. Escribe /start");
});



// ===============================
//  ENVIAR GEOLOCALIZACIÓN + IMAGEN DEL MAPA
// ===============================
app.get("/enviar-geo", async (req, res) => {
    const { correo, lat, lon, nombre } = req.query;

    if (!correo || !lat || !lon) {
        return res.status(400).json({
            error: "Faltan datos: /enviar-geo?correo=x@gmail.com&lat=4.6&lon=-74.2&nombre=casa"
        });
    }

    try {
        //  Obtener imagen del mapa
        const mapa = await obtenerMapa(lat, lon);

        //  Enviar correo con el mapa y la info
        await enviarGeo(correo, lat, lon, nombre, mapa);

        res.json({
            mensaje: "Geolocalización enviada con imagen del mapa",
            maps_url: `https://www.google.com/maps?q=${lat},${lon}`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error enviando geolocalización" });
    }
});

// ===============================
//  INICIAR SERVIDOR
// ===============================
app.listen(3000, () =>
    console.log("Servidor Express corriendo en http://localhost:3000")
);