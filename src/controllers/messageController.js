const Message = require('../models/Message');
const User = require('../models/User');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc Obtenir la liste des fils de discussion (Threads) pour l'utilisateur
// @route GET /api/messages/threads
exports.getThreads = async (req, res, next) => {
  try {
    const myId = req.user.id;

    // Récupérer tous les messages où l'utilisateur est soit émetteur soit destinataire
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'prenom nom role avatar')
      .populate('receiver', 'prenom nom role avatar')
      .populate('property', 'title location');

    // Regrouper par interlocuteur
    const threadsMap = new Map();

    messages.forEach((msg) => {
      const isSenderMe = msg.sender._id.toString() === myId.toString();
      const partner = isSenderMe ? msg.receiver : msg.sender;
      if (!partner) return;

      const partnerId = partner._id.toString();

      if (!threadsMap.has(partnerId)) {
        const initials = `${partner.prenom ? partner.prenom[0] : ''}${
          partner.nom ? partner.nom[0] : ''
        }`.toUpperCase();

        const timeStr = new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        threadsMap.set(partnerId, {
          id: partnerId,
          partnerId: partnerId,
          senderName: `${partner.prenom} ${partner.nom}`,
          senderRole: partner.role === 'proprietaire' ? 'Propriétaire bailleur' : 'Locataire Dakar',
          avatarUrl: partner.avatar,
          initials: initials || 'ND',
          lastMessage: msg.content,
          time: timeStr,
          timestamp: msg.createdAt,
          unreadCount: 0,
          propertyTitle: msg.propertyTitle || (msg.property ? msg.property.title : 'Logement Dakar'),
        });
      }

      // Compter les non lus adressés à moi
      if (!msg.read && msg.receiver._id.toString() === myId.toString()) {
        const thread = threadsMap.get(partnerId);
        thread.unreadCount += 1;
      }
    });

    const threadList = Array.from(threadsMap.values());

    res.json({
      success: true,
      count: threadList.length,
      data: threadList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Obtenir l'historique complet d'une conversation avec un utilisateur
// @route GET /api/messages/:otherUserId
exports.getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.otherUserId;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'prenom nom avatar role')
      .populate('receiver', 'prenom nom avatar role');

    // Marquer les messages entrants comme lus
    await Message.updateMany(
      { sender: otherUserId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Envoyer un message
// @route POST /api/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, propertyId, propertyTitle, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Destinataire et contenu du message requis',
      });
    }

    const senderUser = await User.findById(req.user.id);
    const receiverUser = await User.findById(receiverId);

    if (!receiverUser) {
      return res.status(404).json({ success: false, message: 'Destinataire introuvable' });
    }

    let pTitle = propertyTitle || '';
    if (propertyId && !pTitle) {
      const prop = await Property.findById(propertyId);
      if (prop) pTitle = prop.title;
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      property: propertyId || undefined,
      propertyTitle: pTitle,
      content,
      senderName: `${senderUser.prenom} ${senderUser.nom}`,
      senderRole: senderUser.role,
    });

    // Créer une notification pour le destinataire
    await Notification.create({
      user: receiverId,
      title: `Nouveau message de ${senderUser.prenom} ${senderUser.nom}`,
      subtitle: content.slice(0, 70),
      type: 'message',
      linkType: 'message',
      linkId: req.user.id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Marquer tous les messages d'un correspondant comme lus
// @route PUT /api/messages/read/:otherUserId
exports.markAsRead = async (req, res, next) => {
  try {
    const otherUserId = req.params.otherUserId;
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'Messages marqués comme lus' });
  } catch (error) {
    next(error);
  }
};
