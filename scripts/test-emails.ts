/**
 * Test emails to admin and user
 */

// Load environment variables FIRST before any other imports
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local explicitly
const result = config({ path: resolve(process.cwd(), '.env.local') })

console.log('Dotenv result:', result.error ? result.error : 'Loaded')

// Verify env vars are loaded
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length)

import { MailService } from '../src/lib/email/mail-service'

async function testEmails() {
  console.log('🧪 Testing Email Service')
  console.log('=' .repeat(60))

  // Check environment variables
  console.log('\n📧 Email Configuration:')
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing')
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM)
  console.log('EMAIL_REPLY_TO:', process.env.EMAIL_REPLY_TO)
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL)

  const adminEmail = process.env.ADMIN_EMAIL || 'admin.ggccameroun@gmail.com'
  const testUserEmail = 'erwan.lefak@gmail.com'

  // Test 1: Email to admin
  console.log('\n📨 Test 1: Sending email to admin...')
  console.log('To:', adminEmail)

  const adminResult = await MailService.sendEmail({
    to: adminEmail,
    subject: '🧪 Test Email - Geek Gaming Center',
    templateType: 'admin_new_customer',
    data: {
      customer_name: 'Erwan Test',
      first_name: 'Erwan',
      last_name: 'Test',
      email: testUserEmail,
      phone: '690123456',
      how_did_you_find_us: 'Bouche à oreille',
      created_at: new Date().toLocaleString('fr-FR')
    }
  })

  if (adminResult) {
    console.log('✅ Admin email sent successfully!')
  } else {
    console.log('❌ Admin email failed')
  }

  // Test 2: Email to user
  console.log('\n📨 Test 2: Sending email to user...')
  console.log('To:', testUserEmail)

  const userResult = await MailService.sendEmail({
    to: testUserEmail,
    subject: '🎮 Bienvenue chez Geek Gaming Center !',
    templateType: 'customer_welcome',
    data: {
      customer_name: 'Erwan Lefak',
      verification_link: '<a href="http://localhost:3000/verify-email?token=test123" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Vérifier mon email</a>',
      verification_url: 'http://localhost:3000/verify-email?token=test123'
    }
  })

  if (userResult) {
    console.log('✅ User email sent successfully!')
  } else {
    console.log('❌ User email failed')
  }

  // Test 3: Raw HTML email (with explicit from)
  console.log('\n📨 Test 3: Sending custom HTML email...')
  console.log('To:', testUserEmail)

  const customResult = await MailService.sendEmail({
    to: testUserEmail,
    subject: '🧪 Custom Test Email',
    from: 'Geek Gaming Center <onboarding@resend.dev>', // Use Resend's domain
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7c3aed;">🎮 Test Email Geek Gaming Center</h1>
        <p>Bonjour Erwan,</p>
        <p>Ceci est un email de test pour vérifier que le service Resend fonctionne correctement.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Détails du test :</strong></p>
          <ul style="margin: 10px 0;">
            <li>Date : ${new Date().toLocaleString('fr-FR')}</li>
            <li>Service : Resend</li>
            <li>Admin : ${adminEmail}</li>
          </ul>
        </div>
        <p>Si tu reçois cet email, tout fonctionne parfaitement ! 🎉</p>
        <p style="color: #6b7280; font-size: 14px;">L'équipe Geek Gaming Center 🎮</p>
      </div>
    `
  })

  if (customResult) {
    console.log('✅ Custom HTML email sent successfully!')
  } else {
    console.log('❌ Custom HTML email failed')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Test completed!')
  console.log('\n📬 Check your inboxes:')
  console.log('- Admin inbox:', adminEmail)
  console.log('- User inbox:', testUserEmail)
}

// Run test
testEmails().catch(console.error)
