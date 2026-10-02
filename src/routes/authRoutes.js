const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  uploadProfilePicture,
  updateAvatarUrl,
  switchRole,
  toggleFavorite,
  getFavorites,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

// Authentification & Session
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

// Profil utilisateur
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Gestion de la photo de profil (Fichier image OU URL/Base64)
router.post('/avatar', protect, uploadAvatar.single('avatar'), uploadProfilePicture);
router.put('/avatar', protect, updateAvatarUrl);

// Rôle & Favoris
router.put('/switch-role', protect, switchRole);
router.post('/favorites/:propertyId', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

module.exports = router;
