# 🚀 CI/CD Setup - GitHub Actions & Vercel

## 📋 Configuration Déploiement Automatique

Ce guide configure le déploiement automatique sur Vercel à chaque push sur la branche `main`.

---

## Étape 1 : Lier le repo GitHub à Vercel

### Option A : Via Vercel CLI (Déjà fait !)

```bash
vercel link
```

Cela a créé un fichier `.vercel/project.json` qui lie ton projet.

### Option B : Via Dashboard Vercel

1. Va sur https://vercel.com/new
2. Importe ton repo GitHub
3. Configure les variables d'environnement
4. Déploie

---

## Étape 2 : Créer un Token Vercel

### 1. Générer le token

Va sur : https://vercel.com/account/tokens

Clique sur **"Create Token"** :
- **Token Name** : `GitHub Actions Deploy` (ou autre)
- **Scope** : Sélectionne ton compte
- **Expiration** : 90 jours ou plus

Copie le token généré (commence par `npc_...`)

### 2. Ajouter le token aux secrets GitHub

1. Va sur ton repo GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique sur **"New repository secret"**
4. Ajoute :

   **Nom** : `VERCEL_TOKEN`
   **Valeur** : `npc_...` (le token copié)

---

## Étape 3 : Ajouter les autres secrets GitHub

Dans le même endroit (GitHub → Settings → Secrets), ajoute :

### Secret : `DATABASE_URL`

**Depuis Vercel :**
1. Va sur ton projet Vercel
2. **Settings** → **Environment Variables**
3. Copie la valeur de `DATABASE_URL`

**Ajoute-le à GitHub :**
- **Nom** : `DATABASE_URL`
- **Valeur** : `postgres://...` (la valeur copiée)

---

## Étape 4 : Vérifier le workflow

Le fichier `.github/workflows/deploy.yml` est déjà créé.

Il fait :
1. ✅ Checkout du code
2. ✅ Installation des dépendances
3. ✅ Build du projet
4. ✅ Déploiement sur Vercel (production)
5. ✅ Commentaire automatique sur le commit avec l'URL de déploiement

---

## Étape 5 : Tester le CI/CD

### 1. Faire un changement

```bash
# Modifier un fichier
echo "test CI/CD" >> README.md

# Commiter et pusher
git add README.md
git commit -m "test: Deploy automatically on push"
git push origin main
```

### 2. Vérifier le déploiement

1. Va sur GitHub : **Actions** tab
2. Tu verras le workflow "Deploy to Vercel" en cours
3. Une fois terminé, vérifie le commentaire sur le commit

### 3. Vérifier le site

- Le site devrait être mis à jour sur : https://geek-gaming-center.vercel.app
- Tu peux aussi voir les déploiements sur : https://vercel.com/dashboard

---

## 🔧 Dépannage

### Erreur : "vercel: command not found"

Le workflow installe Vercel CLI automatiquement, donc ça ne devrait pas arriver.

### Erreur : "Invalid token"

Vérifie que :
- Le token commence par `npc_`
- Le token n'a pas expiré
- Le token est bien ajouté dans GitHub Secrets

### Erreur : "Build failed"

Vérifie les logs dans GitHub Actions. Souvent c'est :
- Variable d'environnement manquante
- Erreur de build (npm run build)
- Problème avec la base de données

### Pas de déploiement automatique ?

Vérifie :
1. Le fichier `.github/workflows/deploy.yml` existe
2. Tu pousses bien sur `main` (pas une autre branche)
3. Les Actions sont activées sur GitHub (Settings → Actions → General)

---

## 📊 Monitoring

### Voir les déploiements passés

- **GitHub** : Actions tab → Historique des workflows
- **Vercel** : Dashboard → Deployments

### Notifications

Tu peux configurer les notifications :
- **GitHub** : Settings → Notifications
- **Vercel** : Settings → Notifications

---

## 🎯 Bonnes pratiques

1. **Toujours tester en local** avant de pusher
2. **Utiliser des branches** pour le développement :
   ```bash
   git checkout -b feature/nouvelle-fonction
   git push origin feature/nouvelle-fonction
   # Puis pull request sur GitHub
   ```
3. **Revue de code** avant de merger sur `main`
4. **Vérifier les logs** si le build échoue

---

## 🔄 Workflow Alternatif (Preview Deployments)

Pour déployer automatiquement sur chaque PR (pas seulement main), ajoute un deuxième workflow `.github/workflows/preview.yml` :

```yaml
name: Deploy Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build
      - run: npm install --global vercel@latest
      - run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
```

Cela crée des URLs de preview pour chaque PR !

---

## ✅ Checklist

- [ ] Repo GitHub lié à Vercel
- [ ] Token Vercel créé et ajouté à GitHub Secrets
- [ ] DATABASE_URL ajouté à GitHub Secrets
- [ ] Workflow `.github/workflows/deploy.yml` créé
- [ ] Test avec un push sur main
- [ ] Vérification du déploiement sur Vercel

---

## 🎉 Résultat

Maintenant, à chaque `git push origin main` :
1. GitHub Actions lance automatiquement
2. Le projet est buildé
3. Déployé sur Vercel en production
4. URL postée en commentaire sur le commit

Plus besoin de déployer manuellement ! 🚀
