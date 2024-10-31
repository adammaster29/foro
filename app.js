const express = require('express');
const authRoutes = require('./routes/auth');
const temaRoutes = require('./routes/temas');
const publicacionesRoutes = require('./routes/publicaciones');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/temas', temaRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});


app.listen(3000, () => {
    console.log('Servidor en ejecución en http://localhost:3000');
});