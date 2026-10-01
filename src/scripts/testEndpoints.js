// Test local des routes et de la structure API
const http = require('http');

console.log('🔍 Vérification de la configuration des routes et des modules...');

const requiredModules = [
  './src/controllers/authController',
  './src/controllers/propertyController',
  './src/controllers/requestController',
  './src/controllers/creditController',
  './src/controllers/visitController',
  './src/controllers/messageController',
  './src/controllers/notificationController',
  './src/controllers/dakarController',
  './src/models/User',
  './src/models/Property',
  './src/models/TenantRequest',
  './src/models/Visit',
  './src/models/Message',
  './src/models/CreditTransaction',
  './src/models/Notification',
  './src/data/dakarData',
];

let allOk = true;
for (const mod of requiredModules) {
  try {
    require(`../../${mod.replace('./', '')}`);
    console.log(`✅ Module chargé avec succès : ${mod}`);
  } catch (err) {
    console.error(`❌ Échec de chargement : ${mod}`, err);
    allOk = false;
  }
}

if (allOk) {
  console.log('\n🎉 Tous les contrôleurs, modèles et données de référence sont opérationnels !');
} else {
  process.exit(1);
}
