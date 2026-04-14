# Guide de Test Complet - Geek Gaming Center

## Informations de Test

**Utilisateur de Test**: Erwan Lefak
**Email**: erwan@lefak.com (ou similaire)
**Rôle**: ADMIN (accès complet)

## 1. Test d'Authentification

### 1.1 Connexion
- [ ] Se rendre sur `/login`
- [ ] Entrer l'email de test
- [ ] Entrer le mot de passe
- [ ] Vérifier que la connexion redirige vers `/dashboard`
- [ ] Vérifier que le nom d'utilisateur est affiché dans la sidebar
- [ ] Vérifier que le rôle est correct (ADMIN)

### 1.2 Déconnexion
- [ ] Cliquer sur le bouton "Déconnexion" dans la sidebar
- [ ] Vérifier la redirection vers `/login`
- [ ] Essayer d'accéder à `/dashboard` sans être connecté (doit rediriger vers `/login`）

### 1.3 Dark Mode
- [ ] Tester le basculement mode clair/mode sombre
- [ ] Vérifier que toutes les pages s'adaptent correctement
- [ ] Vérifier que le texte reste lisible dans les deux modes

## 2. Tableau de Bord (`/dashboard`)

### 2.1 Affichage Principal
- [ ] Vérifier l'affichage des statistiques (CA Aujourd'hui, Sessions Actives, Clients ce Mois, Alertes Stock)
- [ ] Vérifier que les valeurs sont à 0 ou cohérentes
- [ ] Tester les cartes de statistiques (hover effects)
- [ ] Vérifier la bannière de bienvenue avec le nom de l'utilisateur

### 2.2 Actions Rapides
- [ ] Vérifier que toutes les actions rapides sont affichées
- [ ] Cliquer sur chaque action rapide et vérifier la redirection
  - [ ] Nouveau Client → `/dashboard/customers`
  - [ ] Nouvelle Session → `/dashboard/sessions`
  - [ ] Factures → `/dashboard/invoices`
  - [ ] Équipements → `/dashboard/equipment`
  - [ ] Rapports → `/dashboard/reports`
  - [ ] Produits → `/dashboard/products`

## 3. Gestion des Clients (`/dashboard/customers`)

### 3.1 Création de Client
- [ ] Cliquer sur "Nouveau Client"
- [ ] Remplir le formulaire avec des données test:
  - Nom: "Jean Dupont"
  - Email: "jean.dupont@test.com"
  - Téléphone: "+237 6XX XXX XXX"
  - Date de naissance: une date valide
- [ ] Sauvegarder
- [ ] Vérifier que le client apparaît dans la liste

### 3.2 Recherche de Client
- [ ] Utiliser la barre de recherche pour trouver "Jean Dupont"
- [ ] Vérifier que les résultats s'affichent correctement
- [ ] Tester la recherche par email

### 3.3 Modification de Client
- [ ] Cliquer sur un client dans la liste
- [ ] Modifier ses informations
- [ ] Sauvegarder
- [ ] Vérifier que les modifications sont prises en compte

### 3.4 Suppression de Client
- [ ] Supprimer un client de test
- [ ] Confirmer la suppression
- [ ] Vérifier que le client n'apparaît plus dans la liste

### 3.5 Pagination
- [ ] S'il y a plus de 10 clients, tester la pagination
- [ ] Vérifier que les boutons Précédent/Suivant fonctionnent

## 4. Gestion des Sessions (`/dashboard/sessions`)

### 4.1 Création de Session - Client Walk-in
- [ ] Cliquer sur "Client de Passage"
- [ ] Sélectionner une station (ex: PS5 Station 1)
- [ ] Entrer la durée (ex: 2 heures)
- [ ] Sélectionner ou créer un client
- [ ] Démarrer la session
- [ ] Vérifier que la session apparaît dans la liste avec le statut "En cours"

### 4.2 Création de Session - Client Existant
- [ ] Cliquer sur "Nouvelle Session"
- [ ] Sélectionner un client existant
- [ ] Sélectionner une station
- [ ] Définir la durée
- [ ] Démarrer la session
- [ ] Vérifier l'affichage du timer en temps réel

### 4.3 Gestion des Sessions en Cours
- [ ] Vérifier que les sessions en cours affichent le temps restant
- [ ] Vérifier que le timer se met à jour toutes les secondes
- [ ] Tester le bouton "Pause" sur une session
- [ ] Reprendre la session
- [ ] Vérifier que le temps est correctement calculé

### 4.4 Terminer une Session
- [ ] Cliquer sur "Terminer" pour une session en cours
- [ ] Vérifier que le montant total est calculé correctement
- [ ] Vérifier la création automatique d'une facture
- [ ] Vérifier que la session passe au statut "Terminée"

### 4.5 Filtrage des Sessions
- [ ] Tester le filtre "Actives uniquement"
- [ ] Vérifier que seules les sessions en cours sont affichées
- [ ] Désactiver le filtre et vérifier que toutes les sessions apparaissent

### 4.6 Historique des Sessions
- [ ] Vérifier l'affichage des sessions terminées
- [ ] Cliquer sur une session terminée pour voir les détails
- [ ] Vérifier que les informations sont complètes (durée réelle, montant, etc.)

## 5. Caisse et Réservations (`/dashboard/caisse`)

### 5.1 Réservation Future
- [ ] Cliquer sur "Nouvelle Réservation"
- [ ] Sélectionner une date future
- [ ] Sélectionner une station et un créneau horaire
- [ ] Sélectionner ou créer un client
- [ ] Définir la durée
- [ ] Créer la réservation
- [ ] Vérifier que la réservation apparaît dans le tableau

### 5.2 Consultation des Réservations
- [ ] Changer de date avec le sélecteur de date
- [ ] Vérifier que les réservations du jour s'affichent
- [ ] Vérifier les créneaux horaires occupés vs libres
- [ ] Tester la navigation entre les jours

### 5.3 Filtrage par Statut
- [ ] Filtrer par "Confirmée"
- [ ] Filtrer par "En attente"
- [ ] Filtrer par "Annulée"
- [ ] Filtrer par "Complétée"
- [ ] Vérifier que le filtre fonctionne correctement

### 5.4 Annulation de Réservation
- [ ] Sélectionner une réservation
- [ ] Cliquer sur "Annuler"
- [ ] Confirmer l'annulation
- [ ] Vérifier que le statut passe à "Annulée"

### 5.5 Conversion en Session
- [ ] Pour une réservation du jour, cliquer sur "Démarrer"
- [ ] Vérifier la création d'une session active
- [ ] Vérifier que la réservation passe en "Complétée"

## 6. Gestion des Factures (`/dashboard/invoices`)

### 6.1 Création de Facture Manuelle
- [ ] Cliquer sur "Nouvelle Facture"
- [ ] Sélectionner un client
- [ ] Ajouter des articles:
  - Session de gaming (durée, station)
  - Produits du store (quantité)
  - Services divers
- [ ] Vérifier le calcul automatique du total
- [ ] Appliquer une réduction si applicable
- [ ] Sauvegarder la facture
- [ ] Vérifier son statut ("Payée" ou "Impayée")

### 6.2 Liste des Factures
- [ ] Vérifier l'affichage de toutes les factures
- [ ] Vérifier les informations clés (numéro, client, montant, statut)
- [ ] Tester la pagination

### 6.3 Recherche et Filtrage
- [ ] Rechercher une facture par numéro
- [ ] Filtrer par client
- [ ] Filtrer par statut (Payée/Impayée)
- [ ] Filtrer par date

### 6.4 Détails de Facture
- [ ] Cliquer sur une facture
- [ ] Vérifier l'affichage détaillé:
  - Informations client
  - Liste des articles
  - Sous-total, taxes, total
  - Statut de paiement

### 6.5 Impression de Facture
- [ ] Cliquer sur "Imprimer" pour une facture
- [ ] Vérifier que le PDF généré est correct
- [ ] Vérifier toutes les informations sont présentes

### 6.6 Marquer comme Payée
- [ ] Pour une facture impayée, cliquer sur "Marquer payée"
- [ ] Vérifier le changement de statut
- [ ] Vérifier l'historique du paiement

## 7. Gestion des Produits (`/dashboard/products`)

### 7.1 Création de Produit
- [ ] Cliquer sur "Nouveau Produit"
- [ ] Remplir le formulaire:
  - Nom: "Manette PS5"
  - Description: "Manette sans fil officielle"
  - Prix: 45000 FCFA
  - Catégorie: Accessoires
  - Stock: 10 unités
  - Image: uploader ou laisser vide
  - Cocher "Produit vedette" si applicable
- [ ] Sauvegarder
- [ ] Vérifier l'apparition dans la liste

### 7.2 Liste des Produits
- [ ] Vérifier l'affichage en grille
- [ ] Vérifier les informations (nom, prix, stock, catégorie)
- [ ] Tester les indicateurs de stock:
  - Vert si > 10 unités
  - Orange si 5-10 unités
  - Rouge si < 5 unités

### 7.3 Modification de Produit
- [ ] Cliquer sur un produit
- [ ] Modifier le prix
- [ ] Modifier le stock
- [ ] Sauvegarder
- [ ] Vérifier les mises à jour

### 7.4 Gestion du Stock
- [ ] Cliquer sur "Gérer le stock" pour un produit
- [ ] Ajouter du stock (+5)
- [ ] Retirer du stock (-3)
- [ ] Vérifier la mise à jour en temps réel

### 7.5 Suppression de Produit
- [ ] Supprimer un produit de test
- [ ] Confirmer
- [ ] Vérifier qu'il n'apparaît plus

### 7.6 Produits Vedettes
- [ ] Cocher "Produit vedette" sur quelques produits
- [ ] Aller sur `/store`
- [ ] Vérifier qu'ils apparaissent dans la section "Produits Vedettes"

## 8. Gestion des Équipements (`/dashboard/equipment`)

### 8.1 Liste des Équipements
- [ ] Vérifier l'affichage de toutes les stations
- [ ] Vérifier le statut de chaque station:
  - Disponible (vert)
  - Occupée (rouge)
  - En maintenance (orange)

### 8.2 Ajout d'Équipement
- [ ] Cliquer sur "Nouvel Équipement"
- [ ] Remplir:
  - Nom: "PS5 Station 6"
  - Type: Console
  - Emplacement: "Salle principale"
  - Numéro de série: "PS5-006"
- [ ] Sauvegarder
- [ ] Vérifier l'apparition dans la liste

### 8.3 Modification d'Équipement
- [ ] Modifier les informations d'un équipement
- [ ] Changer le statut
- [ ] Sauvegarder

### 8.4 Maintenance
- [ ] Passer un équipement en "En maintenance"
- [ ] Vérifier qu'il ne peut plus être sélectionné pour une session
- [ ] Créer un ticket de maintenance
- [ ] Résoudre la maintenance
- [ ] Remettre l'équipement "Disponible"

## 9. Gestion des Événements (`/dashboard/events`)

### 9.1 Création d'Événement
- [ ] Cliquer sur "Nouvel Événement"
- [ ] Remplir:
  - Titre: "Tournoi FIFA"
  - Description: "Tournoi de FIFA 2026"
  - Date: Une date future
  - Heure de début: 14:00
  - Heure de fin: 18:00
  - Capacité maximale: 20 participants
  - Prix d'entrée: 5000 FCFA
  - Image: uploader ou laisser vide
- [ ] Sauvegarder
- [ ] Vérifier l'apparition dans la liste

### 9.2 Inscription à un Événement
- [ ] Cliquer sur un événement
- [ ] Cliquer sur "Inscrire un participant"
- [ ] Sélectionner ou créer un client
- [ ] Confirmer l'inscription
- [ ] Vérifier que le nombre de places occupées augmente

### 9.3 Gestion des Participants
- [ ] Vérifier la liste des participants
- [ ] Annuler une inscription
- [ ] Vérifier que la place est libérée

### 9.4 Alertes de Capacité
- [ ] Inscrire des participants jusqu'à 90% de la capacité
- [ ] Vérifier l'apparition d'une alerte "Presque complet"
- [ ] Remplir complètement l'événement
- [ ] Vérifier l'alerte "COMPLET"

### 9.5 Annulation d'Événement
- [ ] Annuler un événement de test
- [ ] Vérifier que les inscrits sont notifiés
- [ ] Vérifier le remboursement automatique si applicable

## 10. Maintenance (`/dashboard/maintenance`)

### 10.1 Création de Ticket
- [ ] Cliquer sur "Nouveau Ticket"
- [ ] Sélectionner un équipement
- - Décrire le problème: "Manette défectueuse"
- [ ] Définir la priorité: "Haute"
- [ ] Sauvegarder
- [ ] Vérifier l'apparition dans la liste

### 10.2 Liste des Tickets
- [ ] Vérifier l'affichage par priorité
- [ ] Vérifier le statut:
  - Ouvert (rouge)
  - En cours (orange)
  - Résolu (vert)

### 10.3 Résolution de Ticket
- [ ] Cliquer sur un ticket
- [ ] Ajouter un commentaire de résolution
- [ ] Changer le statut en "Résolu"
- [ ] Sauvegarder
- [ ] Vérifier le changement de statut

### 10.4 Historique
- [ ] Vérifier l'historique des maintenances passées
- [ ] Vérifier que les équipements concernés sont listés

## 11. Rapports (`/dashboard/reports`)

### 11.1 Rapport Quotidien
- [ ] Sélectionner la date du jour
- [ ] Générer le rapport
- [ ] Vérifier:
  - CA total
  - Nombre de sessions
  - Produits vendus
  - Nouveaux clients

### 11.2 Rapport Hebdomadaire
- [ ] Sélectionner une semaine
- [ ] Générer le rapport
- [ ] Vérifier les statistiques hebdomadaires
- [ ] Comparer avec la semaine précédente

### 11.3 Rapport Mensuel
- [ ] Sélectionner un mois
- [ ] Générer le rapport
- [ ] Vérifier:
  - CA du mois
  - Tendance (croissance/décroissance)
  - Top 5 des produits
  - Top 5 des clients

### 11.4 Export des Rapports
- [ ] Exporter un rapport en CSV
- [ ] Exporter un rapport en PDF
- [ ] Vérifier que les fichiers sont corrects

## 12. Store Public

### 12.1 Page Store (`/store`)
- [ ] Vérifier l'affichage des produits vedettes
- [ ] Vérifier le carrousel horizontal
- [ ] Scroller horizontalement sur mobile
- [ ] Vérifier la taille des images sur mobile
- [ ] Cliquer sur une catégorie de filtre
- [ ] Vérifier que seuls les produits de la catégorie s'affichent

### 12.2 Liste des Produits
- [ ] Vérifier l'affichage en grille
- [ ] Vérifier les informations (nom, prix, description)
- [ ] Vérifier l'indicateur de stock
- [ ] Tester la pagination

### 12.3 Fiche Produit
- [ ] Cliquer sur un produit
- [ ] Vérifier la page de détail:
  - Grande image
  - Description complète
  - Prix
  - Stock disponible
  - Bouton "Ajouter au panier"

### 12.4 Ajout au Panier
- [ ] Cliquer sur "Ajouter au panier"
- [ ] Vérifier que le compteur du panier augmente
- [ ] Vérifier le message de confirmation
- [ ] Ajouter plusieurs quantités du même produit

### 12.5 Panier (`/store/cart`)
- [ ] Aller à la page panier
- [ ] Vérifier l'affichage des articles
- [ ] Modifier la quantité d'un article
- [ ] Supprimer un article
- [ ] Vérifier le recalcul du total
- [ ] Tester le code promo si disponible

### 12.6 Checkout (`/store/checkout`)
- [ ] Cliquer sur "Procéder au paiement"
- [ ] Remplir les informations de livraison:
  - Nom complet
  - Adresse
  - Téléphone
  - Email
- [ ] Sélectionner le mode de paiement:
  - Mobile Money
  - Espèces
  - Carte bancaire
- [ ] Vérifier le récapitulatif de commande
- [ ] Confirmer la commande

### 12.7 Confirmation de Commande
- [ ] Vérifier la redirection vers `/store/checkout/success`
- [ ] Vérifier le numéro de commande
- [ ] Vérifier le récapitulatif
- [ ] Recevoir l'email de confirmation (si configuré)

### 12.8 Annulation de Commande
- [ ] Tester la redirection vers `/store/checkout/cancel`
- [ ] Vérifier le message d'annulation
- [ ] Vérifier que le panier est préservé

## 13. Tests Multi-Rôles

### 13.1 Rôle CASHIER
- [ ] Se connecter avec un compte caissier
- [ ] Vérifier l'accès aux pages:
  - Tableau de bord ✅
  - Caisse ✅
  - Clients ✅
  - Sessions ✅
  - Factures ✅
  - Événements ✅
- [ ] Vérifier l'absence d'accès:
  - Produits ❌
  - Équipements ❌
  - Maintenance ❌
  - Rapports ❌

### 13.2 Rôle TECHNICIAN
- [ ] Se connecter avec un compte technicien
- [ ] Vérifier l'accès:
  - Tableau de bord ✅
  - Équipements ✅
  - Maintenance ✅
- [ ] Vérifier l'absence d'accès:
  - Caisse ❌
  - Clients ❌
  - Sessions ❌
  - Factures ❌
  - Produits ❌
  - Événements ❌
  - Rapports ❌

### 13.3 Rôle MANAGER
- [ ] Se connecter avec un compte gérant
- [ ] Vérifier l'accès complet sauf:
  - Pas de suppression de produits ❌
  - Pas de suppression d'équipements ❌

### 13.4 Rôle SHAREHOLDER
- [ ] Se connecter avec un compte actionnaire
- [ ] Vérifier l'accès en lecture seule:
  - Clients ✅ (lecture)
  - Factures ✅ (lecture)
  - Rapports ✅
- [ ] Vérifier l'absence d'accès:
  - Caisse ❌
  - Sessions ❌
  - Produits ❌
  - Équipements ❌
  - Maintenance ❌
  - Événements ❌

### 13.5 Rôle ADMIN
- [ ] Se connecter avec le compte admin
- [ ] Vérifier l'accès COMPLET à toutes les fonctionnalités
- [ ] Vérifier que tous les boutons et actions sont disponibles

## 14. Tests de Performance

### 14.1 Charge Utilisateur
- [ ] Créer 50 clients
- [ ] Créer 30 sessions simultanées
- [ ] Vérifier que le tableau de bord reste responsive
- [ ] Vérifier que les statistiques se calculent rapidement

### 14.2 Pagination
- [ ] Tester avec 100+ factures
- [ ] Tester avec 200+ sessions
- [ ] Vérifier que la pagination fonctionne correctement
- [ ] Vérifier les temps de chargement

### 14.3 Recherche
- [ ] Rechercher avec 1000+ clients
- [ ] Vérifier la vitesse de recherche
- [ ] Vérifier l'affichage des résultats

## 15. Tests de Sécurité

### 15.1 Authentification
- [ ] Essayer de se connecter avec un mauvais mot de passe
- [ ] Vérifier le message d'erreur
- [ ] Essayer d'accéder au dashboard sans être connecté
- [ ] Vérifier la redirection vers `/login`

### 15.2 Autorisations
- [ ] Se connecter comme CASHIER
- [ ] Essayer d'accéder directement à `/dashboard/products`
- [ ] Vérifier l'erreur 403 ou redirection

### 15.3 Protection des Données
- [ ] Vérifier que les mots de passe sont hashés
- [ ] Vérifier que les emails ne sont pas exposés publiquement
- [ ] Vérifier que les données sensibles sont protégées

## 16. Tests Mobile Responsiveness

### 16.1 Dashboard
- [ ] Tester sur mobile (320px - 768px)
- [ ] Vérifier que la sidebar se transforme en menu hamburger
- [ ] Vérifier que les cartes s'empilent verticalement
- [ ] Vérifier que les boutons restent cliquables

### 16.2 Store
- [ ] Tester le carrousel de produits vedettes sur mobile
- [ ] Vérifier que les images ne sont pas trop grandes
- [ ] Vérifier que le panier est accessible
- [ ] Tester le checkout sur mobile

### 16.3 Navigation
- [ ] Tester le menu de navigation sur mobile
- [ ] Vérifier l'ouverture/fermeture de la sidebar
- [ ] Vérifier que le contenu n'est pas caché

## 17. Tests d'Intégration

### 17.1 Session → Facture
- [ ] Créer une session
- [ ] La terminer
- [ ] Vérifier la création automatique de la facture
- [ ] Vérifier que le montant est correct

### 17.2 Réservation → Session
- [ ] Créer une réservation
- [ ] Attendre la date
- [ ] Démarrer la session depuis la réservation
- [ ] Vérifier que la réservation passe en "Complétée"

### 17.3 Store → Stock
- [ ] Créer un produit avec 10 unités
- [ ] Acheter 3 unités via le store
- [ ] Vérifier dans le dashboard que le stock est passé à 7

### 17.4 Événement → Clients
- [ ] Créer un événement
- [ ] Inscrire un nouveau client
- [ ] Vérifier que le client est créé dans la base
- [ ] Vérifier qu'il apparaît dans la liste des clients

## 18. Tests Edge Cases

### 18.1 Stock Épuisé
- [ ] Créer un produit avec 0 stock
- [ ] Vérifier qu'il apparaît comme "Rupture de stock"
- [ ] Vérifier qu'on ne peut pas l'ajouter au panier

### 18.2 Session Hors Limite
- [ ] Créer une session de 1 heure
- [ ] Laisser le timer arriver à 0
- [ ] Vérifier que la session se termine automatiquement
- [ ] Vérifier qu'une facture est créée

### 18.3 Double Réservation
- [ ] Créer une réservation pour une station à 14h-16h
- [ ] Essayer de créer une autre réservation pour la même station à 15h
- [ ] Vérifier le message d'erreur de conflit

### 18.4 Événement Complet
- [ ] Remplir un événement à 100%
- [ ] Essayer d'inscrire un nouveau participant
- [ ] Vérifier que c'est impossible

## 19. Tests de Localisation

### 19.1 Langue
- [ ] Vérifier que tous les textes sont en français
- [ ] Vérifier qu'il n'y a pas de texte en anglais

### 19.2 Devise
- [ ] Vérifier que tous les prix sont en FCFA
- [ ] Vérifier le formatage (ex: 45 000 FCFA)

### 19.3 Format de Date
- [ ] Vérifier que les dates sont au format français (jj/mm/aaaa)
- [ ] Vérifier les jours de la semaine en français

## 20. Tests d'Accessibilité

### 20.1 Navigation Clavier
- [ ] Naviguer dans le dashboard avec Tab
- [ ] Vérifier l'ordre de focus logique
- [ ] Vérifier que tous les boutons sont accessibles

### 20.2 Contraste
- [ ] Vérifier le contraste des textes en mode clair
- [ ] Vérifier le contraste des textes en mode sombre
- [ ] Vérifier que les boutons sont bien visibles

### 20.3 Taille de Texte
- [ ] Vérifier que les textes sont lisibles
- [ ] Tester le zoom à 200%
- [ ] Vérifier que l'interface reste utilisable

## Checklist Finale

- [ ] Tous les tests ci-dessus ont été effectués
- [ ] Tous les bugs critiques ont été corrigés
- [ ] Toutes les fonctionnalités principales fonctionnent
- [ ] L'application est performante
- [ ] L'application est responsive
- [ ] L'application est sécurisée
- [ ] La documentation est à jour

## Notes et Bugs Trouvés

Créer une section pour noter tous les bugs trouvés pendant les tests:

**Bug #1**: [Description]
- **Sévérité**: Critique/Majeur/Mineur
- **Statut**: Ouvert/En cours/Résolu
- **Description**: [Détails]
- **Étapes pour reproduire**: [Étapes]
- **Solution proposée**: [Solution]

---

**Document créé le**: 13 avril 2026
**Dernière mise à jour**: 13 avril 2026
**Version**: 1.0
**Testeur**: Erwan Lefak
