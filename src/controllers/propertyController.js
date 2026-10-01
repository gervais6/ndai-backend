const Property = require('../models/Property');

// @desc Lister tous les biens avec filtres Dakar avancés
// @route GET /api/properties
exports.getProperties = async (req, res, next) => {
  try {
    const {
      neighborhood,
      category,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      publisherRole,
      colocOnly,
      search,
      status,
      sortBy,
      page = 1,
      limit = 30,
    } = req.query;

    let query = {};

    // Quartier Dakar
    if (neighborhood && neighborhood !== 'ALL' && neighborhood !== 'Tout Dakar') {
      query.neighborhood = new RegExp(neighborhood, 'i');
    }

    // Catégorie (chambres, apparts, maisons, etc.)
    if (category && category !== 'all') {
      query.category = category;
    }

    // Fourchette de prix (FCFA)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Chambres & Salles de bain
    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }
    if (bathrooms) {
      query.bathrooms = { $gte: Number(bathrooms) };
    }

    // Rôle du déclarant (propriétaire, courtier, coloc)
    if (publisherRole) {
      query.publisherRole = publisherRole;
    }

    if (colocOnly === 'true') {
      query.publisherRole = 'coloc';
    }

    // Statut
    if (status) {
      query.status = status;
    }

    // Recherche plein texte ou par mot clé
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { neighborhood: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { details: new RegExp(search, 'i') },
      ];
    }

    // Tri
    let sort = { createdAt: -1 };
    if (sortBy === 'price_asc') sort = { price: 1 };
    if (sortBy === 'price_desc') sort = { price: -1 };
    if (sortBy === 'surface_desc') sort = { surfaceArea: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('user', 'prenom nom telephone avatar')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: properties.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir les Coups de Cœur & Biens en Vedette à Dakar
// @route GET /api/properties/featured
exports.getFeaturedProperties = async (req, res, next) => {
  try {
    const featured = await Property.find({
      $or: [{ isFeatured: true }, { walkScore: { $gte: 92 } }],
    })
      .limit(6)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: featured.length,
      data: featured,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir les biens créés par l'utilisateur connecté
// @route GET /api/properties/my
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir un bien par son identifiant
// @route GET /api/properties/:id
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'user',
      'prenom nom telephone email avatar isVerified'
    );

    if (!property) {
      return res.status(404).json({ success: false, message: 'Logement introuvable' });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

// @desc Créer un nouveau bien (Propriétaire / Courtier / Coloc)
// @route POST /api/properties
exports.createProperty = async (req, res, next) => {
  try {
    const propertyData = { ...req.body };
    propertyData.user = req.user ? req.user.id : undefined;

    // Définir les détails condensés si absents
    if (!propertyData.details && propertyData.surfaceArea) {
      propertyData.details = `${propertyData.surfaceArea} m² · ${propertyData.bedrooms || 1} ch. · ${propertyData.floor || 'RDC'}`;
    }

    // Image par défaut si aucune fournie
    if (!propertyData.imageUrl) {
      propertyData.imageUrl =
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80';
    }

    if (!propertyData.images || propertyData.images.length === 0) {
      propertyData.images = [propertyData.imageUrl];
    }

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Logement publié avec succès sur Ndai',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mettre à jour un bien
// @route PUT /api/properties/:id
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Logement introuvable' });
    }

    // Vérification de propriété (sauf admin)
    if (
      property.user &&
      property.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne possédez pas les autorisations pour modifier ce logement',
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Logement mis à jour avec succès',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Supprimer un bien
// @route DELETE /api/properties/:id
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Logement introuvable' });
    }

    if (
      property.user &&
      property.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne possédez pas les autorisations pour supprimer ce logement',
      });
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Logement supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
