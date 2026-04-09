import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcryptjs'

const prisma = new PrismaClient()

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
      isActive: true,
      createdById: defaultUser.id,
    },
  } as any)

  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
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

  if (customer.status === 'BLOCKED') {
    throw new Error('Ce compte a été bloqué')
  }

  // Password authentication not supported for customers
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

  // Password changes not supported for customers
  throw new Error('Changement de mot de passe non disponible pour les clients')
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  // Password reset not supported for customers
  throw new Error('Réinitialisation de mot de passe non disponible pour les clients')
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
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
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  } as any)

  return { success: true }
}
