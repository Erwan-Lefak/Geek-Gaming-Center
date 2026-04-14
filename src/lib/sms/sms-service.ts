import { Twilio } from 'twilio'
import { prisma } from '@/lib/prisma/client'
import crypto from 'crypto'

// Types
export interface SmsData {
  [key: string]: string | number
}

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || ''

/**
 * SMS Service - Send SMS messages using Twilio
 * Inspired by Karma Pilates email system but for SMS
 */
export class SmsService {
  /**
   * Generate a random 6-digit verification code
   */
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Generate a secure token for email verification
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Store verification code in database (we'll use customer table)
   */
  static async storePhoneVerificationCode(
    customerId: string,
    code: string,
    expiresAt: Date = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  ): Promise<void> {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        password_reset_token: code, // Reuse this field for SMS code
        password_reset_expires: expiresAt
      }
    })
  }

  /**
   * Store email verification token
   */
  static async storeEmailVerificationToken(
    customerId: string,
    token: string,
    expiresAt: Date = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  ): Promise<void> {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        // We'll add emailVerified field later
      }
    })
  }

  /**
   * Send SMS using Twilio
   */
  static async sendSms(to: string, body: string): Promise<boolean> {
    try {
      if (!twilioClient) {
        console.log('📱 [SMS MODE SIMULATION] Twilio not configured. SMS would be sent:')
        console.log(`To: ${to}`)
        console.log(`Body: ${body}`)
        return true // Simulate success in development
      }

      const message = await twilioClient.messages.create({
        body,
        from: TWILIO_PHONE_NUMBER,
        to
      })

      console.log('✅ SMS sent successfully:', message.sid)
      return true
    } catch (error) {
      console.error('❌ Error sending SMS:', error)
      return false
    }
  }

  /**
   * Send phone verification code
   */
  static async sendPhoneVerificationCode(
    customerId: string,
    phoneNumber: string,
    customerName: string = ''
  ): Promise<{ success: boolean; code?: string }> {
    try {
      // Generate 6-digit code
      const code = this.generateVerificationCode()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      // Store code in database
      await this.storePhoneVerificationCode(customerId, code, expiresAt)

      // Send SMS
      const message = `🎮 Geek Gaming Center

Bonjour ${customerName || 'gamer'} !

Ton code de vérification est : ${code}

⚠️ Ce code expire dans 15 minutes.

Si tu n'es pas à l'origine de cette demande, ignore ce message.`

      const sent = await this.sendSms(phoneNumber, message)

      if (sent) {
        console.log(`✅ Verification code sent to ${phoneNumber}: ${code}`)
        return { success: true, code }
      }

      return { success: false }
    } catch (error) {
      console.error('❌ Error sending verification code:', error)
      return { success: false }
    }
  }

  /**
   * Verify phone code
   */
  static async verifyPhoneCode(customerId: string, code: string): Promise<boolean> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      })

      if (!customer || !customer.password_reset_token || !customer.password_reset_expires) {
        return false
      }

      // Check if code matches and is not expired
      const isValid =
        customer.password_reset_token === code &&
        new Date() < customer.password_reset_expires

      if (isValid) {
        // Clear the token after successful verification
        await prisma.customer.update({
          where: { id: customerId },
          data: {
            password_reset_token: null,
            password_reset_expires: null
          }
        })
      }

      return isValid
    } catch (error) {
      console.error('❌ Error verifying phone code:', error)
      return false
    }
  }

  /**
   * Send booking reminder
   */
  static async sendBookingReminder(
    phoneNumber: string,
    customerName: string,
    bookingData: {
      date: string
      time: string
      equipment: string
    }
  ): Promise<boolean> {
    const message = `🎮 Geek Gaming Center

Hello ${customerName} !

Rappel : Ta session est prévue ${bookingData.date} à ${bookingData.time}

Équipement : ${bookingData.equipment}

À tout de suite ! 🎮`

    return this.sendSms(phoneNumber, message)
  }

  /**
   * Send booking confirmation
   */
  static async sendBookingConfirmation(
    phoneNumber: string,
    customerName: string,
    bookingData: {
      date: string
      time: string
      equipment: string
    }
  ): Promise<boolean> {
    const message = `🎮 Geek Gaming Center

✅ ${customerName}, ta session est confirmée !

${bookingData.date} à ${bookingData.time}
Équipement : ${bookingData.equipment}

Arrive 10 min avant ! À vite ! 🎮`

    return this.sendSms(phoneNumber, message)
  }

  /**
   * Format phone number to international format
   * Converts +237 or 00237 to +237 format
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '')

    // Add +237 prefix if not present (Cameroon)
    if (!cleaned.startsWith('237')) {
      cleaned = '237' + cleaned
    }

    return '+' + cleaned
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15
  }
}

export default SmsService
