const express = require('express');
const authRoutes = require('./routes/auth');
const temaRoutes = require('./routes/temas');
const cors = require('cors')
const publicacionesRoutes = require('./routes/publicaciones');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/temas', temaRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});


app.listen(4000, () => {
    console.log('Servidor en ejecución en http://localhost:4000');
});




