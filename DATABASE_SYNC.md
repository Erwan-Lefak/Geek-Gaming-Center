# Synchronisation des Bases de Données

## 📋 Vue d'ensemble

Le projet utilise deux bases de données PostgreSQL :
- **Locale** : `postgresql://erwan:erwan@localhost:5432/geek_gaming_db`
- **Production** : Vercel Postgres (Prisma.io)

## ✅ Statut Actuel

Les deux bases de données sont **synchronisées** avec le même schéma Prisma incluant :
- ✅ 19 modèles (User, Customer, Equipment, Event, EventBooking, etc.)
- ✅ 13 enums (UserRole, EventType, PaymentMethod, etc.)
- ✅ Toutes les relations et index
- ✅ Nouvelles tables Event et EventBooking

## 🔄 Comment maintenir la synchronisation

### Option 1 : Utiliser Prisma Migrate (Recommandné pour le développement)

```bash
# 1. Créer une nouvelle migration après avoir modifié schema.prisma
DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public" npx prisma migrate dev --name nom_de_la_migration

# 2. Appliquer la migration en production
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma migrate deploy
```

### Option 2 : Utiliser Prisma DB Push (Plus rapide, moins de contrôle)

```bash
# 1. Pousser le schéma en local
DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public" npx prisma db push

# 2. Pousser le schéma en production
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma db push

# 3. Régénérer le Prisma Client
npx prisma generate
```

### Option 3 : Via Vercel (Automatique en production)

Lorsque vous déployez sur Vercel, le `postinstall` script exécute automatiquement :
```bash
npx prisma generate
```

Pour appliquer les migrations automatiquement au déploiement, ajoutez dans `package.json` :
```json
{
  "postinstall": "prisma generate && npx prisma migrate deploy"
}
```

## 📝 Processus de modification du schéma

1. **Modifier le schéma** : Éditez `prisma/schema.prisma`
2. **Tester en local** :
   ```bash
   DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public" npx prisma db push
   ```
3. **Créer une migration** (optionnel mais recommandé) :
   ```bash
   DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public" npx prisma migrate dev --name description
   ```
4. **Déployer en production** :
   ```bash
   git add .
   git commit -m "feat: description des changements"
   git push
   ```
   Vercel déploiera automatiquement avec le nouveau schéma.

## 🛠️ Commandes utiles

### Vérifier l'état des migrations
```bash
# Local
DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public" npx prisma migrate status

# Production
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma migrate status
```

### Réinitialiser la base de données (⚠️ Attention : perte de données)
```bash
# Local
DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public" npx prisma migrate reset

# Production (À éviter absolument !)
```

### Voir le schéma actuel
```bash
# Local
DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public" npx prisma studio

# Production
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma studio
```

### Pousser seulement le schéma (sans migration)
```bash
# Local
DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public" npx prisma db push

# Production
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma db push
```

## 🔐 Variables d'environnement

### Locale (.env.local)
```
DATABASE_URL="postgresql://erwan:erwan@localhost:5432/geek_gaming_db?schema=public"
```

### Production (Vercel)
Les variables sont déjà configurées dans Vercel :
- `DATABASE_URL`
- `POSTGRES_URL`
- `PRISMA_DATABASE_URL`

## 📊 Migrations existantes

### 20260409_init_events
- Ajout de l'enum `EventType`
- Création de la table `events`
- Création de la table `event_bookings`
- Ajout des indexes et foreign keys
- Ajout de la relation `eventBookings` dans `customers`

## ⚠️ Notes importantes

1. **Ne jamais utiliser `prisma migrate reset` en production** - cela supprime toutes les données
2. **Toujours tester les migrations en local** avant de déployer
3. **Faire des sauvegardes** avant d'appliquer des migrations en production
4. **Les migrations sont automatiques** sur Vercel si le script `postinstall` est configuré
5. **Vérifier les permissions** si vous avez des erreurs de création de tables

## 🚀 Déploiement

Le déploiement sur Vercel est automatique :
1. Push sur la branche `main`
2. Vercel détecte les changements
3. Build du projet
4. Exécution de `prisma generate`
5. Application des migrations avec `prisma migrate deploy` (si configuré)

## 📚 Ressources

- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma DB Push](https://www.prisma.io/docs/reference/api-reference/command-reference#db-push)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
