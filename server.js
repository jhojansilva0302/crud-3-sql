import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { generarPDF } from "./utils/generarPDF.js";
import { enviarCorreo } from "./utils/enviarCorreo.js";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ===============================
// 📌 LISTAR
// ===============================
app.get("/listar", async (req, res) => {
    const result = await pool.query("SELECT * FROM productos ORDER BY id ASC");
    res.json(result.rows);
});

// ===============================
// 📌 AGREGAR
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
// 📌 OBTENER POR ID
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
// 📌 EDITAR
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
// 📌 BORRAR
// ===============================
app.delete("/borrar/:id", async (req, res) => {
    const id = req.params.id;

    await pool.query("DELETE FROM productos WHERE id = $1", [id]);

    res.json({ mensaje: "Producto eliminado" });
});
// ===============================
// 📩 GENERAR PDF + ENVIAR AL CORREO
// ===============================
app.get("/enviar-reporte", async (req, res) => {
    try {
        const correo = req.query.correo;
        const clave = req.query.clave || "12345678"; // contraseña PDF

        if (!correo) {
            return res.status(400).json({ error: "Falta el correo: ?correo=correo@gmail.com" });
        }

        // Obtener productos desde SQL
        const result = await pool.query("SELECT * FROM productos ORDER BY id ASC");
        const productos = result.rows;

        // Generar PDF cifrado
        const archivo = await generarPDF(productos, clave);
        const rutaPDF = path.join("public", archivo);

        // 🚀 Usar función correcta
        await enviarCorreo(correo, rutaPDF);

        res.json({
            mensaje: "PDF generado, cifrado y enviado al correo",
            password: clave
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al generar o enviar el PDF" });
    }
});

// ===============================
// 🚀 INICIAR SERVIDOR
// ===============================
app.listen(3000, () =>
    console.log("Servidor Express corriendo en http://localhost:3000")
);