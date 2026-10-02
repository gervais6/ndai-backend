require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Connexion à la base de données MongoDB
connectDB();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre le dossier d'uploads public pour l'accès aux photos de profil
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Ndai API Backend (Dakar, Sénégal)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      requests: '/api/requests',
      credits: '/api/credits',
      visits: '/api/visits',
      messages: '/api/messages',
      notifications: '/api/notifications',
      dakar: '/api/dakar',
    },
  });
});

// Montage des routes API REST
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/properties', require('./src/routes/propertyRoutes'));
app.use('/api/requests', require('./src/routes/requestRoutes'));
app.use('/api/credits', require('./src/routes/creditRoutes'));
app.use('/api/visits', require('./src/routes/visitRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/dakar', require('./src/routes/dakarRoutes'));

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.originalUrl}`,
  });
});

// Middleware de gestion globale des erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Serveur Ndai Backend démarré sur le port ${PORT}`);
  console.log(`📡 URL API : http://localhost:${PORT}/api/health`);
  console.log(`🏠 Biens : http://localhost:${PORT}/api/properties`);
  console.log(`👥 Demandes : http://localhost:${PORT}/api/requests`);
  console.log(`💳 Crédits : http://localhost:${PORT}/api/credits/packs`);
  console.log(`🔑 Auth : http://localhost:${PORT}/api/auth/login`);
  console.log(`📷 Uploads: http://localhost:${PORT}/uploads/avatars/`);
  console.log(`==================================================\n`);
});
