const express = require('express');
const { sql, poolPromise } = require('../config/db'); // Asegúrate de que esta ruta sea correcta
const router = express.Router();

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
// Crear una nueva publicación
router.post('/crear',authenticateToken, async (req, res) => {
    const { contenido, usuario_id, tema_id } = req.body;
    if (!contenido || !usuario_id || !tema_id) {
        return res.status(400).json({ error: 'Contenido, usuario_id y tema_id son requeridos.' });
    }
    
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('contenido', sql.NVarChar, contenido)
            .input('usuario_id', sql.Int, usuario_id)
            .input('tema_id', sql.Int, tema_id)
            .query('INSERT INTO dbo.Publicaciones (contenido, usuario_id, tema_id) VALUES (@contenido, @usuario_id, @tema_id)');
        
        res.status(201).json({ message: 'Publicación creada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud: ' + error.message });

    }
});




// obtener todas las publicaciones
router.get('/listar', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Publicaciones');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud: ' + error.message });

    }
});

// actualizar publicaciones

router.put('/editar/:id',authenticateToken, async (req, res) => {
    const { contenido } = req.body;
    const { id } = req.params; // ID de la publicación a editar
    if (!contenido) {
        return res.status(400).json({ error: 'El contenido es requerido.' });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('contenido', sql.NVarChar, contenido)
            .input('id', sql.Int, id)
            .query('UPDATE Publicaciones SET contenido = @contenido WHERE id = @id');
        
        res.json({ message: 'Publicación actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud: ' + error.message });

    }
});

// eliminar publicaciones

router.delete('/eliminar/:id',authenticateToken, async (req, res) => {
    const { id } = req.params; // ID de la publicación a eliminar

    try {
        const pool = await poolPromise;

                // Verificar si la publicación existe antes de intentar eliminarla
                const checkResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Publicaciones WHERE id = @id');
            
            if (checkResult.recordset.length === 0) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }
    
    
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Publicaciones WHERE id = @id');
        
        res.json({ message: 'Publicación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud: ' + error.message });

    }
});


// filtrar publicaciones

router.get('/filtrar', async (req, res) => {
    const { tema_id, usuario_id } = req.query; // Usar parámetros de consulta

    try {
        const pool = await poolPromise;
        let query = 'SELECT * FROM Publicaciones WHERE 1=1'; // Base de la consulta

        if (tema_id) {
            query += ' AND tema_id = @tema_id';
        }
        if (usuario_id) {
            query += ' AND usuario_id = @usuario_id';
        }

        const request = pool.request();
        if (tema_id) request.input('tema_id', sql.Int, tema_id);
        if (usuario_id) request.input('usuario_id', sql.Int, usuario_id);
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud: ' + error.message });

    }
});


module.exports = router;
