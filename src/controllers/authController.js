const User = require('../models/User');
const Property = require('../models/Property');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ndai_secret_fallback', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Nettoyage et normalisation du numéro de téléphone sénégalais
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\.]/g, '');
};

// Mapper les rôles frontend vers les rôles backend
const normalizeRole = (role) => {
  const map = {
    seeker: 'locataire',
    locataire: 'locataire',
    owner: 'proprietaire',
    proprietaire: 'proprietaire',
    broker: 'courtier',
    courtier: 'courtier',
    coloc: 'coloc',
    admin: 'admin',
  };
  return map[role] || 'locataire';
};

// @desc Inscription d'un utilisateur
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    let { prenom, nom, fullName, telephone, email, password, role } = req.body;

    if (!telephone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner au minimum un numéro de téléphone et un mot de passe',
      });
    }

    // Gestion du fullName si prenom et nom ne sont pas séparés
    if (fullName && (!prenom || !nom)) {
      const parts = fullName.trim().split(' ');
      prenom = parts[0] || 'Utilisateur';
      nom = parts.slice(1).join(' ') || 'Ndai';
    }

    if (!prenom) prenom = 'Utilisateur';
    if (!nom) nom = 'Ndai';

    const cleanPhone = normalizePhone(telephone);

    const userExists = await User.findOne({ telephone: cleanPhone });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà associé à un compte',
      });
    }

    const user = await User.create({
      prenom,
      nom,
      telephone: cleanPhone,
      email: email || '',
      password,
      role: normalizeRole(role),
      creditsBalance: 5, // 5 crédits offerts
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        fullName: user.fullName,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profession: user.profession,
        isVerified: user.isVerified,
        creditsBalance: user.creditsBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Connexion d'un utilisateur
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { telephone, email, password } = req.body;

    if ((!telephone && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner votre téléphone (ou email) et votre mot de passe',
      });
    }

    let query = {};
    if (telephone) {
      const cleanPhone = normalizePhone(telephone);
      // Chercher par numéro brut ou avec indicatif
      query = {
        $or: [
          { telephone: cleanPhone },
          { telephone: cleanPhone.replace('+221', '') },
          { telephone: `+221${cleanPhone.replace('+221', '')}` },
        ],
      };
    } else if (email) {
      query = { email: email.toLowerCase().trim() };
    }

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiant ou mot de passe incorrect',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiant ou mot de passe incorrect',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        fullName: user.fullName,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profession: user.profession,
        isVerified: user.isVerified,
        creditsBalance: user.creditsBalance,
        favoritesCount: user.favorites ? user.favorites.length : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Déconnexion d'un utilisateur
// @route POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      // Nettoyer les tokens de notifications liés à cet appareil
      await User.findByIdAndUpdate(req.user.id, { pushToken: '' });
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie. Vos sessions locales ont été clôturées.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir le profil de l'utilisateur connecté
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    const activePropertiesCount = await Property.countDocuments({ user: user._id });

    res.json({
      success: true,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        fullName: user.fullName,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profession: user.profession,
        isVerified: user.isVerified,
        creditsBalance: user.creditsBalance,
        activePropertiesCount,
        favorites: user.favorites,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mettre à jour le profil de l'utilisateur connecté
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const allowed = ['prenom', 'nom', 'email', 'profession', 'avatar', 'pushToken'];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Uploader une nouvelle photo de profil (Fichier image)
// @route POST /api/auth/avatar
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner un fichier image valide (JPG, PNG ou WEBP)',
      });
    }

    // Construction de l'URL absolue de l'avatar
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Photo de profil mise à jour avec succès',
      avatar: user.avatar,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mettre à jour la photo de profil via URL ou base64
// @route PUT /api/auth/avatar
exports.updateAvatarUrl = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar !== 'string' || !avatar.trim()) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir l'URL ou les données de l'image",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatar.trim() },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Photo de profil mise à jour avec succès',
      avatar: user.avatar,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Changer de mode / rôle actif (ex: passer en mode Propriétaire / Recherche)
// @route PUT /api/auth/switch-role
exports.switchRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Rôle manquant' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: normalizeRole(role) },
      { new: true }
    );

    res.json({
      success: true,
      message: `Mode changé en ${user.role}`,
      role: user.role,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Basculer un bien dans les favoris
// @route POST /api/auth/favorites/:propertyId
exports.toggleFavorite = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const user = await User.findById(req.user.id);

    const isFav = user.favorites.some((fav) => fav.toString() === propertyId);

    if (isFav) {
      user.favorites = user.favorites.filter((fav) => fav.toString() !== propertyId);
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();

    res.json({
      success: true,
      isFavorite: !isFav,
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir la liste des favoris de l'utilisateur
// @route GET /api/auth/favorites
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json({
      success: true,
      count: user.favorites.length,
      data: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};
