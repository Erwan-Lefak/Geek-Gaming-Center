import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const templates = [
  {
    mailType: 'customer_welcome',
    mailSubject: 'Bienvenue chez Geek Gaming Center !',
    mailBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎮 Bienvenue chez Geek Gaming Center !</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Bonjour {customer_name},</p>
          <p style="font-size: 16px; color: #333;">
            Nous sommes ravis de vous accueillir parmi nous ! Votre compte a été créé avec succès.
          </p>
          <p style="font-size: 16px; color: #333;">
            Vous pouvez maintenant vous connecter et profiter de nos services :
          </p>
          <ul style="color: #333; line-height: 1.8;">
            <li>✅ Réservation de sessions de gaming</li>
            <li>✅ Accès à notre boutique en ligne</li>
            <li>✅ Suivi de vos commandes</li>
            <li>✅ Gestion de votre profil</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            {verification_link}
          </div>
          <p style="font-size: 14px; color: #666; font-style: italic;">
            À très bientôt sur Geek Gaming Center !
          </p>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>Cet email a été envoyé à {email}</p>
          <p>© 2026 Geek Gaming Center. Tous droits réservés.</p>
        </div>
      </div>
    `,
  },
  {
    mailType: 'admin_new_customer_registration',
    mailSubject: '🆕 Nouveau client inscrit - {customer_name}',
    mailBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🆕 Nouveau Client Inscrit</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Informations du client</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #666;">Nom complet :</td>
              <td style="padding: 10px; color: #333;">{customer_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #666;">Email :</td>
              <td style="padding: 10px; color: #333;">{customer_email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #666;">Téléphone :</td>
              <td style="padding: 10px; color: #333;">{customer_phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #666;">Adresse :</td>
              <td style="padding: 10px; color: #333;">{customer_address}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #666;">Date d'inscription :</td>
              <td style="padding: 10px; color: #333;">{registration_date}</td>
            </tr>
          </table>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{admin_panel_url}" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Voir dans le dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  },
]

async function createTemplates() {
  console.log('🔧 Checking email templates...')

  for (const template of templates) {
    try {
      const existing = await prisma.mailTemplate.findUnique({
        where: { mailType: template.mailType }
      })

      if (existing) {
        console.log(`✅ Template "${template.mailType}" already exists - skipping`)
      } else {
        await prisma.mailTemplate.create({
          data: template
        })
        console.log(`✅ Created template "${template.mailType}"`)
      }
    } catch (error: any) {
      console.error(`❌ Error creating template "${template.mailType}":`, error.message)
    }
  }

  console.log('\n✅ Email templates setup complete!')
}

createTemplates()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Error:', error)
    prisma.$disconnect()
    process.exit(1)
  })
