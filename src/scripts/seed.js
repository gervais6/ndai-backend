require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
const TenantRequest = require('../models/TenantRequest');
const Visit = require('../models/Visit');
const Message = require('../models/Message');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ndai_db';
    console.log(`📡 Connexion à MongoDB (${mongoUri})...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connecté à MongoDB avec succès.');

    console.log('🧹 Nettoyage des anciennes collections...');
    await Promise.all([
      Property.deleteMany({}),
      User.deleteMany({}),
      TenantRequest.deleteMany({}),
      Visit.deleteMany({}),
      Message.deleteMany({}),
      CreditTransaction.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('👤 Création des utilisateurs Ndai...');

    // 1. Propriétaire bailleur
    const ownerMamadou = await User.create({
      prenom: 'Mamadou',
      nom: 'Diallo',
      telephone: '+221774501234',
      email: 'mamadou.diallo@ndai.sn',
      password: 'password123',
      role: 'proprietaire',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      profession: 'Propriétaire bailleur & Investisseur',
      creditsBalance: 12,
      isVerified: true,
    });

    // 2. Propriétaire / Sophie Martin (du mock frontend)
    const ownerSophie = await User.create({
      prenom: 'Sophie',
      nom: 'Martin',
      telephone: '+221771234567',
      email: 'sophie.martin@ndai.sn',
      password: 'password123',
      role: 'proprietaire',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      profession: 'Propriétaire bailleur',
      creditsBalance: 8,
      isVerified: true,
    });

    // 3. Chercheur / Locataire
    const seekerAissatou = await User.create({
      prenom: 'Aïssatou',
      nom: 'Diop',
      telephone: '+221781234567',
      email: 'aissatou.diop@ndai.sn',
      password: 'password123',
      role: 'locataire',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
      profession: 'Ingénieure Logiciel',
      creditsBalance: 5,
      isVerified: true,
    });

    // 4. Courtier immobilier agréé
    const brokerIbrahima = await User.create({
      prenom: 'Ibrahima',
      nom: 'Ndiaye',
      telephone: '+221776543210',
      email: 'ibrahima.courtier@ndai.sn',
      password: 'password123',
      role: 'courtier',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      profession: 'Courtier Mandataire Dakar',
      creditsBalance: 25,
      isVerified: true,
    });

    console.log('🏠 Création des logements à Dakar...');

    const sampleProperties = [
      {
        title: 'Chambre avec douche & balcon • Fann Résidence',
        description: 'Superbe chambre spacieuse avec douche italienne privative et grand balcon ensoleillé face à la corniche. Accès sécurisé 24h/24.',
        details: 'Fann Résidence · 24 m² · Douche & balcon',
        neighborhood: 'Fann Résidence',
        location: 'Dakar · Fann Résidence (Corniche Ouest)',
        price: 110000,
        pricePeriod: '/ mois',
        deposit: 220000,
        charges: 10000,
        surfaceArea: 24,
        pieces: 1,
        bedrooms: 1,
        bathrooms: 1,
        floor: '1er étage avec balcon',
        category: 'chambres',
        publisherRole: 'proprietaire',
        status: 'Disponible',
        statusType: 'available',
        walkScore: 94,
        isFeatured: true,
        imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
        ],
        amenities: [
          { icon: 'wifi-outline', title: 'Fibre Optique', subtitle: 'Haut débit Orange Sénégal' },
          { icon: 'water-outline', title: 'Eau Courante', subtitle: 'Réserve d\'eau et surpresseur' },
          { icon: 'shield-checkmark-outline', title: 'Sécurité', subtitle: 'Gardiennage 24h/24' },
        ],
        tenant: {
          name: 'Thomas Diop',
          initials: 'TD',
          leaseEnd: "Bail actif jusqu'en 2026",
          receiptStatus: 'Quittance OK',
        },
        user: ownerSophie._id,
      },
      {
        title: 'Chambre avec douche • Ngor Virage',
        description: 'Chambre moderne ventilée avec salle d\'eau privative, à 3 minutes à pied de la plage de Ngor Virage. Calme absolu.',
        details: 'Ngor Virage · 18 m² · Douche interne',
        neighborhood: 'Ngor Virage',
        location: 'Dakar · Ngor Virage (Bord de mer)',
        price: 85000,
        pricePeriod: '/ mois',
        deposit: 170000,
        charges: 5000,
        surfaceArea: 18,
        pieces: 1,
        bedrooms: 1,
        bathrooms: 1,
        floor: 'RDC',
        category: 'chambres',
        publisherRole: 'proprietaire',
        status: 'En recherche active',
        statusType: 'searching',
        walkScore: 91,
        isFeatured: true,
        imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80',
        ],
        pipeline: {
          applicationsCount: 4,
          visitsCount: 2,
        },
        user: ownerSophie._id,
      },
      {
        title: 'Chambre avec balcon • Sacré-Cœur 3',
        description: 'Grande chambre avec balcon privatif donnant sur une rue résidentielle calme, à 2 minutes de la VDN et des commerces.',
        details: 'Sacré-Cœur 3 · 20 m² · Balcon privatif',
        neighborhood: 'Sacré-Cœur 3',
        location: 'Dakar · Sacré-Cœur 3 (VDN)',
        price: 90000,
        pricePeriod: '/ mois',
        deposit: 180000,
        charges: 10000,
        surfaceArea: 20,
        pieces: 1,
        bedrooms: 1,
        bathrooms: 1,
        floor: '2ème étage',
        category: 'chambres',
        publisherRole: 'proprietaire',
        status: 'Loué',
        statusType: 'rented',
        walkScore: 92,
        imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80',
        leaseNote: {
          label: 'Bail étudiant annuel',
          sublabel: 'Renouvellement en cours',
        },
        user: ownerMamadou._id,
      },
      {
        title: 'Appartement F3 Standing • Almadies Zone Ambassades',
        description: 'Magnifique appartement F3 avec séjour lumineux, cuisine équipée américaine, 2 suites parentales avec dressing, piscine commune et groupe électrogène.',
        details: 'Almadies · 110 m² · 3 pièces · Balcon vue mer',
        neighborhood: 'Almadies',
        location: 'Dakar · Almadies Zone Ambassades',
        price: 450000,
        pricePeriod: '/ mois',
        deposit: 900000,
        charges: 30000,
        surfaceArea: 110,
        pieces: 3,
        bedrooms: 2,
        bathrooms: 2,
        floor: '3ème étage avec ascenseur',
        category: 'apparts',
        publisherRole: 'courtier',
        brokerageFee: 450000,
        status: 'Disponible',
        statusType: 'available',
        walkScore: 96,
        isFeatured: true,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
        ],
        user: brokerIbrahima._id,
      },
      {
        title: 'Colocation Meublée • Point E Rue de Diourbel',
        description: 'Chambre individuelle dans grand appartement partagé tout équipé. Salon commun avec smart TV, cuisine moderne, femme de ménage incluse.',
        details: 'Point E · 22 m² privatif · Climatisation',
        neighborhood: 'Point E',
        location: 'Dakar · Point E Rue de Diourbel',
        price: 120000,
        pricePeriod: '/ mois',
        deposit: 120000,
        charges: 15000,
        surfaceArea: 22,
        pieces: 1,
        bedrooms: 1,
        bathrooms: 1,
        category: 'chambres',
        publisherRole: 'coloc',
        colocSplit: '50/50',
        status: 'Disponible',
        statusType: 'available',
        walkScore: 93,
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
        user: ownerMamadou._id,
      },
    ];

    const createdProps = await Property.insertMany(sampleProperties);

    console.log('👥 Création des demandes de locataires (Leads)...');

    const sampleRequests = [
      {
        name: 'Fatou Diop',
        initials: 'FD',
        phone: '+221774501234',
        title: 'Chambre avec douche • Ngor Virage',
        price: 85000,
        budget: '85 000 FCFA/mois',
        typeTag: 'Chambre douche',
        surfaceArea: 18,
        imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop&q=80',
        location: 'Dakar · Ngor Virage · À 3 min de la Plage',
        neighborhood: 'Ngor Virage',
        depositStatus: 'Caution prête (2 mois)',
        depositAmount: '170 000 FCFA',
        specs: 'Chambre · 18 m² · Douche privative',
        costText: 'Coût de mise en relation: 1 Crédit ou 2 000 FCFA',
        isUrgent: true,
        urgentTitle: 'URGENT · ENTRÉE DANS 48H',
        isVerified: true,
        jobPill: 'Consultante Digitale',
        moveInPill: 'Entrée immédiate',
        matchBanner: 'Correspondance 98% avec vos critères',
        matchScore: '98%',
        propertyTypePill: 'Chambre avec douche',
        durationContract: 'Bail 1 an renouvelable',
        seeker: seekerAissatou._id,
      },
      {
        name: 'Amadou Fall',
        initials: 'AF',
        phone: '+221775892341',
        title: 'Chambre avec douche • Fann Résidence',
        price: 110000,
        budget: '110 000 FCFA/mois',
        typeTag: 'Chambre douche',
        surfaceArea: 22,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
        location: 'Dakar · Fann Résidence (Corniche Ouest)',
        neighborhood: 'Fann Résidence',
        depositStatus: 'Caution prête (2 mois)',
        depositAmount: '220 000 FCFA',
        specs: 'Chambre · 22 m² · Douche & Balcon',
        costText: 'Coût de mise en relation: 1 Crédit ou 2 000 FCFA',
        isUrgent: false,
        isVerified: true,
        jobPill: 'Médecin Résident Fann',
        moveInPill: 'Entrée début de mois',
        matchBanner: 'Candidature vérifiée',
        matchScore: '95%',
        propertyTypePill: 'Chambre avec douche & balcon',
        durationContract: 'Bail long séjour',
      },
      {
        name: 'Mariama Sène',
        initials: 'MS',
        phone: '+221789011223',
        title: 'Studio ou Chambre • Sacré-Cœur 3',
        price: 95000,
        budget: '95 000 FCFA/mois',
        typeTag: 'Studio / Chambre',
        surfaceArea: 25,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        location: 'Dakar · Sacré-Cœur 3 (À 2 min VDN)',
        neighborhood: 'Sacré-Cœur 3',
        depositStatus: 'Caution prête',
        depositAmount: '190 000 FCFA',
        specs: 'Studio · 25 m² · Proche VDN',
        costText: 'Coût de mise en relation: 1 Crédit ou 2 000 FCFA',
        isUrgent: true,
        urgentTitle: 'URGENT · MUTATION DAKAR',
        isVerified: true,
        jobPill: 'Enseignante',
        moveInPill: 'Cette semaine',
        matchScore: '92%',
      },
    ];

    await TenantRequest.insertMany(sampleRequests);

    console.log('📅 Création des rendez-vous de visite...');

    const sampleVisits = [
      {
        candidateName: 'Clara Delorme',
        candidatePhone: '+221 77 450 12 34',
        propertyTitle: 'Chambre avec douche • Ngor Virage',
        date: 'Mercredi 1 Octobre',
        timeSlot: '14:30 - 15:00',
        status: 'Confirmée',
        avatarInitials: 'CD',
        property: createdProps[1]._id,
        owner: ownerSophie._id,
      },
      {
        candidateName: 'Julien Bernard',
        candidatePhone: '+221 76 890 23 45',
        propertyTitle: 'Chambre avec douche • Ngor Virage',
        date: 'Mercredi 1 Octobre',
        timeSlot: '16:00 - 16:30',
        status: 'Confirmée',
        avatarInitials: 'JB',
        property: createdProps[1]._id,
        owner: ownerSophie._id,
      },
      {
        candidateName: 'Élodie Mercier',
        candidatePhone: '+221 78 901 12 23',
        propertyTitle: 'Chambre avec balcon • Sacré-Cœur 3',
        date: 'Samedi 4 Octobre',
        timeSlot: '10:00 - 10:30',
        status: 'En attente',
        avatarInitials: 'EM',
        property: createdProps[2]._id,
        owner: ownerMamadou._id,
      },
    ];

    await Visit.insertMany(sampleVisits);

    console.log('💬 Création des messages tests...');

    const sampleMessages = [
      {
        sender: seekerAissatou._id,
        receiver: ownerSophie._id,
        property: createdProps[0]._id,
        propertyTitle: 'Chambre avec balcon • Fann',
        content: 'Bonjour, nous avons bien reçu la quittance de loyer de septembre, merci !',
        senderName: 'Aïssatou Diop',
        senderRole: 'Locataire',
        read: true,
      },
      {
        sender: ownerSophie._id,
        receiver: seekerAissatou._id,
        property: createdProps[0]._id,
        propertyTitle: 'Chambre avec balcon • Fann',
        content: 'Avec plaisir ! N\'hésitez pas si vous avez la moindre question concernant le logement.',
        senderName: 'Sophie Martin',
        senderRole: 'Propriétaire',
        read: false,
      },
    ];

    await Message.insertMany(sampleMessages);

    console.log('💳 Création de transactions de crédits...');

    await CreditTransaction.create({
      user: ownerMamadou._id,
      amount: 10,
      costFcfa: 15000,
      type: 'purchase',
      paymentMethod: 'wave',
      description: 'Recharge Pack Standard (10 crédits + 2 bonus) via Wave',
      status: 'completed',
    });

    console.log('🔔 Création de notifications...');

    await Notification.create({
      user: ownerSophie._id,
      title: 'Nouvelle visite confirmée',
      subtitle: 'Clara Delorme a confirmé le créneau du Mercredi à 14h30',
      type: 'visit',
    });

    console.log('\n==================================================');
    console.log('🎉 SEEDING TERMINÉ AVEC SUCCÈS POUR NDAI !');
    console.log(`- 4 Utilisateurs créés (Propriétaires, Locataires, Courtier)`);
    console.log(`- ${sampleProperties.length} Biens immobiliers à Dakar`);
    console.log(`- ${sampleRequests.length} Demandes de locataires (Leads)`);
    console.log(`- ${sampleVisits.length} Créneaux de visite`);
    console.log(`- Messages, Transactions Wave et Notifications injectés`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors du seeding :', err);
    process.exit(1);
  }
};

seedData();
