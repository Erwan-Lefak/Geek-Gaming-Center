import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { MailService } from '@/lib/email/mail-service'

/**
 * Test endpoint pour vérifier l'envoi d'email en production
 * GET /api/test-email
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Seul admin peut tester
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Log des variables d'environnement
    const envVars = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
      EMAIL_FROM: process.env.EMAIL_FROM,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      NODE_ENV: process.env.NODE_ENV,
    }

    console.log('🔍 Environment Variables:', envVars)

    // Test d'envoi d'email simple
    const testResult = await MailService.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin.ggccameroun@gmail.com',
      subject: '🧪 Test Email Production',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">Test Email Production</h1>
          <p>Ceci est un email de test depuis la production Vercel.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Détails :</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Date : ${new Date().toLocaleString('fr-FR')}</li>
              <li>NEXT_PUBLIC_APP_URL : ${envVars.NEXT_PUBLIC_APP_URL}</li>
              <li>Environment : ${envVars.NODE_ENV}</li>
            </ul>
          </div>
          <p>Si vous recevez cet email, tout fonctionne ! 🎉</p>
        </div>
      `
    })

    return NextResponse.json({
      success: testResult,
      envVars,
      message: testResult ? 'Email envoyé avec succès' : 'Échec de l\'envoi'
    })
  } catch (error: any) {
    console.error('❌ Error in test-email:', error)
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
