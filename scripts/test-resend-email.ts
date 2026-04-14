import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend('re_VwUFohDm_FdEbNbs26DN55pL9ehrsC2Hz')

async function testResendEmail() {
  console.log('🧪 Testing Resend Email Service...')
  console.log('=====================================\n')

  try {
    // Send test email
    const { data, error } = await resend.emails.send({
      from: 'Geek Gaming Center <onboarding@resend.dev>', // Use Resend's default domain for testing
      to: ['erwan.lefak@gmail.com'],
      subject: '🎮 Test Email - Geek Gaming Center',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 Geek Gaming Center</h1>
            </div>
            <div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
              <h2>Test Email Configuration</h2>
              <p>Hello Erwan !</p>
              <p>Ceci est un email de test pour vérifier que la configuration Resend fonctionne correctement.</p>
              <p><strong>✅ Si tu reçois cet email, tout est OK !</strong></p>
              <p>Le système d'envoi d'emails est prêt pour :</p>
              <ul>
                <li>✅ Emails de bienvenue</li>
                <li>✅ Vérification d'email</li>
                <li>✅ Réinitialisation de mot de passe</li>
                <li>✅ Confirmations de réservation</li>
                <li>✅ Rappels de session</li>
              </ul>
              <p style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3000" class="button">Accéder au site</a>
              </p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #666;">
                Geek Gaming Center - Douala, Cameroun<br>
                Ton corps. Ton moment. Ton karma.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: 'support@geekgamingcenter.cm'
    })

    if (error) {
      console.error('❌ Error sending email:', error)
      return false
    }

    console.log('✅ Email sent successfully!')
    console.log('📧 Email ID:', data?.id)
    console.log('📨 To: erwan.lefak@gmail.com')
    console.log('\n🔍 Check your inbox (and spam folder)!')
    console.log('📊 View stats at: https://resend.com/dashboard')

    return true
  } catch (error) {
    console.error('❌ Exception:', error)
    return false
  }
}

// Run test
testResendEmail()
  .then(success => {
    if (success) {
      console.log('\n✅ Test completed successfully!')
    } else {
      console.log('\n❌ Test failed!')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })
