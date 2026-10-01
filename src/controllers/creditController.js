const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');
const { CREDIT_PACKS } = require('../data/dakarData');

// @desc Obtenir le solde de crédits et l'historique des transactions de l'utilisateur
// @route GET /api/credits/balance
exports.getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('creditsBalance prenom nom telephone');
    const transactions = await CreditTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      creditsBalance: user.creditsBalance,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir la liste des packs de crédits disponibles
// @route GET /api/credits/packs
exports.getPacks = async (req, res, next) => {
  try {
    res.json({
      success: true,
      packs: CREDIT_PACKS,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Recharger son compte en crédits via Wave / Orange Money / Free Money
// @route POST /api/credits/recharge
exports.recharge = async (req, res, next) => {
  try {
    const { packId, paymentMethod = 'wave', phoneNumber } = req.body;

    const selectedPack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!selectedPack) {
      return res.status(400).json({
        success: false,
        message: 'Pack de crédits invalide. Choisissez entre Découverte, Standard ou Pro.',
      });
    }

    const user = await User.findById(req.user.id);

    // Calcul des crédits avec éventuel bonus
    let creditsToAdd = selectedPack.credits;
    if (selectedPack.id === 'pack_standard') creditsToAdd += 2;
    if (selectedPack.id === 'pack_pro') creditsToAdd += 5;

    user.creditsBalance += creditsToAdd;
    await user.save();

    const tx = await CreditTransaction.create({
      user: user._id,
      amount: creditsToAdd,
      costFcfa: selectedPack.priceFcfa,
      type: 'purchase',
      paymentMethod,
      description: `Recharge ${selectedPack.name} (${creditsToAdd} crédits) via ${paymentMethod.toUpperCase()}`,
      status: 'completed',
    });

    await Notification.create({
      user: user._id,
      title: 'Compte rechargé avec succès !',
      subtitle: `+${creditsToAdd} crédits ajoutés à votre solde Ndai via ${paymentMethod.toUpperCase()}`,
      type: 'credit',
      linkType: 'credit',
      linkId: tx._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: `Félicitations ! Votre compte a été rechargé de ${creditsToAdd} crédits Ndai.`,
      newBalance: user.creditsBalance,
      transaction: tx,
    });
  } catch (error) {
    next(error);
  }
};
