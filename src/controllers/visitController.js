const Visit = require('../models/Visit');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc Demander un créneau de visite
// @route POST /api/visits
exports.requestVisit = async (req, res, next) => {
  try {
    const { propertyId, propertyTitle, date, timeSlot, notes, candidateName, candidatePhone } = req.body;

    let property = null;
    if (propertyId) {
      property = await Property.findById(propertyId);
    }

    const cName = candidateName || (req.user ? `${req.user.prenom} ${req.user.nom}` : 'Candidat Ndai');
    const cPhone = candidatePhone || (req.user ? req.user.telephone : '+221 77 000 00 00');
    const initials = cName.slice(0, 2).toUpperCase();

    const visit = await Visit.create({
      property: propertyId || undefined,
      propertyTitle: propertyTitle || (property ? property.title : 'Logement Dakar'),
      seeker: req.user ? req.user.id : undefined,
      owner: property ? property.user : undefined,
      candidateName: cName,
      candidatePhone: cPhone,
      avatarInitials: initials,
      date: date || 'Prochainement',
      timeSlot: timeSlot || '14:30 - 15:00',
      notes: notes || '',
      status: 'En attente',
    });

    // Notifier le propriétaire si identifié
    if (property && property.user) {
      await Notification.create({
        user: property.user,
        title: 'Nouvelle demande de visite !',
        subtitle: `${cName} souhaite visiter "${property.title}" le ${visit.date}`,
        type: 'visit',
        linkType: 'visit',
        linkId: visit._id.toString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Demande de visite transmise avec succès au propriétaire',
      data: visit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Récupérer les visites en tant que chercheur / candidat
// @route GET /api/visits/my
exports.getMyVisits = async (req, res, next) => {
  try {
    const visits = await Visit.find({ seeker: req.user.id })
      .populate('property')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    next(error);
  }
};

// @desc Récupérer les visites reçues en tant que propriétaire / courtier
// @route GET /api/visits/owner
exports.getOwnerVisits = async (req, res, next) => {
  try {
    // Si owner est direct ou via ses biens
    const properties = await Property.find({ user: req.user.id }).select('_id');
    const propertyIds = properties.map((p) => p._id);

    const visits = await Visit.find({
      $or: [{ owner: req.user.id }, { property: { $in: propertyIds } }],
    })
      .populate('property')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    next(error);
  }
};

// @desc Mettre à jour le statut d'une visite (Confirmée, Effectuée, Annulée)
// @route PUT /api/visits/:id/status
exports.updateVisitStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visite introuvable' });
    }

    visit.status = status;
    await visit.save();

    // Notifier le demandeur
    if (visit.seeker) {
      await Notification.create({
        user: visit.seeker,
        title: `Visite ${status} !`,
        subtitle: `Votre créneau pour "${visit.propertyTitle}" a été mis à jour: ${status}`,
        type: 'visit',
        linkType: 'visit',
        linkId: visit._id.toString(),
      });
    }

    res.json({
      success: true,
      message: `Statut de la visite mis à jour : ${status}`,
      data: visit,
    });
  } catch (error) {
    next(error);
  }
};
