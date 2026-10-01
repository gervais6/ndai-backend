const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: false,
    },
    propertyTitle: {
      type: String,
      default: '',
    },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    candidateName: {
      type: String,
      required: [true, 'Nom du candidat requis'],
      trim: true,
    },
    candidatePhone: {
      type: String,
      required: [true, 'Numéro de téléphone requis'],
      trim: true,
    },
    avatarInitials: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      required: [true, 'Veuillez préciser la date de la visite'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Veuillez choisir un créneau horaire'],
      default: '14:30 - 15:00',
    },
    status: {
      type: String,
      enum: ['En attente', 'Confirmée', 'Effectuée', 'Annulée', 'en_attente', 'confirmee', 'annulee', 'effectuee'],
      default: 'En attente',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Visit', VisitSchema);
