# 🎮 Système d'Onboarding Complet - Geek Gaming Center

## 📋 Vue d'ensemble

Ce système fournit un flux d'inscription complet avec vérification email et SMS, inspiré de Karma Pilates mais modernisé avec Resend et Twilio.

## 🏗️ Architecture

### **Base de données**
- **Table `mail_templates`** : Stocke tous les templates d'emails
- **Table `customers`** : Utilise les champs existants pour stocker les tokens de vérification

### **Services**

1. **MailService** (`src/lib/email/mail-service.ts`)
   - Service d'envoi d'emails via **Resend**
   - Templates stockés en base de données
   - Remplacement automatique des placeholders
   - Wrapper HTML pour compatibilité email clients

2. **SmsService** (`src/lib/sms/sms-service.ts`)
   - Service d'envoi SMS via **Twilio**
   - Génération de codes à 6 chiffres
   - Vérification et expiration des codes
   - Mode simulation pour développement

## 🔄 Flux d'Onboarding

### **Étape 1: Inscription**
```
POST /api/auth/register
```

**Données requises:**
- firstName, lastName
- email (unique)
- phone (format international)
- acceptCGV (true)

**Action:**
1. Crée le compte client (inactif)
2. Génère token email (24h) + code SMS (15 min)
3. Envoie email de vérification
4. Envoie SMS avec code à 6 chiffres
5. Notifie l'admin

**Réponse:**
```json
{
  "success": true,
  "message": "Compte créé avec succès ! Vérifie ton email et ton téléphone.",
  "data": {
    "customerId": "xxx",
    "emailSent": true,
    "smsSent": true,
    "nextSteps": [
      "1. Ouvre ton email et clique sur le lien de vérification",
      "2. Entre le code SMS que tu as reçu",
      "3. Crée ton mot de passe",
      "4. Ton compte sera activé !"
    ]
  }
}
```

### **Étape 2: Vérification Email**
```
POST /api/auth/verify-email
```

**Données requises:**
- token (reçu dans l'email)

**Action:**
1. Valide le token
2. Vérifie qu'il n'est pas expiré (24h)
3. Marque l'email comme vérifié
4. Envoie email de confirmation

**Réponse:**
```json
{
  "success": true,
  "message": "Email vérifié avec succès !",
  "data": {
    "customerId": "xxx",
    "emailVerified": true,
    "nextStep": "Vérifie maintenant ton numéro de téléphone",
    "phoneVerificationUrl": "/verify-phone?customer=xxx"
  }
}
```

### **Étape 3: Vérification Téléphone (SMS)**
```
POST /api/auth/verify-phone
```

**Données requises:**
- customerId
- code (6 chiffres reçus par SMS)

**Action:**
1. Vérifie le code SMS
2. Vérifie qu'il n'est pas expiré (15 min)
3. Marque le téléphone comme vérifié
4. Si email ET téléphone vérifiés → Envoie email pour créer mot de passe

**Réponse:**
```json
{
  "success": true,
  "message": "Téléphone vérifié avec succès !",
  "data": {
    "customerId": "xxx",
    "phoneVerified": true,
    "emailVerified": true,
    "bothVerified": true,
    "nextStep": "Crée ton mot de passe pour activer ton compte",
    "setupUrl": "/setup-password?token=xxx"
  }
}
```

### **Étape 4: Création Mot de Passe**
```
POST /api/auth/setup-password
```

**Données requises:**
- token (reçu après vérifications)
- password (min 8 caractères, 1 maj, 1 min, 1 chiffre, 1 spécial)
- confirmPassword

**Action:**
1. Valide le token
2. Valide la force du mot de passe
3. Hash le mot de passe
4. Active le compte (`is_active: true`)
5. Change le statut (`status: 'ACTIVE'`)
6. Envoie email "Compte prêt !"
7. Notifie l'admin

**Réponse:**
```json
{
  "success": true,
  "message": "Compte activé avec succès ! Tu peux maintenant te connecter.",
  "data": {
    "customerId": "xxx",
    "email": "client@email.com",
    "accountActive": true,
    "loginUrl": "/login"
  }
}
```

## 🔐 Reset Mot de Passe Oublié

### **Demande de Reset**
```
POST /api/auth/forgot-password
```

**Données requises:**
- email

**Action:**
1. Génère token reset (1h)
2. Envoie email avec lien reset

### **Reset du Mot de Passe**
```
POST /api/auth/reset-password
```

**Données requises:**
- token
- password
- confirmPassword

**Action:**
1. Valide le token
2. Met à jour le mot de passe
3. Efface le token

## 📧 Templates Emails Disponibles

### **Clients**
1. `customer_welcome` - Bienvenue + vérification email
2. `customer_email_verification` - Confirmation vérification email
3. `customer_password_setup` - Création mot de passe
4. `customer_password_reset` - Reset mot de passe
5. `customer_account_ready` - Compte activé

### **Réservations**
6. `booking_confirmed` - Confirmation réservation
7. `booking_reminder_24h` - Rappel 24h avant
8. `booking_reminder_1h` - Rappel 1h avant
9. `booking_cancelled` - Annulation
10. `booking_modified` - Modification

### **Admin**
11. `admin_new_customer` - Nouveau client
12. `admin_new_booking` - Nouvelle réservation
13. `admin_booking_modified` - Réservation modifiée
14. `admin_booking_cancelled` - Réservation annulée

## 🔑 Configuration

### **Variables d'environnement** (`.env.local`)

```bash
# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxx
EMAIL_FROM="Geek Gaming Center <noreply@geekgamingcenter.cm>"
EMAIL_REPLY_TO="support@geekgamingcenter.cm"
ADMIN_EMAIL="admin@geekgamingcenter.cm"

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### **Coûts**

**Email (Resend):**
- Gratuit : 3 000 emails/mois
- Payant : $20/mois pour 50 000 emails

**SMS (Twilio):**
- ~0.05€ par SMS au Cameroun
- Facturation à l'utilisation

## 🧪 Testing

### **Script de Test**
```bash
bash scripts/test-onboarding-api.sh
```

### **Test Manuel avec Postman**

1. **Inscription**
   - POST `http://localhost:3000/api/auth/register`
   - Body: voir exemple ci-dessus

2. **Vérifier les tokens en base de données**
   ```sql
   SELECT id, email, phone, "passwordResetToken", "passwordResetExpires", "emailVerified"
   FROM customers
   WHERE email = 'erwan.test@example.com';
   ```

3. **Récupérer le token et tester les endpoints**

## 📝 À Faire

- [ ] Créer les pages UI (inscription, vérifications, etc.)
- [ ] Intégrer avec le formulaire d'inscription existant
- [ ] Ajouter les traductions en français
- [ ] Tests E2E complets
- [ ] Monitoring et analytics (Resend dashboard)
- [ ] Page de gestion des clients pour voir le statut de vérification

## 🎯 Prochaines Étapes

1. **Créer les pages UI** pour que les utilisateurs puissent utiliser le système
2. **Intégrer** le formulaire d'inscription existant avec les nouveaux endpoints
3. **Tester** le flux complet de bout en bout
4. **Déployer** en production avec les vraies clés API Resend et Twilio

---

**Créé avec inspiration de Karma Pilates** 🎮
