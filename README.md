# 🏢 Ndai Backend API (Node.js, Express & MongoDB)

API REST complète et modulaire conçue sur mesure pour l'application mobile immobilière **Ndai** à Dakar (Sénégal) : https://github.com/gervais6/Ndai.git.

---

## 🎯 Fonctionnalités Clés & Logique Métier

1. **Authentification & Gestion des Profils (Dakar)** :
   - Inscription et Connexion via numéro de téléphone sénégalais (+221...) ou email avec mot de passe haché (bcrypt).
   - Rôles pris en charge : `locataire` (seeker), `proprietaire` (owner), `courtier` (broker), `coloc`, `admin`.
   - 5 crédits offerts à l'inscription pour tester l'application.
   - Gestion des favoris (Coups de Cœur).
   - Basculement instantané de mode (`locataire` ⇄ `proprietaire`).

2. **Logements & Biens Immobiliers** :
   - Répertoire complet des quartiers et zones de Dakar (Almadies, Ngor Virage, Fann Résidence, Sacré-Cœur 3, Point E, Ouakam, Mermoz...).
   - Filtres avancés par quartier, fourchette de loyer FCFA, pièces, chambres, type de déclarant (propriétaire, courtier, coloc).
   - Biens en vedette (`/api/properties/featured`) pour la section Coups de Cœur.
   - CRUD complet avec vérification des droits de modification / suppression.

3. **Demandes de Locataires (Leads & Matching)** :
   - Les locataires publient leurs recherches urgentes ou ciblées.
   - Masquage automatique du numéro de téléphone (`+221 77 ••• •• 34`) pour protéger les coordonnées du candidat.
   - **Déblocage de contact avec 1 crédit Ndai** : le propriétaire déduit 1 crédit de son solde pour révéler le numéro complet et contacter le candidat sur WhatsApp/Téléphone.

4. **Système de Crédits & Paiements Mobiles (Wave / Orange Money)** :
   - Solde de crédits et historique des transactions.
   - Packs de crédits adaptés au marché sénégalais :
     - **Pack Découverte** : 3 crédits (5 000 FCFA)
     - **Pack Standard** : 10 crédits + 2 offerts (15 000 FCFA)
     - **Pack Pro Courtier** : 25 crédits + 5 offerts (30 000 FCFA)
   - Simulation et intégration des recharges via Wave, Orange Money et Free Money.

5. **Planning des Visites** :
   - Réservation de créneaux de visite sur les biens immobiliers.
   - Suivi des statuts : `En attente`, `Confirmée`, `Effectuée`, `Annulée`.
   - Notifications automatiques au propriétaire et au candidat.

6. **Messagerie Intégrée & Notifications** :
   - Regroupement des conversations par fil de discussion (Threads) avec dernier message, badge de non-lus et référence au bien.
   - Système de notifications push / in-app lors d'une nouvelle visite, déblocage de lead ou message.

7. **Zones & Quartiers de Dakar** :
   - Endpoint officiel `/api/dakar/zones` synchronisé avec la base de données géographique de Dakar.

---

## 📁 Architecture du Projet

```
ndai-backend/
├── server.js                        # Point d'entrée de l'application Express
├── .env                             # Variables d'environnement (PORT, MONGO_URI, JWT)
├── .env.example
├── package.json
└── src/
    ├── config/
    │   └── db.js                    # Connexion MongoDB / Mongoose sécurisée
    ├── controllers/
    │   ├── authController.js        # Auth, Inscription, Profil, Favoris, Switch rôle
    │   ├── propertyController.js    # Biens, filtres Dakar, Coups de cœur, CRUD
    │   ├── requestController.js     # Demandes de locataires, déblocage 1 crédit
    │   ├── creditController.js      # Solde, packs et recharges Wave / Orange Money
    │   ├── visitController.js       # Prise et confirmation de créneaux de visite
    │   ├── messageController.js     # Messagerie, threads et notifications
    │   ├── notificationController.js# Notifications utilisateur
    │   └── dakarController.js       # Répertoire des zones et quartiers
    ├── data/
    │   └── dakarData.js             # Données officielles de Dakar et Packs de crédits
    ├── middleware/
    │   ├── authMiddleware.js        # Protect (JWT) & optionalAuth
    │   └── errorHandler.js          # Gestion globale des erreurs
    ├── models/
    │   ├── User.js                  # Modèle Utilisateur avec rôle et solde crédits
    │   ├── Property.js              # Modèle Logement à Dakar
    │   ├── TenantRequest.js         # Modèle Demande candidat avec déblocage
    │   ├── Visit.js                 # Modèle Visite
    │   ├── Message.js               # Modèle Message
    │   ├── CreditTransaction.js     # Modèle Transactions de crédits & Mobile Money
    │   └── Notification.js          # Modèle Notifications
    ├── routes/
    │   ├── authRoutes.js
    │   ├── propertyRoutes.js
    │   ├── requestRoutes.js
    │   ├── creditRoutes.js
    │   ├── visitRoutes.js
    │   ├── messageRoutes.js
    │   ├── notificationRoutes.js
    │   └── dakarRoutes.js
    └── scripts/
        ├── seed.js                  # Injection des données tests Dakar (Comptes, biens, leads)
        └── testEndpoints.js         # Script de vérification de l'intégrité des modules
```

---

## 🚀 Installation & Démarrage

### 1. Se positionner dans le dossier backend
```bash
cd c:\Users\DELL\Downloads\ndai-backend
```

### 2. Démarrer le serveur en mode développement
```bash
npm run dev
# ou
node server.js
```

Le serveur démarrera sur **http://localhost:5000**.

### 3. Peupler la base de données avec les données de test Dakar
```bash
npm run seed
```

Comptes de test générés lors du seeding :
- **Propriétaire bailleur** : Téléphone `+221774501234` | Mot de passe `password123`
- **Propriétaire (Sophie)** : Téléphone `+221771234567` | Mot de passe `password123`
- **Locataire / Chercheur** : Téléphone `+221781234567` | Mot de passe `password123`
- **Courtier agréé** : Téléphone `+221776543210` | Mot de passe `password123`

---

## 📡 Documentation des Endpoints

### 🔐 Authentification (`/api/auth`)
| Méthode | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Inscription (+221...) | Non |
| `POST` | `/api/auth/login` | Connexion (téléphone ou email) | Non |
| `GET` | `/api/auth/me` | Profil connecté + solde crédits | Oui (JWT) |
| `PUT` | `/api/auth/profile` | Mise à jour du profil | Oui (JWT) |
| `PUT` | `/api/auth/switch-role` | Basculer en mode `proprietaire` ou `locataire` | Oui (JWT) |
| `POST` | `/api/auth/favorites/:id`| Ajouter / retirer un logement des favoris | Oui (JWT) |
| `GET` | `/api/auth/favorites` | Liste des logements favoris | Oui (JWT) |

### 🏠 Logements & Biens (`/api/properties`)
| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/properties` | Liste des biens (filtres: neighborhood, minPrice, maxPrice, publisherRole, search) | Non |
| `GET` | `/api/properties/featured` | Coups de Cœur & logements vedettes à Dakar | Non |
| `GET` | `/api/properties/my` | Mes logements publiés | Oui (JWT) |
| `GET` | `/api/properties/:id` | Détails complets d'un logement | Non |
| `POST` | `/api/properties` | Publier un logement | Oui (JWT) |
| `PUT` | `/api/properties/:id` | Modifier un logement | Oui (JWT) |
| `DELETE` | `/api/properties/:id` | Supprimer un logement | Oui (JWT) |

### 👥 Demandes de Locataires & Leads (`/api/requests`)
| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/requests` | Liste des demandes (numéro masqué si verrouillé) | Non (Optionnelle) |
| `GET` | `/api/requests/my` | Mes recherches de logement | Oui (JWT) |
| `GET` | `/api/requests/:id` | Détail d'une demande | Non (Optionnelle) |
| `POST` | `/api/requests` | Publier une recherche de logement | Oui (JWT) |
| `POST` | `/api/requests/:id/unlock` | **Débloquer le contact (-1 crédit)** | Oui (JWT) |

### 💳 Crédits & Paiements Wave / Orange Money (`/api/credits`)
| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/credits/packs` | Liste des packs Découverte, Standard, Pro | Non |
| `GET` | `/api/credits/balance` | Solde actuel & historique des transactions | Oui (JWT) |
| `POST` | `/api/credits/recharge` | Recharger son compte via Wave / Orange Money | Oui (JWT) |

### 📅 Visites (`/api/visits`)
| Méthode | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/visits` | Demander un créneau de visite | Non / Oui |
| `GET` | `/api/visits/my` | Mes visites en tant que candidat | Oui (JWT) |
| `GET` | `/api/visits/owner` | Visites reçues par le propriétaire | Oui (JWT) |
| `PUT` | `/api/visits/:id/status`| Mettre à jour le statut (`Confirmée`, etc.) | Oui (JWT) |

### 💬 Messagerie (`/api/messages`)
| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/messages/threads` | Liste des fils de discussion avec dernier message | Oui (JWT) |
| `GET` | `/api/messages/:otherUserId` | Historique de chat avec un interlocuteur | Oui (JWT) |
| `POST` | `/api/messages` | Envoyer un message direct | Oui (JWT) |
| `PUT` | `/api/messages/read/:otherUserId` | Marquer les messages reçus comme lus | Oui (JWT) |

### 🔔 Notifications (`/api/notifications`)
| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/notifications` | Notifications de l'utilisateur | Oui (JWT) |
| `PUT` | `/api/notifications/:id/read` | Marquer une notification comme lue | Oui (JWT) |
| `PUT` | `/api/notifications/read-all` | Tout marquer comme lu | Oui (JWT) |

### 📍 Quartiers de Dakar (`/api/dakar`)
| Méthode | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/dakar/zones` | Liste hiérarchique des zones & quartiers de Dakar | Non |
