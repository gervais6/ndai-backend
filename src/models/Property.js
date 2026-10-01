const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Veuillez renseigner le titre du logement'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '', // e.g. "24 m² · Douche & balcon"
    },
    price: {
      type: Number,
      required: [true, 'Veuillez renseigner le loyer mensuel en F CFA'],
    },
    pricePeriod: {
      type: String,
      default: '/ mois',
    },
    charges: {
      type: Number,
      default: 0,
    },
    deposit: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: [true, 'Veuillez renseigner la localisation'],
      trim: true,
    },
    neighborhood: {
      type: String,
      required: [true, 'Veuillez préciser le quartier (ex: Almadies, Ngor, Fann...)'],
      trim: true,
    },
    surfaceArea: {
      type: Number,
      default: 20,
    },
    pieces: {
      type: Number,
      default: 1,
    },
    bedrooms: {
      type: Number,
      default: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
    },
    floor: {
      type: String,
      default: 'RDC',
    },
    category: {
      type: String,
      enum: ['chambres', 'apparts', 'maisons', 'studios', 'villas'],
      default: 'chambres',
    },
    publisherRole: {
      type: String,
      enum: ['proprietaire', 'courtier', 'coloc', 'owner', 'broker'],
      default: 'proprietaire',
    },
    colocSplit: {
      type: String,
      default: '',
    },
    brokerageFee: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: [true, 'Veuillez fournir une photo principale'],
    },
    images: {
      type: [String],
      default: [],
    },
    imageAlt: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Disponible', 'Loué', 'En recherche active', 'Offre en cours'],
      default: 'Disponible',
    },
    statusType: {
      type: String,
      enum: ['available', 'rented', 'searching'],
      default: 'available',
    },
    walkScore: {
      type: Number,
      default: 90,
    },
    locationHighlight: {
      type: String,
      default: '',
    },
    energyBadge: {
      type: String,
      default: 'Classe A',
    },
    energySub: {
      type: String,
      default: 'Excellente aération naturelle',
    },
    expertQuote: {
      type: String,
      default: '',
    },
    amenities: [
      {
        icon: { type: String, default: 'checkmark-circle-outline' },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
      },
    ],
    advisor: {
      name: { type: String, default: 'Moussa Ndiaye' },
      role: { type: String, default: 'Conseiller Référent Dakar' },
      avatarUrl: { type: String, default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      rating: { type: Number, default: 4.9 },
      responseTime: { type: String, default: 'Moins de 10 min' },
      online: { type: Boolean, default: true },
    },
    tenant: {
      name: { type: String, default: '' },
      initials: { type: String, default: '' },
      leaseEnd: { type: String, default: '' },
      receiptStatus: { type: String, default: 'Quittance OK' },
    },
    pipeline: {
      applicationsCount: { type: Number, default: 0 },
      visitsCount: { type: Number, default: 0 },
    },
    leaseNote: {
      label: { type: String, default: '' },
      sublabel: { type: String, default: '' },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

PropertySchema.index({
  title: 'text',
  neighborhood: 'text',
  location: 'text',
  description: 'text',
});

module.exports = mongoose.model('Property', PropertySchema);
