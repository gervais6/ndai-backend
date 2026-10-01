const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    prenom: {
      type: String,
      required: [true, 'Veuillez renseigner votre prénom'],
      trim: true,
    },
    nom: {
      type: String,
      required: [true, 'Veuillez renseigner votre nom'],
      trim: true,
    },
    telephone: {
      type: String,
      required: [true, 'Veuillez renseigner votre numéro de téléphone (+221...)'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Veuillez renseigner un mot de passe'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['locataire', 'proprietaire', 'courtier', 'coloc', 'seeker', 'owner', 'broker', 'admin'],
      default: 'locataire',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    profession: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    creditsBalance: {
      type: Number,
      default: 5, // 5 crédits offerts à l'inscription
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
    pushToken: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual fullName
UserSchema.virtual('fullName').get(function () {
  return `${this.prenom} ${this.nom}`.trim();
});

// Virtual initials
UserSchema.virtual('initials').get(function () {
  const p = this.prenom ? this.prenom[0].toUpperCase() : '';
  const n = this.nom ? this.nom[0].toUpperCase() : '';
  return `${p}${n}` || 'ND';
});

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
