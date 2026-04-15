/**
 * Script pour migrer les templates d'emails vers Vercel Postgres
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateMailTemplates() {
  console.log('📧 Migration des templates d\'emails vers Vercel Postgres\n')

  const templates = [
    {
      mailType: 'admin_booking_cancelled',
      mailSubject: 'Réservation annulée',
      mailBody: `Bonjour Admin,<br><br>

Une réservation a été annulée.<br><br>

<strong>👤 Client :</strong><br><br>

Nom : {customer_name}<br>
Email : {email}<br><br>

<strong>❌ Réservation annulée :</strong><br><br>

Date : {booking_date}<br>
Heure : {booking_time}<br>
Équipement : {equipment_name}<br><br>

Le client a été notifié par email de cette annulation.<br><br>

Si un paiement avait été effectué, un remboursement devra être traité.<br><br>

<strong>🔗 Voir les réservations :</strong><br><br>

{admin_panel_url}/bookings<br><br>

Cordialement,<br>
L'équipe {website_title} 🎮`
    },
    {
      mailType: 'admin_booking_modified',
      mailSubject: 'Réservation modifiée',
      mailBody: `Bonjour Admin,<br><br>

Une réservation a été modifiée.<br><br>

<strong>👤 Client :</strong><br><br>

Nom : {customer_name}<br>
Email : {email}<br><br>

<strong>✅ Nouveaux détails :</strong><br><br>

Date : {booking_date}<br>
Heure : {booking_time}<br>
Équipement : {equipment_name}<br>
Durée : {duration}<br>
Prix : {price}<br><br>

Le client a été notifié par email de cette modification.<br><br>

<strong>🔗 Voir la réservation :</strong><br><br>

{admin_panel_url}/bookings<br><br>

Cordialement,<br>
L'équipe {website_title} 🎮`
    },
    {
      mailType: 'admin_new_booking',
      mailSubject: '🆕 Nouvelle réservation',
      mailBody: `Bonjour Admin,<br><br>

Une nouvelle réservation a été effectuée.<br><br>

<strong>👤 Client :</strong><br><br>

Nom : {customer_name}<br>
Email : {email}<br><br>

<strong>📅 Détails de la réservation :</strong><br><br>

Date : {booking_date}<br>
Heure : {booking_time}<br>
Équipement : {equipment_name}<br>
Durée : {duration}<br>
Prix : {price}<br><br>

<strong>📍 Localisation :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

Le client a reçu une confirmation par email.<br><br>

<strong>🔗 Voir la réservation :</strong><br><br>

{admin_panel_url}/bookings<br><br>

Cordialement,<br>
L'équipe {website_title} 🎮`
    },
    {
      mailType: 'admin_new_customer',
      mailSubject: '🆕 Nouveau client inscrit',
      mailBody: `Bonjour Admin,<br><br>

Un nouveau client vient de s'inscrire sur Geek Gaming Center.<br><br>

<strong>👤 Détails du client :</strong><br><br>

Nom : {first_name} {last_name}<br>
Email : {email}<br>
Téléphone : {phone}<br>
Source : {how_did_you_find_us}<br>
Date d'inscription : {created_at}<br><br>

<strong>📍 Localisation :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

Le client recevra un email de bienvenue et devra vérifier son adresse email et son téléphone avant de pouvoir réserver des sessions.<br><br>

<strong>🔗 Voir le client :</strong><br><br>

{admin_panel_url}/customers<br><br>

Cordialement,<br>
L'équipe {website_title} 🎮`
    },
    {
      mailType: 'admin_customer_activated',
      mailSubject: '✅ Client activé - Prêt à gamer !',
      mailBody: `Bonjour Admin,<br><br>

Un client vient de terminer son onboarding et son compte est maintenant activé !<br><br>

<strong>👤 Détails du client :</strong><br><br>

Nom : {customer_name}<br>
Email : {email}<br><br>

<strong>✅ Étapes complétées :</strong><br><br>

✅ Email vérifié<br>
✅ Téléphone vérifié<br>
✅ Mot de passe configuré<br>
✅ Compte activé<br><br>

Le client peut maintenant :<br><br>

🎮 Réserver des sessions de gaming (PS5, PS4, PC)<br>
🛒 Acheter dans la boutique en ligne<br>
🎬 Réserver des séances cinéma<br>
🍔 Commander dans le restaurant GGC<br><br>

<strong>🔗 Voir le client :</strong><br><br>

{admin_panel_url}/customers<br><br>

Cordialement,<br>
L'équipe {website_title} 🎮`
    },
    {
      mailType: 'booking_cancelled',
      mailSubject: 'Annulation de ta session',
      mailBody: `Bonjour {customer_name},<br><br>

Ta session de gaming du {booking_date} à {booking_time} a bien été annulée.<br><br>

<strong>📍 Nos coordonnées :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

<strong>💰 Remboursement :</strong><br><br>

Si tu avais déjà payé, ton remboursement sera traité dans les plus brefs délais.<br><br>

N'hésite pas à nous contacter pour :<br><br>
📞 Reprogrammer ta session<br>
🎮 Réserver un autre créneau<br>
🛒 Acheter des jeux ou accessoires<br><br>

Merci de ta compréhension et à très bientôt chez <strong>Geek Gaming Center</strong> !<br><br>

L'équipe GGC 🎮`
    },
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

<strong>📍 Nous trouver :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

<strong>⏰ Pense à arriver 5 minutes avant !</strong><br><br>

Tu pourras profiter de :<br><br>

🎮 Équipement de dernière génération<br>
🎯 Ambiance gaming conviviale<br>
🍔 Restaurant sur place pour se restaurer<br><br>

<strong>💡 Besoin d'annuler ou de modifier ?</strong><br><br>

Contacte-nous par téléphone ou passe directement au centre.<br><br>

À très bientôt chez <strong>Geek Gaming Center</strong> !<br><br>

L'équipe GGC 🎮`
    },
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

<strong>📍 Nous trouver :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

⏰ Pense à arriver 5 minutes avant le début de ta session !<br><br>

À très bientôt chez <strong>Geek Gaming Center</strong> !<br><br>

L'équipe GGC 🎮`
    },
    {
      mailType: 'booking_reminder_1h',
      mailSubject: '⏰ Ta session commence dans 1h !',
      mailBody: `Hello {customer_name} !<br><br>

⏰ <strong>Ta session commence dans 1 heure !</strong><br><br>

<strong>📅 Aujourd'hui à :</strong><br><br>

{booking_time}<br><br>

<strong>🎮 Équipement :</strong><br><br>

{equipment_name} pour {duration}<br><br>

<strong>📍 Nous trouver :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

Prépare-toi pour une session gaming epic ! 🎮<br><br>

À tout de suite chez <strong>Geek Gaming Center</strong> !<br><br>

L'équipe GGC 🎮`
    },
    {
      mailType: 'booking_reminder_24h',
      mailSubject: '🔔 Rappel : Ta session est demain !',
      mailBody: `Hello {customer_name} !<br><br>

🔔 <strong>Rappel : Ta session de gaming est prévue demain !</strong><br><br>

<strong>📅 Demain :</strong><br><br>

🗓️ Date : {booking_date}<br>
⏰ Heure : {booking_time}<br>
🎮 Équipement : {equipment_name}<br>
⏱️ Durée : {duration}<br><br>

<strong>📍 Nous trouver :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

<strong>💡 Quelques conseils :</strong><br><br>

✅ Arrive 5 minutes avant pour t'installer<br>
✅ Prévois de quoi t'hydrater<br>
✅ Notre restaurant est sur place si tu veux manger<br><br>

<strong>⏰ Besoin d'annuler ?</strong><br><br>

Contacte-nous rapidement pour qu'on puisse libérer le créneau.<br><br>

À demain chez <strong>Geek Gaming Center</strong> !<br><br>

L'équipe GGC 🎮`
    },
    {
      mailType: 'customer_account_ready',
      mailSubject: '🎉 Ton compte est prêt ! Viens gamer !',
      mailBody: `Bonjour {customer_name},<br><br>

🎉 <strong>Félicitations ! Ton compte est maintenant activé !</strong><br><br>

Tu peux maintenant profiter de toutes les fonctionnalités de <strong>Geek Gaming Center</strong> :<br><br>

<strong>🎮 Gaming :</strong> <br>
✅ Réserver des sessions sur PS5, PS4, PC Gamer<br>
✅ Jouer en solo ou entre amis<br><br>

<strong>🛒 Boutique :</strong><br>
✅ Acheter des jeux vidéo et accessoires<br>
✅ Commander des manettes, casques, claviers<br><br>

<strong>🎬 Cinéma :</strong><br>
✅ Réserver des séances pour voir tes films préférés<br>
✅ Profiter de notre écran géant et son immersive<br><br>

<strong>🍔 Restaurant GGC :</strong><br>
✅ Commander des burgers, pizzas et snacks<br>
✅ Manger sur place ou à emporter<br><br>

<strong>📍 Nous trouver :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

<strong>📱 Suis-nous sur les réseaux pour ne rien rater :</strong><br><br>

À très bientôt chez <strong>Geek Gaming Center</strong> !<br><br>

L'équipe GGC 🎮`
    },
    {
      mailType: 'customer_email_verification',
      mailSubject: 'Confirme ton adresse email',
      mailBody: `Bonjour {customer_name},<br><br>

Merci de t'être inscrit sur Geek Gaming Center !<br><br>

Pour finaliser ton inscription, merci de confirmer ton adresse email en cliquant sur le bouton ci-dessous :<br><br>

{verification_link}<br><br>

Ou copie-colle ce lien dans ton navigateur :<br><br>

{verification_url}<br><br>

<strong>⏰ Ce lien expire dans 24 heures.</strong><br><br>

Si tu n'as pas créé de compte chez Geek Gaming Center, tu peux ignorer cet email.<br><br>

L'équipe GGC 🎮`
    },
    {
      mailType: 'customer_password_reset',
      mailSubject: 'Réinitialisation de ton mot de passe',
      mailBody: `Bonjour {customer_name},<br><br>

Tu as demandé la réinitialisation de ton mot de passe sur Geek Gaming Center.<br><br>

Pour réinitialiser ton mot de passe, clique sur le bouton ci-dessous :<br><br>

{reset_link}<br><br>

Ou copie-colle ce lien dans ton navigateur :<br><br>

{reset_url}<br><br>

<strong>⏰ Ce lien expire dans 1 heure.</strong><br><br>

Si tu n'as pas demandé cette réinitialisation, tu peux ignorer cet email et ton mot de passe restera inchangé.<br><br>

L'équipe GGC 🎮`
    },
    {
      mailType: 'customer_password_setup',
      mailSubject: 'Crée ton mot de passe',
      mailBody: `Bonjour {customer_name},<br><br>

Ton compte est prêt ! La dernière étape est de créer ton mot de passe pour te connecter.<br><br>

Clique sur le bouton ci-dessous pour créer ton mot de passe :<br><br>

{setup_link}<br><br>

Ou copie-colle ce lien dans ton navigateur :<br><br>

{setup_url}<br><br>

<strong>⏰ Ce lien expire dans 7 jours.</strong><br><br>

Pour ta sécurité, choisis un mot de passe :<br><br>

✅ Contenant au moins 8 caractères<br>
✅ Avec des majuscules et minuscules<br>
✅ Avec des chiffres et caractères spéciaux<br><br>

Si tu n'as pas demandé à créer un compte, tu peux ignorer cet email.<br><br>

L'équipe GGC 🎮`
    },
    {
      mailType: 'customer_welcome',
      mailSubject: '🎮 Bienvenue chez Geek Gaming Center !',
      mailBody: `Bonjour {customer_name},<br><br>

🎮 <strong>Bienvenue chez <em>Geek Gaming Center</em> !</strong><br><br>

Ton compte a été créé avec succès. Pour finaliser ton inscription et pouvoir réserver des sessions, merci de confirmer ton adresse email en cliquant sur le lien ci-dessous :<br><br>

{verification_link}<br><br>

<strong>📍 Nous trouver :</strong><br><br>

Yaoundé, Chapelle Mvog Ada<br>
Immeuble Jaune<br>
Cameroun<br><br>

<strong>🎯 Tu pourras bientôt :</strong><br><br>

🎮 Jouer sur les meilleurs équipements (PS5, PS4, PC Gamer)<br>
🛒 Acheter des jeux et accessoires dans notre boutique<br>
🎬 Réserver des séances cinéma<br>
🍔 Commander dans le restaurant GGC<br><br>

Si tu n'as pas créé de compte chez Geek Gaming Center, tu peux ignorer cet email.<br><br>

À très bientôt chez <strong>Geek Gaming Center</strong> !<br><br>

L'équipe GGC 🎮`
    }
  ]

  let created = 0
  let updated = 0

  for (const template of templates) {
    try {
      const existing = await prisma.mailTemplate.findUnique({
        where: { mailType: template.mailType }
      })

      if (existing) {
        await prisma.mailTemplate.update({
          where: { mailType: template.mailType },
          data: {
            mailSubject: template.mailSubject,
            mailBody: template.mailBody
          }
        })
        updated++
        console.log(`✅ Updated template: ${template.mailType}`)
      } else {
        await prisma.mailTemplate.create({
          data: {
            mailType: template.mailType,
            mailSubject: template.mailSubject,
            mailBody: template.mailBody,
            isActive: true
          }
        })
        created++
        console.log(`✅ Created template: ${template.mailType}`)
      }
    } catch (error) {
      console.error(`❌ Error with template ${template.mailType}:`, error)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Created: ${created} templates`)
  console.log(`   Updated: ${updated} templates`)
  console.log(`   Total: ${created + updated} templates\n`)

  await prisma.$disconnect()
}

migrateMailTemplates().catch(console.error)
