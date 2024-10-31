const express = require('express');
const { sql, poolPromise } = require('../config/db');
const router = express.Router();

// Crear un nuevo tema
router.post('/crear', async (req, res) => {
    const { titulo, contenido, usuario_id, categoria_id } = req.body;

    // Validar que el usuario y categoría existen
    const pool = await poolPromise;
    const userExists = await pool.request()
        .input('usuario_id', sql.Int, usuario_id)
        .query('SELECT COUNT(*) AS count FROM Usuarios WHERE id = @usuario_id');

    const categoryExists = await pool.request()
        .input('categoria_id', sql.Int, categoria_id)
        .query('SELECT COUNT(*) AS count FROM Categorias WHERE id = @categoria_id');

    if (userExists.recordset[0].count === 0) {
        return res.status(400).json({ error: 'El usuario no existe.' });
    }

    if (categoryExists.recordset[0].count === 0) {
        return res.status(400).json({ error: 'La categoría no existe.' });
    }

    try {
        await pool.request()
            .input('titulo', sql.NVarChar, titulo)
            .input('contenido', sql.Text, contenido)
            .input('usuario_id', sql.Int, usuario_id)
            .input('categoria_id', sql.Int, categoria_id)
            .query('INSERT INTO Temas (titulo, contenido, usuario_id, categoria_id) VALUES (@titulo, @contenido, @usuario_id, @categoria_id)');

        res.status(201).json({ message: 'Tema creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.get('/listar', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Temas');

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para editar un tema existente
router.put('/editar/:id', async (req, res) => {
    const { id } = req.params; // ID del tema a editar
    const { titulo, contenido, usuario_id, categoria_id } = req.body; // Nuevos datos del tema

    try {
        const pool = await poolPromise;
        // Actualiza los campos proporcionados en el cuerpo de la solicitud
        await pool.request()
            .input('id', sql.Int, id)
            .input('titulo', sql.NVarChar, titulo)
            .input('contenido', sql.Text, contenido)
            .input('usuario_id', sql.Int, usuario_id)
            .input('categoria_id', sql.Int, categoria_id)
            .query(`
                UPDATE Temas
                SET 
                    titulo = @titulo,
                    contenido = @contenido,
                    usuario_id = @usuario_id,
                    categoria_id = @categoria_id
                WHERE id = @id
            `);

        res.json({ message: 'Tema actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/eliminar/:id', async (req, res) => {
    const { id } = req.params; // ID del tema a eliminar

    try {
        const pool = await poolPromise;
        
        // Verificar si el tema existe antes de intentar eliminarlo
        const checkResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Temas WHERE id = @id');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Tema no encontrado.' });
        }

        // Eliminar el tema
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Temas WHERE id = @id');

        res.json({ message: 'Tema eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
