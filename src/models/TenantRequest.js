const mongoose = require('mongoose');

const TenantRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Veuillez renseigner le nom du demandeur'],
      trim: true,
    },
    initials: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Numéro de téléphone du candidat requis'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Titre de la recherche requis (ex: Chambre avec douche • Ngor Virage)'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Budget mensuel en FCFA requis'],
    },
    budget: {
      type: String,
      default: '', // e.g. "85 000 FCFA/mois"
    },
    typeTag: {
      type: String,
      default: 'Chambre douche',
    },
    surfaceArea: {
      type: Number,
      default: 18,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop&q=80',
    },
    location: {
      type: String,
      required: [true, 'Localisation souhaitée requise'],
      trim: true,
    },
    neighborhood: {
      type: String,
      required: [true, 'Quartier requis'],
      trim: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    urgentTitle: {
      type: String,
      default: 'URGENT · ENTRÉE DANS 48H',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    jobPill: {
      type: String,
      default: 'Cadre en CDI',
    },
    moveInPill: {
      type: String,
      default: 'Entrée immédiate',
    },
    depositStatus: {
      type: String,
      default: 'Caution prête (2 mois)',
    },
    depositAmount: {
      type: String,
      default: '',
    },
    specs: {
      type: String,
      default: '',
    },
    costText: {
      type: String,
      default: 'Coût de mise en relation: 1 Crédit ou 2 000 FCFA',
    },
    matchBanner: {
      type: String,
      default: '',
    },
    matchScore: {
      type: String,
      default: '98%',
    },
    description: {
      type: String,
      default: '',
    },
    propertyTypePill: {
      type: String,
      default: 'Chambre avec douche',
    },
    durationContract: {
      type: String,
      default: 'Bail 1 an renouvelable',
    },
    unlockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TenantRequest', TenantRequestSchema);
