# 📧 Mapping des Templates Emails - Geek Gaming Center

## 📋 Vue d'ensemble

**Total des templates:** 14
**Templates actifs:** 14 (100%)

---

## 🔄 Paires Admin/Client Synchronisées

### 1. 📝 Inscription Client

#### Client: `customer_welcome`
- **Sujet:** 🎮 Bienvenue chez Geek Gaming Center !
- **Déclencheur:** Après création du compte par le caissier
- **Placeholders:**
  - `{customer_name}` - Nom complet du client
  - `{verification_link}` - Lien HTML pour vérifier l'email
  - `{verification_url}` - URL brute de vérification
- **Actions:** Demande de vérification d'email

#### Admin: `admin_new_customer`
- **Sujet:** 🆕 Nouveau client inscrit
- **Déclencheur:** Même moment que customer_welcome
- **Placeholders:**
  - `{customer_name}` - Nom complet du client
  - `{first_name}` - Prénom
  - `{last_name}` - Nom
  - `{email}` - Email du client
  - `{phone}` - Téléphone
  - `{how_did_you_find_us}` - Comment il nous a connus
  - `{created_at}` - Date/heure d'inscription
- **Informations:** Notification au staff d'un nouveau client

---

### 2. ✅ Vérification Email

#### Client: `customer_email_verification`
- **Sujet:** Confirme ton adresse email
- **Déclencheur:** Demande de renvoi de l'email de vérification
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{email}` - Email du client
  - `{verification_link}` - Lien HTML de confirmation
  - `{verification_url}` - URL brute de confirmation
- **Actions:** Confirmer l'email pour activer le compte

---

### 3. 🔐 Configuration Mot de Passe

#### Client: `customer_password_setup`
- **Sujet:** Crée ton mot de passe
- **Déclencheur:** Email vérifié, premier compte créé par caissier
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{email}` - Email du client
  - `{setup_link}` - Lien HTML pour créer le MDP
  - `{setup_url}` - URL brute pour créer le MDP
- **Actions:** Créer le mot de passe pour se connecter

---

### 4. 🔑 Réinitialisation Mot de Passe

#### Client: `customer_password_reset`
- **Sujet:** Réinitialisation de ton mot de passe
- **Déclencheur:** Demande de réinitialisation sur page login
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{email}` - Email du client
  - `{reset_link}` - Lien HTML de réinitialisation
  - `{reset_url}` - URL brute de réinitialisation
- **Actions:** Définir un nouveau mot de passe

---

### 5. 🎉 Compte Prêt

#### Client: `customer_account_ready`
- **Sujet:** 🎉 Ton compte est prêt ! Viens gamer !
- **Déclencheur:** Email vérifié + mot de passe configuré
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{website_title}` - Titre du site (Geek Gaming Center)
- **Actions:** Informer que le compte est 100% fonctionnel

---

## 📅 Paires de Réservations

### 6. 🆕 Nouvelle Réservation

#### Client: `booking_confirmed`
- **Sujet:** ✅ Ta session de gaming est confirmée !
- **Déclencheur:** Création d'une réservation
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{booking_date}` - Date de la session
  - `{booking_time}` - Heure de début
  - `{equipment_name}` - Équipement réservé
  - `{duration}` - Durée (ex: "60 min")
  - `{price}` - Prix (ex: "5000 XAF")
  - `{website_title}` - Titre du site

#### Admin: `admin_new_booking`
- **Sujet:** 🆕 Nouvelle réservation
- **Déclencheur:** Même moment que booking_confirmed
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{email}` - Email du client
  - `{booking_date}` - Date de réservation
  - `{booking_time}` - Heure de réservation
  - `{equipment_name}` - Équipement
  - `{duration}` - Durée
  - `{price}` - Prix
  - `{website_title}` - Titre du site

---

### 7. ✏️ Réservation Modifiée

#### Client: `booking_modified`
- **Sujet:** Ta session a été modifiée
- **Déclencheur:** Modification d'une réservation existante
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{booking_date}` - Nouvelle date
  - `{booking_time}` - Nouvelle heure
  - `{equipment_name}` - Nouvel équipement
  - `{duration}` - Nouvelle durée
  - `{price}` - Nouveau prix

#### Admin: `admin_booking_modified`
- **Sujet:** Réservation modifiée
- **Déclencheur:** Même moment que booking_modified
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{email}` - Email du client
  - `{booking_date}` - Date modifiée
  - `{booking_time}` - Heure modifiée
  - `{equipment_name}` - Équipement modifié
  - `{duration}` - Durée modifiée
  - `{price}` - Prix modifié

---

### 8. ❌ Réservation Annulée

#### Client: `booking_cancelled`
- **Sujet:** Annulation de ta session
- **Déclencheur:** Annulation de réservation
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{booking_date}` - Date de la session annulée
  - `{booking_time}` - Heure de la session annulée
  - `{equipment_name}` - Équipement réservé
- **Actions:** Informer du remboursement si applicable

#### Admin: `admin_booking_cancelled`
- **Sujet:** Réservation annulée
- **Déclencheur:** Même moment que booking_cancelled
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{email}` - Email du client
  - `{booking_date}` - Date annulée
  - `{booking_time}` - Heure annulée
  - `{equipment_name}` - Équipement libéré
  - `{reason}` - Raison de l'annulation (optionnel)

---

## ⏰ Rappels de Réservation

### 9. 🔔 Rappel 24h

#### Client: `booking_reminder_24h`
- **Sujet:** 🔔 Rappel : Ta session est demain !
- **Déclencheur:** 24h avant la réservation (via cron job)
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{booking_date}` - Date de la session
  - `{booking_time}` - Heure de début
  - `{equipment_name}` - Équipement réservé
  - `{duration}` - Durée
- **Actions:** Rappeler la session du lendemain

---

### 10. ⏰ Rappel 1h

#### Client: `booking_reminder_1h`
- **Sujet:** ⏰ Ta session commence dans 1h !
- **Déclencheur:** 1h avant la réservation (via cron job)
- **Placeholders:**
  - `{customer_name}` - Nom du client
  - `{booking_date}` - Date (aujourd'hui)
  - `{booking_time}` - Heure de début
  - `{equipment_name}` - Équipement réservé
  - `{duration}` - Durée
- **Actions:** Rappeler que la session commence bientôt

---

## ✅ Cohérence des Placeholders

### Placeholders Standards Utilisés

#### Informations Client
- `{customer_name}` - Nom complet (utilisé partout)
- `{first_name}` - Prénom (admin new customer)
- `{last_name}` - Nom (admin new customer)
- `{email}` - Email (tous les admins)
- `{phone}` - Téléphone (admin new customer)
- `{how_did_you_find_us}` - Source (admin new customer)
- `{created_at}` - Date/heure (admin new customer)

#### Informations Réservation
- `{booking_date}` - Date de la session (tous les bookings)
- `{booking_time}` - Heure de début (tous les bookings)
- `{equipment_name}` - Équipement (tous les bookings)
- `{duration}` - Durée (tous les bookings)
- `{price}` - Prix (tous les bookings)

#### Liens / Actions
- `{verification_link}` - Lien HTML (email verification)
- `{verification_url}` - URL brute (email verification)
- `{setup_link}` - Lien HTML (password setup)
- `{setup_url}` - URL brute (password setup)
- `{reset_link}` - Lien HTML (password reset)
- `{reset_url}` - URL brute (password reset)

#### Informations Site
- `{website_title}` - "Geek Gaming Center"
- `{admin_panel_url}` - URL du dashboard admin

---

## 🔄 Workflow d'Onboarding Complet

### Étape 1: Inscription (Création par Caissier)
1. **Client reçoit:** `customer_welcome` → Demande de vérifier email
2. **Admin reçoit:** `admin_new_customer` → Notification du nouveau client

### Étape 2: Vérification Email
3. **Client reçoit:** `customer_email_verification` → Si demande de renvoi

### Étape 3: Configuration Mot de Passe
4. **Client reçoit:** `customer_password_setup` → Email vérifié, compte créé par staff

### Étape 4: Compte Activé
5. **Client reçoit:** `customer_account_ready` → Mot de passe configuré, compte prêt

### Étape 5: Réinitialisation (Optionnel)
6. **Client reçoit:** `customer_password_reset` → Si oubli de mot de passe

---

## 📅 Workflow de Réservation Complet

### Création
1. **Client reçoit:** `booking_confirmed` → Confirmation avec détails
2. **Admin reçoit:** `admin_new_booking` → Notification de nouvelle réservation

### Modification
3. **Client reçoit:** `booking_modified` → Nouveaux détails
4. **Admin reçoit:** `admin_booking_modified` → Notification de modification

### Annulation
5. **Client reçoit:** `booking_cancelled` -> Confirmation + info remboursement
6. **Admin reçoit:** `admin_booking_cancelled` → Notification d'annulation

### Rappels Automatiques
7. **Client reçoit:** `booking_reminder_24h` → 24h avant (cron)
8. **Client reçoit:** `booking_reminder_1h` → 1h avant (cron)

---

## ✅ Points de Cohérence Vérifiés

1. **Tous les placeholders admin ont `email`** → Le staff peut contacter le client
2. **Tous les emails client ont `customer_name`** → Personnalisation
3. **Les paires admin/client utilisent les mêmes placeholders** → Synchronisation parfaite
4. **Les workflows sont logiques et séquentiels** → Pas d'étapes manquantes
5. **Les sujets sont clairs et distincts** → Pas de confusion
6. **Tous les templates sont actifs** → 100% fonctionnel

---

## 🚀 Prochaines Améliorations Possibles

- [ ] Templates pour les factures (paiements reçus)
- [ ] Templates pour les promotions/offres spéciales
- [ ] Templates pour les anniversaires clients
- [ ] Templates pour les campagnes marketing
- [ ] Système de préférences de notifications (choisir les emails reçus)
