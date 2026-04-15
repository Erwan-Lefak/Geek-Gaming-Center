import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = process.env.PASSWORD_ENCRYPTION_KEY || crypto.randomBytes(32)
const IV_LENGTH = 16

/**
 * Encrypt text using AES-256-GCM
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = crypto.scryptSync(SECRET_KEY, 'salt', 32)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Combine IV, auth tag, and encrypted data
    const combined = iv.toString('hex') + authTag.toString('hex') + encrypted
    return combined
  } catch (error) {
    console.error('Encryption error:', error)
    return text // Fallback to plain text (not recommended for production)
  }
}

/**
 * Decrypt text encrypted with AES-256-GCM
 */
export function decrypt(combined: string): string {
  try {
    // Extract IV, auth tag, and encrypted data
    const iv = Buffer.from(combined.slice(0, IV_LENGTH * 2), 'hex')
    const authTag = Buffer.from(combined.slice(IV_LENGTH * 2, IV_LENGTH * 4), 'hex')
    const encrypted = combined.slice(IV_LENGTH * 4)

    const key = crypto.scryptSync(SECRET_KEY, 'salt', 32)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return combined // Return encrypted string if decryption fails
  }
}
