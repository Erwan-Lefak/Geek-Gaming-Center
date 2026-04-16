import { hash, compare } from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma/client'

export interface CustomerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  address: string
  howDidYouFindUs: string
  howDidYouFindUsDetails?: string
}

/**
 * Register a new customer
 */
export async function registerCustomer(data: CustomerData) {
  const existingEmail = await prisma.customer.findUnique({
    where: { email: data.email },
  })

  if (existingEmail) {
    throw new Error('Un compte avec cet email existe déjà')
  }

  const existingPhone = await prisma.customer.findFirst({
    where: { phone: data.phone },
  })

  if (existingPhone) {
    throw new Error('Un compte avec ce numéro de téléphone existe déjà')
  }

  const hashedPassword = await hash(data.password, 12)

  // Créer un utilisateur système par défaut pour createdById
  // ou utiliser le premier admin
  const defaultUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!defaultUser) {
    throw new Error('Configuration système incorrecte')
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  const customer = await prisma.customer.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      howDidYouFindUs: data.howDidYouFindUs,
      howDidYouFindUsDetails: data.howDidYouFindUsDetails,
      acceptCGV: true,
      cgvAcceptedAt: new Date(),
      is_active: true,
      password: hashedPassword,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
      createdById: defaultUser.id,
    },
  } as any)

  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    verificationToken,
  }
}

/**
 * Login customer
 */
export async function loginCustomer(email: string, password: string) {
  const customer = await prisma.customer.findUnique({
    where: { email },
  })

  if (!customer) {
    throw new Error('Email ou mot de passe incorrect')
  }

  if (customer.status === 'BLOCKED' || customer.is_active === false) {
    throw new Error('Ce compte a été bloqué ou désactivé')
  }

  // Check password if exists
  if (customer.password) {
    const passwordMatch = await compare(password, customer.password)
    if (!passwordMatch) {
      throw new Error('Email ou mot de passe incorrect')
    }
  }

  return {
    id: customer!.id,
    firstName: customer!.firstName,
    lastName: customer!.lastName,
    email: customer!.email,
    phone: customer!.phone,
  }
}

/**
 * Get customer by ID
 */
export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      status: true,
      createdAt: true,
    },
  })

  if (!customer) {
    throw new Error('Client non trouvé')
  }

  return customer
}

/**
 * Update customer password
 */
export async function updateCustomerPassword(
  customerId: string,
  oldPassword: string,
  newPassword: string
) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  })

  if (!customer) {
    throw new Error('Client non trouvé')
  }

  // Check old password if exists
  if (customer.password) {
    const passwordMatch = await compare(oldPassword, customer.password)
    if (!passwordMatch) {
      throw new Error('Ancien mot de passe incorrect')
    }
  }

  const hashedPassword = await hash(newPassword, 12)

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      password: hashedPassword,
    },
  } as any)

  return { success: true }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  const customer = await prisma.customer.findUnique({
    where: { email },
  })

  if (!customer) {
    throw new Error('Aucun compte trouvé avec cet email')
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetExpires = new Date(Date.now() + 3600000) // 1 hour

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      password_reset_token: resetToken,
      password_reset_expires: resetExpires,
    },
  } as any)

  return {
    success: true,
    token: resetToken,
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      password_reset_token: token,
      password_reset_expires: {
        gte: new Date(),
      },
    },
  } as any)

  if (!customer) {
    throw new Error('Lien de réinitialisation invalide ou expiré')
  }

  const hashedPassword = await hash(newPassword, 12)

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null,
    },
  } as any)

  return { success: true }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      email_verification_token: token,
      email_verification_expires: {
        gte: new Date(),
      },
    },
  } as any)

  if (!customer) {
    throw new Error('Lien de vérification invalide ou expiré')
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      email_verified: new Date(),
      email_verification_token: null,
      email_verification_expires: null,
    },
  } as any)

  return {
    success: true,
    email: customer.email,
  }
}

/**
 * Check if customer email is verified
 */
export async function isEmailVerified(customerId: string): Promise<boolean> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      email_verified: true,
    },
  })

  return customer?.email_verified !== null
}
