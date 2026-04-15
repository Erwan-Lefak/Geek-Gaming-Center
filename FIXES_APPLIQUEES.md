# 🔧 Corrections Appliquées - Geek Gaming Center

## ✅ Corrections Effectuées

### 1. **Page 404 Corrigée** ✅

**Problème:**
- URL `/dashboard/customers/cmnz98jm20000hq06k44dtgtk` retournait une erreur 404
- Le bouton "Voir" (œil) dans la liste des clients pointait vers une page inexistante

**Solution:**
- ✅ Créé `/src/app/dashboard/customers/[id]/page.tsx` - Page de détail client
- ✅ Créé `/src/app/api/customers/[id]/route.ts` - API endpoint pour récupérer un client
- ✅ Page avec informations complètes: contact, statistiques, visites, etc.

**Fonctionnalités de la page:**
- Informations personnelles (email, téléphone, adresse)
- Statistiques (total dépensé, visites, heures)
- Dernière visite
- Comment nous a-t-il connu
- Notes
- Bouton modifier

---

### 2. **Problème Emails Non Envoyés** ⚠️

**Diagnostic:**
Le problème est dans `/src/app/api/customers/route.ts` ligne 187:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const setupUrl = `${baseUrl}/setup-password?token=${setupToken}`
```

**Problème:**
- `NEXT_PUBLIC_APP_URL` n'est pas à jour sur Vercel
- Il pointe encore vers `https://geek-gaming-center-...vercel.app`
- Les emails utilisent donc la mauvaise URL

**Solution Requise:**
Il faut mettre à jour **NEXT_PUBLIC_APP_URL** sur Vercel avec la valeur:
```
https://geek-gaming-center.cam
```

---

## 📋 Instructions de Correction

### Étape 1: Mettre à jour la variable sur Vercel

1. Allez sur: https://vercel.com/erwans-projects-3b98bc98/geek-gaming-center/settings/environment-variables

2. Trouvez la variable `NEXT_PUBLIC_APP_URL`

3. Cliquez sur "Edit" et remplacez par:
   ```
   https://geek-gaming-center.cam
   ```

4. Cliquez sur "Save"

5. Faites la même chose pour `NEXTAUTH_URL`:
   ```
   https://geek-gaming-center.cam
   ```

### Étape 2: Redéployer

1. Allez sur l'onglet "Deployments"
2. Cliquez sur "..." à côté du dernier déploiement
3. Cliquez sur "Redeploy"
4. Attendez 2-3 minutes

### Étape 3: Tester

1. Créez un nouveau client via le dashboard
2. Vérifiez que l'email contient:
   ```
   https://geek-gaming-center.cam/setup-password?token=...
   ```
   et NON:
   ```
   http://localhost:3000/setup-password?token=...
   ```

---

## 🔍 Vérification des URLs dans les Templates

Voici tous les endroits où `NEXT_PUBLIC_APP_URL` est utilisée:

### 1. API Routes (côté serveur)

```typescript
// src/app/api/auth/verify-email/route.ts
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const verificationUrl = `${baseUrl}/verify-email?token=${emailVerificationToken}`

// src/app/api/auth/forgot-password/route.ts
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const resetUrl = `${baseUrl}/setup-password?token=${resetToken}`

// src/app/api/auth/register/route.ts
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const emailVerificationUrl = `${baseUrl}/verify-email?token=${emailVerificationToken}`

// src/app/api/auth/verify-phone/route.ts
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const setupUrl = `${baseUrl}/setup-password?token=${token}`

// src/app/api/customers/route.ts
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const setupUrl = `${baseUrl}/setup-password?token=${setupToken}`
```

### 2. Emails Envoyés

**Lors de la création d'un client par un caissier:**
- Email: setup password
- Lien: `{NEXT_PUBLIC_APP_URL}/setup-password?token=...`

**Lors de l'inscription self-service:**
- Email: vérification email
- Lien: `{NEXT_PUBLIC_APP_URL}/verify-email?token=...`

**Mot de passe oublié:**
- Email: reset password
- Lien: `{NEXT_PUBLIC_APP_URL}/setup-password?token=...`

---

## ✅ Checklist de Correction

- [x] Page 404 corrigée avec page de détail client
- [x] API endpoint créé pour récupérer un client
- [ ] Mettre à jour NEXT_PUBLIC_APP_URL sur Vercel
- [ ] Mettre à jour NEXTAUTH_URL sur Vercel
- [ ] Redéployer sur Vercel
- [ ] Tester la création d'un client
- [ ] Vérifier les liens dans les emails
- [ ] Tester le workflow complet d'onboarding

---

## 📊 Résumé

### Corrections Apportées
1. ✅ Page de détail client créée (/dashboard/customers/[id])
2. ✅ API endpoint créé (GET /api/customers/[id])
3. ✅ Design responsive et complet

### Action Requise de Votre Part
1. ⚠️ **Mettre à jour 2 variables sur Vercel** (5 minutes)
   - NEXT_PUBLIC_APP_URL → https://geek-gaming-center.cam
   - NEXTAUTH_URL → https://geek-gaming-center.cam

2. ⚠️ **Redéployer** (2 minutes)

3. ⚠️ **Tester** (10 minutes)

Après cela, tous les emails contiendront les bons liens avec le vrai domaine !

---

**Document créé:** 15 avril 2026
**Statut:** Page 404 corrigée, emails requièrent mise à jour Vercel
