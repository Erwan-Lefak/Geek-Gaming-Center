# Configuration Instagram Basic Display API

## Étape 1: Créer une app Facebook Developer

1. Allez sur https://developers.facebook.com/
2. Cliquez sur "Create App" → "Consumer" (pas Business)
3. Nommez l'app "Geek Gaming Center Website"
4. Créez et récupérez l'App ID et App Secret

## Étape 2: Configurer Instagram Basic Display

1. Dans le dashboard Facebook, allez à "Add Product" → "Instagram Basic Display"
2. Cliquez sur "Set Up"
3. Scrollez à "User Token Generator"
4. Cliquez sur "Link Instagram Account"
5. Connectez le compte @ggc_cameroun
6. Autorisez l'accès

## Étape 3: Récupérer les informations

Une fois connecté, vous verrez :
- **Instagram User ID** : Notez-le (ex: 17841401234567890)
- **Access Token** : Cliquez sur "Generate Token" et copiez-le

## Étape 4: Ajouter les variables d'environnement

Ajoutez dans `.env.local` et dans Vercel :

```bash
INSTAGRAM_USER_ID=votre_user_id_ici
INSTAGRAM_ACCESS_TOKEN=votre_access_token_ici
```

## Exemple de valeurs

```
INSTAGRAM_USER_ID=17841401234567890
INSTAGRAM_ACCESS_TOKEN=IGQWRNQXYZ123...
```

## Important

- Le token expire après 60 jours
- Vous pouvez le rafraîchir depuis le dashboard Facebook
- L'API est gratuite (jusqu'à 200 requêtes/heure)
- N'affiche que les médias publics
- Maximum 6 posts affichés (configurable dans `/api/instagram/route.ts`)

## Tester

Une fois configuré, l'API fonctionnera automatiquement :
- Local: http://localhost:3000/api/instagram
- Production: Vérifiez les variables Vercel Environment Variables
