# ⚙️ Configuration Vercel - Variables d'Environnement

## 📋 Variables à Mettre à Jour

Allez sur: **https://vercel.com/erwans-projects-3b98bc98/geek-gaming-center/settings/environment-variables**

---

## 🔧 Variables Critiques à Mettre à Jour

### 1. NEXT_PUBLIC_APP_URL
```
Ancienne valeur: https://geek-gaming-center-...vercel.app
Nouvelle valeur: https://geek-gaming-center.cam
```

**Pourquoi ?** Cette variable est utilisée pour générer les liens de vérification d'email et les URLs de callback.

**Utilisée dans:**
- `/api/auth/verify-email` - Lien de vérification email
- `/api/auth/forgot-password` - Lien de reset MDP
- `/api/auth/register` - Lien de vérification
- `/api/auth/verify-phone` - Lien de vérification téléphone
- `/api/customers` - Lien setup mot de passe
- `/api/checkout` - URLs de retour

### 2. NEXTAUTH_URL
```
Ancienne valeur: https://geek-gaming-center-...vercel.app
Nouvelle valeur: https://geek-gaming-center.cam
```

**Pourquoi ?** NextAuth utilise cette URL pour les callbacks OAuth et la gestion des sessions.

---

## ✅ Variables Déjà Configurées (Ne pas modifier)

### Email Service
```
RESEND_API_KEY = re_VwUFohDm_FdEbNbs26DN55pL9ehrsC2Hz
EMAIL_FROM = Geek Gaming Center <support@geek-gaming-center.cam>
EMAIL_REPLY_TO = support@geek-gaming-center.cam
ADMIN_EMAIL = admin.ggccameroun@gmail.com
```

### Authentication
```
NEXTAUTH_SECRET = cQ7zH9K2mN4pR8sT5vW6xY1bD3eF0gH9jK6mN4pR2sT5vW8xY0bD3eF0gH9jK6mN4pR
```

### Public Info
```
NEXT_PUBLIC_APP_NAME = Geek Gaming Center
```

### Database
```
DATABASE_URL = (déjà configuré avec Vercel Postgres)
POSTGRES_URL = (déjà configuré)
PRISMA_DATABASE_URL = (déjà configuré)
```

### Stripe (Test Mode)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_SECRET_KEY = sk_test_...
STRIPE_WEBHOOK_SECRET = (vide pour le moment)
```

---

## 🚫 Variables Non Nécessaires

### NEXT_PUBLIC_API_URL
**Status:** ❌ NON NÉCESSAIRE

**Pourquoi ?** Next.js construit automatiquement les URLs API en utilisant `NEXT_PUBLIC_APP_URL` ou le hostname actuel.

Les appels API dans le code utilisent:
```typescript
// Au lieu de:
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`)

// On utilise directement:
fetch(`/api/customers`) // Next.js résout automatiquement
```

---

## 📝 Instructions de Mise à Jour

### Étape 1: Accéder au Dashboard
1. Allez sur: https://vercel.com/erwans-projects-3b98bc98/geek-gaming-center/settings/environment-variables

### Étape 2: Modifier NEXT_PUBLIC_APP_URL
1. Trouvez la variable `NEXT_PUBLIC_APP_URL`
2. Cliquez sur "Edit"
3. Remplacez la valeur par: `https://geek-gaming-center.cam`
4. Cliquez sur "Save"

### Étape 3: Modifier NEXTAUTH_URL
1. Trouvez la variable `NEXTAUTH_URL`
2. Cliquez sur "Edit"
3. Remplacez la valeur par: `https://geek-gaming-center.cam`
4. Cliquez sur "Save"

### Étape 4: Redéployer
1. Cliquez sur l'onglet "Deployments"
2. Cliquez sur les "..." à côté du dernier déploiement
3. Sélectionnez "Redeploy"
4. Attendez que le déploiement soit terminé (environ 2-3 minutes)

### Étape 5: Vérifier
1. Allez sur https://geek-gaming-center.cam
2. Créez un compte de test
3. Vérifiez que l'email de bienvenue contient le bon lien:
   ```
   https://geek-gaming-center.cam/verify-email?token=...
   ```

---

## ✅ Checklist

- [ ] Mettre à jour NEXT_PUBLIC_APP_URL
- [ ] Mettre à jour NEXTAUTH_URL
- [ ] Redéployer sur Vercel
- [ ] Tester l'inscription
- [ ] Vérifier les liens dans les emails
- [ ] Tester la connexion

---

## 🔍 Vérification

Après la mise à jour, vérifiez que les emails contiennent les bons liens:

**Email de bienvenue:**
```
✅ Bon: https://geek-gaming-center.cam/verify-email?token=...
❌ Mauvais: https://geek-gaming-center-...vercel.app/verify-email?token=...
```

**Email de reset MDP:**
```
✅ Bon: https://geek-gaming-center.cam/setup-password?token=...
❌ Mauvais: https://geek-gaming-center-...vercel.app/setup-password?token=...
```

---

**Document créé:** 15 avril 2026
**Version:** 1.0
**Action requise:** Mettre à jour 2 variables (NEXT_PUBLIC_APP_URL et NEXTAUTH_URL)
