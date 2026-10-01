const TenantRequest = require('../models/TenantRequest');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');

// Masquer partiellement le numéro de téléphone pour les utilisateurs non débloqués
const maskPhone = (phone) => {
  if (!phone) return '+221 77 ••• •• ••';
  const clean = phone.trim();
  if (clean.length <= 6) return '+221 ••• •••';
  const start = clean.slice(0, 7);
  const end = clean.slice(-2);
  return `${start} •• •• ${end}`;
};

// @desc Obtenir toutes les demandes de locataires (Leads)
// @route GET /api/requests
exports.getRequests = async (req, res, next) => {
  try {
    const { neighborhood, minBudget, maxBudget, isUrgent, search } = req.query;
    let query = {};

    if (neighborhood && neighborhood !== 'ALL' && neighborhood !== 'Tout Dakar') {
      query.neighborhood = new RegExp(neighborhood, 'i');
    }

    if (minBudget || maxBudget) {
      query.price = {};
      if (minBudget) query.price.$gte = Number(minBudget);
      if (maxBudget) query.price.$lte = Number(maxBudget);
    }

    if (isUrgent === 'true') {
      query.isUrgent = true;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { neighborhood: new RegExp(search, 'i') },
        { specs: new RegExp(search, 'i') },
      ];
    }

    const requests = await TenantRequest.find(query).sort({ isUrgent: -1, createdAt: -1 });

    const currentUserId = req.user ? req.user.id.toString() : null;

    const formattedRequests = requests.map((item) => {
      const isUnlocked = currentUserId
        ? item.unlockedBy.some((uid) => uid.toString() === currentUserId)
        : false;

      return {
        id: item._id,
        _id: item._id,
        name: item.name,
        initials: item.initials || item.name.slice(0, 2).toUpperCase(),
        title: item.title,
        price: item.price,
        budget: item.budget || `${item.price.toLocaleString('fr-FR')} FCFA/mois`,
        typeTag: item.typeTag,
        surfaceArea: item.surfaceArea,
        imageUrl: item.imageUrl,
        isUrgent: item.isUrgent,
        urgentTitle: item.urgentTitle,
        isVerified: item.isVerified,
        jobPill: item.jobPill,
        moveInPill: item.moveInPill,
        location: item.location,
        neighborhood: item.neighborhood,
        depositStatus: item.depositStatus,
        depositAmount: item.depositAmount,
        specs: item.specs,
        costText: item.costText,
        isUnlocked: isUnlocked,
        phone: isUnlocked ? item.phone : maskPhone(item.phone),
        matchBanner: item.matchBanner,
        matchScore: item.matchScore,
        propertyTypePill: item.propertyTypePill,
        durationContract: item.durationContract,
        createdAt: item.createdAt,
      };
    });

    res.json({
      success: true,
      count: formattedRequests.length,
      data: formattedRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir une demande par son identifiant
// @route GET /api/requests/:id
exports.getRequestById = async (req, res, next) => {
  try {
    const item = await TenantRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Demande introuvable' });
    }

    const currentUserId = req.user ? req.user.id.toString() : null;
    const isUnlocked = currentUserId
      ? item.unlockedBy.some((uid) => uid.toString() === currentUserId)
      : false;

    res.json({
      success: true,
      data: {
        id: item._id,
        _id: item._id,
        name: item.name,
        initials: item.initials || item.name.slice(0, 2).toUpperCase(),
        title: item.title,
        price: item.price,
        budget: item.budget,
        typeTag: item.typeTag,
        surfaceArea: item.surfaceArea,
        imageUrl: item.imageUrl,
        isUrgent: item.isUrgent,
        urgentTitle: item.urgentTitle,
        isVerified: item.isVerified,
        jobPill: item.jobPill,
        moveInPill: item.moveInPill,
        location: item.location,
        neighborhood: item.neighborhood,
        depositStatus: item.depositStatus,
        specs: item.specs,
        isUnlocked,
        phone: isUnlocked ? item.phone : maskPhone(item.phone),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Créer une demande de recherche de logement (par un locataire)
// @route POST /api/requests
exports.createRequest = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.seeker = req.user ? req.user.id : undefined;

    if (!data.name && req.user) {
      data.name = `${req.user.prenom} ${req.user.nom}`;
    }
    if (!data.phone && req.user) {
      data.phone = req.user.telephone;
    }

    if (!data.initials && data.name) {
      data.initials = data.name.slice(0, 2).toUpperCase();
    }

    if (!data.budget && data.price) {
      data.budget = `${Number(data.price).toLocaleString('fr-FR')} FCFA/mois`;
    }

    const request = await TenantRequest.create(data);

    res.status(201).json({
      success: true,
      message: 'Votre recherche a été publiée sur Ndai. Les propriétaires vous contacteront sous peu.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Débloquer les coordonnées d'un candidat avec 1 crédit
// @route POST /api/requests/:id/unlock
exports.unlockRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const request = await TenantRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Demande introuvable' });
    }

    const user = await User.findById(req.user.id);

    // Vérifier si déjà débloqué
    const alreadyUnlocked = request.unlockedBy.some(
      (uid) => uid.toString() === user._id.toString()
    );

    if (alreadyUnlocked) {
      return res.json({
        success: true,
        message: 'Ce contact est déjà débloqué dans votre espace',
        phone: request.phone,
        data: request,
      });
    }

    // Vérifier le solde de crédits
    if (user.creditsBalance < 1) {
      return res.status(402).json({
        success: false,
        message: 'Solde insuffisant. Veuillez recharger vos crédits Ndai pour débloquer ce candidat.',
        creditsBalance: user.creditsBalance,
      });
    }

    // Déduire 1 crédit
    user.creditsBalance -= 1;
    await user.save();

    // Ajouter à la liste des débloqués
    request.unlockedBy.push(user._id);
    await request.save();

    // Enregistrer la transaction
    await CreditTransaction.create({
      user: user._id,
      amount: -1,
      costFcfa: 2000,
      type: 'spend_unlock_contact',
      paymentMethod: 'system',
      description: `Déblocage des coordonnées du candidat : ${request.name} (${request.title})`,
      relatedRequest: request._id,
    });

    // Créer une notification
    await Notification.create({
      user: user._id,
      title: 'Contact candidat débloqué !',
      subtitle: `Vous pouvez désormais joindre ${request.name} au ${request.phone}`,
      type: 'lead',
      linkType: 'request',
      linkId: request._id.toString(),
    });

    res.json({
      success: true,
      message: `Coordonnées de ${request.name} débloquées avec succès !`,
      phone: request.phone,
      remainingCredits: user.creditsBalance,
      candidate: {
        name: request.name,
        phone: request.phone,
        title: request.title,
        neighborhood: request.neighborhood,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir les demandes créées par le chercheur connecté
// @route GET /api/requests/my
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await TenantRequest.find({ seeker: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};
