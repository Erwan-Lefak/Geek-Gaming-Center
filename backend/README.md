# Geek Gaming Center - Backend

Backend Express avec PostgreSQL pour le système de réservation de Geek Gaming Center.

## Architecture

```
backend/
├── src/
│   ├── index.ts                    # Point d'entrée principal
│   ├── routes/
│   │   ├── booking.routes.ts     # Routes réservations
│   │   └── availability.routes.ts # Routes disponibilités
│   ├── services/
│   │   ├── booking.service.ts  # Service réservation
│   │   └── availability.service.ts # Service disponibilité
│   └── middleware/
│       └── auth.middleware.ts      # Middleware auth (placeholder)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Installation

### Prérequis
- **Node.js** 20+ avec npm
- **PostgreSQL** 15+ (installer via: `sudo apt-get install postgresql postgresql-contrib` sur Linux, ou via Homebrew sur Mac)

### Setup de la base de données

```bash
# 1. Créer la base de données
sudo -u postgres psql
CREATE DATABASE geek_gaming_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE geek_gaming_db TO postgres;
\q

# 2. Exécuter le script de setup (crée les tables et les ressources)
psql -U postgres -d geek_gaming_db -f setup-db.sql

# 3. Générer les créneaux horaires (30 jours)
npm run slots:generate
```

### Installation de l'application

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Vérifier l'installation

```bash
# Test du endpoint de santé
curl http://localhost:9000/health
```

## Scripts disponibles

- `npm run dev` - Démarrer le serveur avec nodemon (auto-reload)
- `npm run build` - Compiler le TypeScript
- `npm start` - Démarrer le serveur en production

## API Endpoints

### Disponibilités
- `GET /api/availability` - Récupérer les disponibilités
- `GET /api/availability/resources` - Lister les ressources

### Réservations
- `POST /api/booking/bookings` - Créer une réservation
- `GET /api/booking/bookings/:id` - Récupérer une réservation
- `DELETE /api/booking/bookings/:id` - Annuler une réservation
- `GET /api/booking/my` - Réservations de l'utilisateur (TODO)

### Santé
- `GET /health` - Vérifier l'état du serveur

## Base de données

### Tables créées (à créer manuellement)

```sql
CREATE TABLE resources (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  hourly_rate DECIMAL(10, 2) NOT NULL,
  specifications JSONB,
  availability_schedule JSONB,
  images JSONB DEFAULT '[]'::jsonb[],
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE time_slots (
  id VARCHAR(255) PRIMARY KEY,
  resource_id VARCHAR(255) NOT NULL REFERENCES resources(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  price DECIMAL(10, 2) NOT NULL,
  is_peak_hour BOOLEAN DEFAULT FALSE,
  booking_id VARCHAR(255) REFERENCES bookings(id),
  customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  slot_ids TEXT[] NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  payment_intent_id VARCHAR(255),
  deposit_paid BOOLEAN DEFAULT FALSE,
  no_show_penalty BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Caractéristiques

- **Validation atomique** : Les créneaux sont marqués réservés via SELECT FOR UPDATE
- **Compensation auto** : Transactions avec ROLLBACK en cas d'erreur
- **Prix dynamique** : Heures pleines/weekends à +25%
- **Express + TypeScript** : Backend typé et sécurisé
- **PostgreSQL** : Persistance des données

## Prochaine étapes

1. **Initialiser la base de données** avec les tables ci-dessus
2. **Implémenter l'authentification JWT** (placeholder actuel)
3. **Ajouter les webhooks Stripe** pour les paiements
4. **Connecter Redis** pour le cache des disponibilités
5. **Créer des seed data** pour tester l'application

## Notes

- Le middleware d'authentification est un placeholder pour l'instant
- Les ressources doivent être créées manuellement dans PostgreSQL
- Le système utilise des transactions ACID pour garantir l'intégrité
