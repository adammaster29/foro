
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { nombre, correo, contraseña } = req.body;
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('correo', sql.NVarChar, correo)
            .input('contraseña', sql.NVarChar, hashedPassword)
            .query('INSERT INTO Usuarios (nombre, correo, contraseña) VALUES (@nombre, @correo, @contraseña)');
        
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .query('SELECT * FROM Usuarios WHERE correo = @correo');

        const usuario = result.recordset[0];

        if (usuario && await bcrypt.compare(contraseña, usuario.contraseña)) {
            const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Nuevo endpoint para obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, nombre, correo FROM Usuarios');

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
