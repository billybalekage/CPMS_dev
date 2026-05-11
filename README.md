<<<<<<< HEAD
# CPMS_billybalekage_v1
=======
# 🔌 CPMS - Customer Power Management System

Un système complet de gestion de distribution d'électricité avec tokens numériques de recharge et gestion des compteurs.

## 📋 Caractéristiques Principales

- ✅ **Authentification sécurisée** avec JWT + 2FA (OTP)
- ✅ **Gestion des clients** (privés, entreprises, usines)
- ✅ **Gestion des compteurs** d'électricité
- ✅ **Génération de tokens** numériques (20 chiffres) pour les recharges
- ✅ **Gestion des tarifs** par type de client
- ✅ **Historique des transactions** complet
- ✅ **Dashboard analytique** avec statistiques en temps réel
- ✅ **Système de rôles** (admin, comptable, vendeur, technicien)
- ✅ **Upload de fichiers** via Cloudinary
- ✅ **Notifications SMS** via Twilio
- ✅ **Protection anti-brute force** sur les tentatives de connexion

## 🛠️ Technologie

**Backend:**
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT pour l'authentification
- Cloudinary pour les uploads
- Brevo (ex-Sendinblue) pour les emails
- Twilio pour les SMS

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Axios
- React Router v7

## 📦 Installation

### Prérequis
- Node.js v18+
- MongoDB local ou cloud
- Comptes Cloudinary, Brevo, Twilio (optionnels)

### Étapes

1. **Cloner le projet**
```bash
git clone <repo-url>
cd CPMS
```

2. **Installer les dépendances du backend**
```bash
cd backend
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. **Installer les dépendances du frontend**
```bash
cd ../frontend
npm install
```

## 🚀 Démarrage

### Backend
```bash
cd backend

# Développement (avec nodemon)
npm run server

# Production
npm start
```

Le serveur démarre sur **http://localhost:7000**

### Frontend
```bash
cd frontend

# Développement
npm run dev

# Build production
npm run build
```

L'interface démarre sur **http://localhost:5173**

## 📂 Structure du Projet

```
backend/
├── SRC/
│   ├── config/           # Configuration (DB, Cloudinary, Email)
│   ├── controllers/      # Logique métier
│   ├── middlewares/      # Authentification, autorisation, etc.
│   ├── models/           # Schémas MongoDB
│   ├── routes/           # Définition des routes API
│   ├── services/         # Services (token, email, upload, OTP)
│   ├── Scripts/          # Scripts d'administration
│   ├── utils/            # Utilitaires (constantes, validateurs)
│   └── upload/           # Stockage temporaire des fichiers
├── .env                  # Variables d'environnement
├── .env.example          # Template des variables
├── package.json
└── server.js             # Point d'entrée

frontend/
├── src/
│   ├── pages/            # Pages principales
│   ├── components/       # Composants réutilisables
│   ├── assets/           # Images, icônes
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## 🔐 Authentification

### Flux de connexion
1. **Login** → Email + Mot de passe
2. **Vérification 2FA** → Code OTP envoyé par email
3. **JWT Token** → Génération et stockage en cookie

### Rôles et Permissions
| Rôle | Permissions |
|------|-------------|
| **admin** | Accès complet au système |
| **accountant** | Gestion financière, dashboards |
| **sales** | Gestion des ventes, tokens |
| **technician** | Gestion des compteurs |

## 💳 Processus de Vente

```mermaid
1. Client se connecte
   ↓
2. Sélectionne son compteur
   ↓
3. Choisit un montant de recharge
   ↓
4. Admin génère un TOKEN (20 chiffres)
   ↓
5. Token envoyé au client (email/SMS)
   ↓
6. Client entre le token dans son compteur
   ↓
7. Crédit activé (kWh calculé selon tarif)
```

## 📝 Génération de Tokens

**Format:** 20 chiffres
- **10 premiers chiffres:** Timestamp
- **10 derniers chiffres:** Hash HMAC-SHA256

**Exemple:** `1474405234 9876543210`

**Validation:** Régénération et comparaison HMAC

## 🔌 Endpoints API Principaux

### Authentification
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/verify-2fa` - Vérification OTP
- `POST /api/v1/auth/logout` - Déconnexion
- `POST /api/v1/auth/register` - Enregistrement (admin only)

### Clients
- `GET /api/v1/clients` - Liste des clients
- `POST /api/v1/clients/create` - Créer un client
- `PUT /api/v1/clients/:id` - Modifier un client
- `DELETE /api/v1/clients/:id` - Supprimer un client

### Ventes & Tokens
- `POST /api/v1/sales/create` - Créer une vente + générer token
- `GET /api/v1/sales` - Liste des ventes
- `POST /api/v1/sales/:id/cancel` - Annuler une vente

### Dashboard
- `GET /api/v1/dashboard/stats` - Statistiques générales
- `GET /api/v1/dashboard/revenue` - Revenus par période
- `GET /api/v1/dashboard/top-clients` - Top clients

## ⚙️ Variables d'Environnement

Voir `.env.example` pour la liste complète.

**Obligatoires:**
- `MONGO_URI` - Connection string MongoDB
- `JWT_SECRET` - Clé secrète pour les tokens
- `SENDER_EMAIL` - Email d'envoi des notifications
- `CLOUDINARY_*` - Identifiants Cloudinary

## 🐛 Dépannage

**Erreur: "Connexion MongoDB échouée"**
- Vérifier que MongoDB est lancé
- Vérifier `MONGO_URI` dans `.env`

**Erreur: "Token invalide"**
- Vérifier que `JWT_SECRET` est identique
- Supprimer les cookies et se reconnecter

**Erreur: "Twilio/Email ne fonctionne pas"**
- Vérifier les identifiants dans `.env`
- Vérifier les limites de quota

## 📊 Tests

```bash
# Linting
cd backend
npm run diag

# Tests (à implémenter)
npm test
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📜 Licence

Ce projet est sous licence ISC.

## 👤 Auteur

**Billy - Vibe Coding**

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository.

---

**Dernière mise à jour:** Avril 2026
>>>>>>> 3f47a17 (backend simple sans appel compteur)
