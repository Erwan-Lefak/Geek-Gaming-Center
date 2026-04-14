import { Resend } from 'resend'

const resend = new Resend('re_VwUFohDm_FdEbNbs26DN55pL9ehrsC2Hz')

async function testEmail() {
  console.log('🧪 Test Resend Email')

  try {
    const { data, error } = await resend.emails.send({
      from: 'Geek Gaming Center <onboarding@resend.dev>',
      to: 'erwan.lefak@gmail.com',
      subject: '🎮 Hello World - Geek Gaming Center',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p><p>🎮 Geek Gaming Center is ready!</p>'
    })

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log('✅ Email sent successfully!')
    console.log('📧 ID:', data?.id)
  } catch (error) {
    console.error('❌ Exception:', error)
  }
}

testEmail()
