const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['visit', 'lead', 'message', 'credit', 'system'],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    linkType: {
      type: String,
      default: '', // 'property', 'visit', 'request', 'message'
    },
    linkId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
