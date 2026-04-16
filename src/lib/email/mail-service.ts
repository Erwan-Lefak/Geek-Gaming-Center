import { Resend } from 'resend'
import { prisma } from '@/lib/prisma/client'

// Types
export interface EmailTemplate {
  mailType: string
  mailSubject: string
  mailBody: string
}

export interface EmailData {
  [key: string]: string | number | boolean
}

export interface SendEmailOptions {
  to: string | string[]
  subject?: string
  templateType?: string
  data?: EmailData
  from?: string
}

// Initialize Resend (only if API key is available)
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === '') {
    console.warn('⚠️ RESEND_API_KEY not found - Email service disabled')
    return null
  }
  try {
    return new Resend(apiKey)
  } catch (error) {
    console.error('❌ Error initializing Resend:', error)
    return null
  }
}

// Default sender
const DEFAULT_FROM = process.env.EMAIL_FROM || 'Geek Gaming Center <support@geek-gaming-center.cam>'
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@geek-gaming-center.cam'

/**
 * Mail Service - Send emails using templates from database
 * Inspired by Karma Pilates SendMailTemplateService
 */
export class MailService {
  /**
   * Replace placeholders in template with actual data
   * Supports {placeholder} syntax
   */
  private static replacePlaceholders(template: string, data: EmailData): string {
    let result = template

    // Replace all placeholders like {customer_name}, {verification_link}, etc.
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`
      const value = String(data[key])
      result = result.replace(new RegExp(placeholder, 'g'), value)
    })

    return result
  }

  /**
   * Wrap HTML with proper DOCTYPE for better email client compatibility
   * Inspired by Karma Pilates Yahoo Mail wrapper
   */
  private static wrapHtml(html: string): string {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { background-color: #6d28d9; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`
  }

  /**
   * Get email template from database
   */
  private static async getTemplate(templateType: string): Promise<EmailTemplate | null> {
    try {
      const template = await prisma.mailTemplate.findUnique({
        where: { mailType: templateType, isActive: true }
      })

      if (!template) {
        console.error(`❌ Email template not found: ${templateType}`)
        return null
      }

      return {
        mailType: template.mailType,
        mailSubject: template.mailSubject,
        mailBody: template.mailBody
      }
    } catch (error) {
      console.error('❌ Error fetching email template:', error)
      return null
    }
  }

  /**
   * Send email using template or custom content
   */
  static async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const {
        to,
        subject: customSubject,
        templateType,
        data = {},
        from = DEFAULT_FROM
      } = options

      // Get template if templateType is provided
      let subject = customSubject || ''
      let htmlBody = ''

      if (templateType) {
        const template = await this.getTemplate(templateType)

        if (!template) {
          throw new Error(`Template not found: ${templateType}`)
        }

        // Replace placeholders in template
        subject = template.mailSubject
        htmlBody = this.replacePlaceholders(template.mailBody, data)
      } else if (customSubject && data.html) {
        // Use custom HTML if provided
        htmlBody = data.html as string
      } else {
        throw new Error('Either templateType or custom subject + html must be provided')
      }

      // Replace placeholders in subject too
      subject = this.replacePlaceholders(subject, data)

      // Wrap HTML with proper DOCTYPE
      const finalHtml = this.wrapHtml(htmlBody)

      // Get Resend instance
      const resend = getResend()

      // Check if Resend is available
      if (!resend) {
        console.warn('⚠️ Email service not available - skipping send')
        return false
      }

      // Send via Resend
      const { data: resendData, error } = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: finalHtml,
        replyTo: REPLY_TO
      })

      if (error) {
        console.error('❌ Resend error:', error)
        return false
      }

      console.log('✅ Email sent successfully:', resendData)
      return true
    } catch (error) {
      console.error('❌ Error sending email:', error)
      return false
    }
  }

  /**
   * Send welcome email with verification link
   */
  static async sendWelcomeEmail(
    email: string,
    firstName: string,
    lastName: string,
    verificationUrl: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      templateType: 'customer_welcome',
      data: {
        customer_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        email,
        verification_link: this.createButton(verificationUrl, 'Vérifier mon email'),
        verification_url: verificationUrl,
        website_title: 'Geek Gaming Center'
      }
    })
  }

  /**
   * Send email verification email
   */
  static async sendEmailVerification(
    email: string,
    name: string,
    verificationUrl: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      templateType: 'customer_email_verification',
      data: {
        customer_name: name,
        email,
        verification_link: this.createButton(verificationUrl, 'Confirmer mon email'),
        verification_url: verificationUrl,
        website_title: 'Geek Gaming Center'
      }
    })
  }

  /**
   * Send account ready email after email verification
   */
  static async sendAccountReadyEmail(
    email: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://geek-gaming-center.cam'}/login`

    return this.sendEmail({
      to: email,
      templateType: 'customer_account_ready',
      data: {
        customer_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        email,
        login_link: this.createButton(loginUrl, 'Se Connecter'),
        login_url: loginUrl,
        website_title: 'Geek Gaming Center'
      }
    })
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(
    email: string,
    name: string,
    resetUrl: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      templateType: 'customer_password_reset',
      data: {
        customer_name: name,
        email,
        reset_link: this.createButton(resetUrl, 'Réinitialiser mon mot de passe'),
        reset_url: resetUrl,
        website_title: 'Geek Gaming Center'
      }
    })
  }

  /**
   * Send password setup email (first connection)
   */
  static async sendPasswordSetup(
    email: string,
    name: string,
    setupUrl: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      templateType: 'customer_password_setup',
      data: {
        customer_name: name,
        email,
        setup_link: this.createButton(setupUrl, 'Créer mon mot de passe'),
        setup_url: setupUrl,
        website_title: 'Geek Gaming Center'
      }
    })
  }

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(
    email: string,
    name: string,
    bookingData: {
      date: string
      time: string
      equipment: string
      duration: number
      price: number
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      templateType: 'booking_confirmed',
      data: {
        customer_name: name,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        equipment_name: bookingData.equipment,
        duration: `${bookingData.duration} min`,
        price: `${bookingData.price} XAF`,
        website_title: 'Geek Gaming Center'
      }
    })
  }

  /**
   * Send notification to admin
   */
  static async sendAdminNotification(
    templateType: string,
    data: EmailData
  ): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin.ggccameroun@gmail.com'

    return this.sendEmail({
      to: adminEmail,
      templateType: `admin_${templateType}`,
      data: {
        ...data,
        website_title: 'Geek Gaming Center',
        admin_panel_url: process.env.NEXTAUTH_URL + '/dashboard'
      }
    })
  }

  /**
   * Create button HTML for email
   */
  private static createButton(url: string, text: string): string {
    return `<a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">${text}</a>`
  }
}

export default MailService
