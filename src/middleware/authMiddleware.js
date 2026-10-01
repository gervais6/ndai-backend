const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ndai_secret_fallback');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Non autorisé, session expirée ou invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Non autorisé, veuillez vous connecter' });
  }
};

// Middleware d'authentification optionnelle (pour savoir qui est connecté sans bloquer la requête)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ndai_secret_fallback');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignorer l'erreur, req.user restera null
    }
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès non autorisé pour ce profil`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
