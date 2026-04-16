import { prisma } from '../src/lib/prisma/client'

async function seedEmailTemplates() {
  console.log('🌱 Seeding email templates...')

  const templates = [
    // =================== CUSTOMER EMAILS ===================

    // 1. Welcome email
    {
      mailType: 'customer_welcome',
      mailSubject: '🎮 Bienvenue chez Geek Gaming Center !',
      mailBody: `Bonjour {customer_name},<br><br>

🎮 Bienvenue chez <strong>Geek Gaming Center</strong> !<br><br>

Ton compte a été créé avec succès. Pour finaliser ton inscription, nous t'invitons à vérifier ton adresse email en cliquant sur le bouton ci-dessous :<br><br>

{verification_link}<br><br>

<strong>À quoi va te servir ton compte ?</strong><br><br>

✅ Réserver des sessions de gaming<br>
✅ Réserver des équipements (PS5, PS4, PC, VR, etc.)<br>
✅ Suivre tes statistiques de jeu<br>
✅ Recevoir des offres exclusives<br>
✅ Participer aux tournois<br><br>

<strong>📍 Nous trouver</strong><br><br>

Geek Gaming Center<br>
Douala, Cameroun<br><br>

À très vite pour des sessions de gaming inoubliables !<br><br>

L'équipe Geek Gaming Center 🎮<br>
Ton corps. Ton moment. Ton karma.`,
      isActive: true
    },

    // 2. Email verification
    {
      mailType: 'customer_email_verification',
      mailSubject: 'Confirme ton adresse email',
      mailBody: `Bonjour {customer_name},<br><br>

Merci de t'être inscrit sur Geek Gaming Center !<br><br>

Pour finaliser ton inscription, merci de confirmer ton adresse email en cliquant sur le bouton suivant :<br><br>

{verification_link}<br><br>

Ou copie-colle ce lien dans ton navigateur :<br><br>

{verification_url}<br><br>

⚠️ Ce lien expire dans 24 heures.<br><br>

Si tu n'es pas à l'origine de cette inscription, tu peux ignorer cet email.<br><br>

À très vite !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // 3. Password reset
    {
      mailType: 'customer_password_reset',
      mailSubject: 'Réinitialisation de ton mot de passe',
      mailBody: `Bonjour {customer_name},<br><br>

Tu as demandé la réinitialisation de ton mot de passe sur Geek Gaming Center.<br><br>

Pour réinitialiser ton mot de passe, clique sur le bouton suivant :<br><br>

{reset_link}<br><br>

Ou copie-colle ce lien dans ton navigateur :<br><br>

{reset_url}<br><br>

⚠️ Ce lien expire dans 1 heure.<br><br>

Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email et ton mot de passe restera inchangé.<br><br>

À très vite !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // 4. Password setup (first connection)
    {
      mailType: 'customer_password_setup',
      mailSubject: 'Crée ton mot de passe',
      mailBody: `Bonjour {customer_name},<br><br>

Ton compte est prêt ! La dernière étape est de créer ton mot de passe pour te connecter.<br><br>

Clique sur le bouton suivant pour créer ton mot de passe :<br><br>

{setup_link}<br><br>

Ou copie-colle ce lien dans ton navigateur :<br><br>

{setup_url}<br><br>

⚠️ Ce lien expire dans 24 heures.<br><br>

Pour ta sécurité, choisis un mot de passe :<br>
- D'au moins 8 caractères<br>
- Avec des majuscules et minuscules<br>
- Avec des chiffres et des caractères spéciaux<br><br>

À très vite sur Geek Gaming Center !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // 5. Account ready (all verified)
    {
      mailType: 'customer_account_ready',
      mailSubject: '🎉 Ton compte est prêt ! Viens gamer !',
      mailBody: `Bonjour {customer_name},<br><br>

🎉 <strong>Félicitations ! Ton compte est maintenant activé !</strong><br><br>

Tu peux maintenant :<br><br>

✅ Réserver tes sessions de gaming<br>
✅ Choisir ton équipement préféré (PS5, PS4, PC, VR, Simu Racing)<br>
✅ Réserver en ligne et payer à la caisse<br>
✅ Suivre tes statistiques et historique<br><br>

<strong>🚀 Ta première réservation</strong><br><br>

Connecte-toi dès maintenant sur ton espace client et réserve ta première session !<br><br>

<a href="https://geekgamingcenter.cm/login" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Me connecter</a><br><br>

À très vite chez Geek Gaming Center !<br><br>

L'équipe Geek Gaming Center 🎮<br>
Ton moment. Ton jeu. Ton karma.`,
      isActive: true
    },

    // =================== BOOKING EMAILS ===================

    // 6. Booking confirmed
    {
      mailType: 'booking_confirmed',
      mailSubject: '✅ Ta session de gaming est confirmée !',
      mailBody: `Bonjour {customer_name},<br><br>

🎮 <strong>Ta session de gaming est confirmée !</strong><br><br>

<strong>📅 Détails de ta réservation :</strong><br><br>

Date : {booking_date}<br>
Heure : {booking_time}<br>
Équipement : {equipment_name}<br>
Durée : {duration}<br>
Prix : {price}<br><br>

<strong>📍 Nous trouver</strong><br><br>

Geek Gaming Center<br>
Douala, Cameroun<br><br>

<strong>💡 À savoir :</strong><br><br>

✅ Arrive 10 minutes avant le début de ta session<br>
✅ Boissons et snacks disponibles sur place<br>
✅ Wifi haut débit inclus<br><br>

Nous t'attendons pour une session de gaming inoubliable !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // 7. Booking reminder (24h before)
    {
      mailType: 'booking_reminder_24h',
      mailSubject: '🔔 Rappel : Ta session est demain !',
      mailBody: `Hello {customer_name} !<br><br>

🔔 <strong>Rappel : Ta session de gaming est prévue demain !</strong><br><br>

<strong>📅 Demain :</strong><br><br>

À : {booking_time}<br>
Équipement : {equipment_name}<br>
Durée : {duration}<br><br>

N'oublie pas d'arriver 10 minutes avant pour t'installer confortablement.<br><br>

À demain chez Geek Gaming Center !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // 8. Booking reminder (1h before)
    {
      mailType: 'booking_reminder_1h',
      mailSubject: '⏰ Ta session commence dans 1h !',
      mailBody: `Hello {customer_name} !<br><br>

⏰ <strong>Ta session commence dans 1 heure !</strong><br><br>

<strong>📅 Aujourd'hui à :</strong><br><br>

{booking_time}<br>
Équipement : {equipment_name}<br><br>

On te réserve la meilleure place ! À tout de suite !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // 9. Booking cancelled
    {
      mailType: 'booking_cancelled',
      mailSubject: 'Annulation de ta session',
      mailBody: `Bonjour {customer_name},<br><br>

Ta session de gaming du {booking_date} à {booking_time} a bien été annulée.<br><br>

Si tu avais déjà payé, ton remboursement sera effectué sous 24-48 heures.<br><br>

N'hésite pas à nous contacter pour toute question ou à réserver une nouvelle session quand tu veux !<br><br>

À très vite sur Geek Gaming Center !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // 10. Booking modified
    {
      mailType: 'booking_modified',
      mailSubject: 'Ta session a été modifiée',
      mailBody: `Bonjour {customer_name},<br><br>

Ta session de gaming a bien été modifiée.<br><br>

<strong>✅ Nouveaux détails :</strong><br><br>

Date : {booking_date}<br>
Heure : {booking_time}<br>
Équipement : {equipment_name}<br>
Durée : {duration}<br>
Prix : {price}<br><br>

On te retrouve là-bas !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // =================== ORDER EMAILS ===================

    // 11. Order confirmed
    {
      mailType: 'order_confirmed',
      mailSubject: '🎉 Commande confirmée !',
      mailBody: `Bonjour {customer_name},<br><br>

🎉 <strong>Merci pour votre commande !</strong><br><br>

Nous sommes ravis de vous annoncer que votre commande a été confirmée.<br><br>

<strong>📦 Détails de la commande :</strong><br><br>

Référence : {order_number}<br>
Date : {order_date}<br><br>

<strong>Articles commandés :</strong><br><br>

{order_items}<br><br>

<strong>💰 Récapitulatif :</strong><br><br>

Sous-total : {subtotal}<br>
Livraison : {shipping}<br>
<strong>Total : {total}</strong><br><br>

<strong>📢 Adresse de livraison :</strong><br><br>

{shipping_address}<br><br>

<strong>⏳ Délai de livraison :</strong><br><br>

Vous recevrez votre commande sous 2-5 jours ouvrés.<br>
Nous vous informerons dès l'expédition de votre colis.<br><br>

<strong>💡 À savoir :</strong><br><br>

✅ Un email de confirmation vous a été envoyé<br>
✅ Vous pouvez suivre votre commande depuis votre espace client<br>
✅ Pour toute question, contactez notre support client<br><br>

Merci de votre confiance !<br><br>

L'équipe Geek Gaming Center 🎮<br>
Ton corps. Ton moment. Ton karma.`,
      isActive: true
    },

    // 12. Order shipped
    {
      mailType: 'order_shipped',
      mailSubject: '🚀 Votre commande a été expédiée !',
      mailBody: `Bonjour {customer_name},<br><br>

🚀 <strong>Bonne nouvelle ! Votre commande est en route !</strong><br><br>

Votre commande {order_number} a été expédiée et sera bientôt entre vos mains.<br><br>

<strong>📦 Détails de l'expédition :</strong><br><br>

Transporteur : {carrier}<br>
Numéro de suivi : {tracking_number}<br>
Adresse de livraison : {shipping_address}<br><br>

<strong>⏳ Délai de livraison :</strong><br><br>

Livraison prévue sous : {delivery_estimate}<br><br>

Vous pouvez suivre votre commande en temps réel avec le numéro de suivi ci-dessus.<br><br>

À très vite chez Geek Gaming Center !<br><br>

L'équipe Geek Gaming Center 🎮`,
      isActive: true
    },

    // =================== ADMIN NOTIFICATIONS ===================

    // 13. New customer
    {
      mailType: 'admin_new_customer',
      mailSubject: '🆕 Nouveau client inscrit',
      mailBody: `Bonjour Admin,<br><br>

Un nouveau client vient de s'inscrire sur Geek Gaming Center.<br><br>

<strong>👤 Détails du client :</strong><br><br>

Nom : {last_name} {first_name}<br>
Email : {email}<br>
Téléphone : {phone}<br>
Source : {how_did_you_find_us}<br><br>

Inscription le : {created_at}<br><br>

À très vite !<br><br>

Geek Gaming Center 🎮`,
      isActive: true
    },

    // 12. New booking
    {
      mailType: 'admin_new_booking',
      mailSubject: '🆕 Nouvelle réservation',
      mailBody: `Bonjour Admin,<br><br>

Une nouvelle réservation a été effectuée.<br><br>

<strong>👤 Client :</strong><br>

Nom : {customer_name}<br>
Email : {email}<br><br>

<strong>🎮 Réservation :</strong><br>

Date : {booking_date}<br>
Heure : {booking_time}<br>
Équipement : {equipment_name}<br>
Durée : {duration}<br>
Prix : {price}<br><br>

À très vite !<br><br>

Geek Gaming Center 🎮`,
      isActive: true
    },

    // 14. New order
    {
      mailType: 'admin_new_order',
      mailSubject: '🆕 Nouvelle commande boutique',
      mailBody: `Bonjour Admin,<br><br>

Une nouvelle commande a été passée sur la boutique.<br><br>

<strong>👤 Client :</strong>

Nom : {customer_name}<br>
Email : {customer_email}<br><br>

<strong>📦 Commande :</strong>

Référence : {order_number}<br>
Date : {order_date}<br>
Mode de paiement : {payment_method}<br><br>

<strong>📝 Articles :</strong>

{order_items}<br><br>

<strong>💰 Montants :</strong>

Sous-total : {subtotal}<br>
Livraison : {shipping}<br>
Total : {total}<br><br>

<strong>📍 Adresse de livraison :</strong>

{shipping_address}<br><br>

À très vite !<br><br>

Geek Gaming Center 🎮`,
      isActive: true
    },

    // 15. Booking modified
    {
      mailType: 'admin_booking_modified',
      mailSubject: 'Réservation modifiée',
      mailBody: `Bonjour Admin,<br><br>

Une réservation a été modifiée.<br><br>

<strong>👤 Client :</strong><br>

Nom : {customer_name}<br>
Email : {email}<br><br>

<strong>✅ Nouveaux détails :</strong><br>

Date : {booking_date}<br>
Heure : {booking_time}<br>
Équipement : {equipment_name}<br><br>

À très vite !<br><br>

Geek Gaming Center 🎮`,
      isActive: true
    },

    // 14. Booking cancelled
    {
      mailType: 'admin_booking_cancelled',
      mailSubject: 'Réservation annulée',
      mailBody: `Bonjour Admin,<br><br>

Une réservation a été annulée.<br><br>

<strong>👤 Client :</strong><br>

Nom : {customer_name}<br>
Email : {email}<br><br>

<strong>❌ Réservation annulée :</strong><br>

Date : {booking_date}<br>
Heure : {booking_time}<br>
Équipement : {equipment_name}<br><br>

À très vite !<br><br>

Geek Gaming Center 🎮`,
      isActive: true
    }
  ]

  try {
    // Insert templates
    for (const template of templates) {
      const existing = await prisma.mailTemplate.findUnique({
        where: { mailType: template.mailType }
      })

      if (existing) {
        console.log(`⚠️  Template "${template.mailType}" exists, skipping...`)
      } else {
        await prisma.mailTemplate.create({
          data: template
        })
        console.log(`✅ Created template: ${template.mailType}`)
      }
    }

    console.log('\n✅ Email templates seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding email templates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedEmailTemplates()
