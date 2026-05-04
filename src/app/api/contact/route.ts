import { NextRequest, NextResponse } from 'next/server'
import { MailService } from '@/lib/email/mail-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin.ggccameroun@gmail.com'

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #db2777); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">Nouveau message de contact</h2>
        </div>
        <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #a78bfa; font-size: 14px; margin-bottom: 20px;">
            Un visiteur a envoyé un message via le formulaire de contact.
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; color: #a78bfa; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1);">Nom</td>
              <td style="padding: 10px; color: white; border-bottom: 1px solid rgba(255,255,255,0.1);">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; color: #a78bfa; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1);">Email</td>
              <td style="padding: 10px; color: white; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <a href="mailto:${email}" style="color: #7c3aed;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; color: #a78bfa; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1);">Sujet</td>
              <td style="padding: 10px; color: white; border-bottom: 1px solid rgba(255,255,255,0.1);">${subject}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <p style="color: #a78bfa; font-weight: bold; margin-bottom: 10px;">Message :</p>
            <p style="color: white; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      </div>
    `

    const sent = await MailService.sendEmail({
      to: adminEmail,
      subject: `[Contact] ${subject}`,
      data: { html: htmlBody },
      replyTo: email,
    })

    if (!sent) {
      console.warn('⚠️ Contact email could not be sent - email service may be disabled')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Contact form error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
