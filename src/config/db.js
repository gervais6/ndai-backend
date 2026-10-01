const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ndai_db';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Détecte l'absence de serveur en 3 secondes
    });
    console.log(`✅ MongoDB connecté avec succès : ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Avertissement : Impossible de se connecter à MongoDB (${error.message})`);
    console.log(`💡 Note : Pour persister vos données, lancez MongoDB en local ou ajoutez un cluster MongoDB Atlas dans le fichier .env (MONGO_URI).`);
  }
};

module.exports = connectDB;
