const mongoose = require('mongoose');

const CreditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true, // e.g. +3, +10, +25, or -1 (when unlocking lead)
    },
    costFcfa: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['purchase', 'spend_unlock_contact', 'bonus_welcome', 'refund'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['wave', 'orange_money', 'free_money', 'card', 'system'],
      default: 'wave',
    },
    transactionRef: {
      type: String,
      default: () => `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    description: {
      type: String,
      default: '',
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TenantRequest',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CreditTransaction', CreditTransactionSchema);
