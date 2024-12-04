const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Archivos estáticos

// Configuración de la base de datos
const db = mysql.createConnection({
    host: '35.239.247.147', // Cambia si es necesario
    user: 'esme',
    password: 'posgres',
    database: 'productos_db',
    port: 3306
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err.message);
        return;
    }
    console.log('Conectado a la base de datos');
});

// Ruta para servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para agregar productos
app.post('/add-product', (req, res) => {
    const { name, price, quantity } = req.body;

    if (!name || !price || !quantity) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const query = 'INSERT INTO productos (name, price, quantity, created_at) VALUES (?, ?, ?, NOW())';
    db.query(query, [name, price, quantity], (err, result) => {
        if (err) {
            console.error('Error al guardar el producto:', err.message);
            return res.status(500).send('Error al guardar el producto');
        }
        res.status(200).send('Producto agregado');
    });
});

// Ruta para eliminar productos
app.delete('/delete-product/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM productos WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err.message);
            return res.status(500).send('Error al eliminar el producto');
        }
        if (result.affectedRows > 0) {
            res.status(200).send('Producto eliminado');
        } else {
            res.status(404).send('Producto no encontrado');
        }
    });
});

// Servidor escuchando
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
