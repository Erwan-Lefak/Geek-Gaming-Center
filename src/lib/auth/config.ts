import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma/client'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnLogin = nextUrl.pathname.startsWith('/login')
      const isOnApiAuth = nextUrl.pathname.startsWith('/api/auth')

      // Redirection vers dashboard si déjà connecté
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      // Protection des routes dashboard
      if (isOnDashboard && !isLoggedIn) {
        return false
      }

      // API auth routes sont publiques
      if (isOnApiAuth) {
        return true
      }

      return true
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('🔐 [AUTH] Raw credentials received:', {
            hasEmail: !!credentials?.email,
            hasPassword: !!credentials?.password,
            emailType: typeof credentials?.email,
            passwordType: typeof credentials?.password
          })

          const { email, password } = loginSchema.parse(credentials)

          console.log('🔐 [AUTH] Attempting login for:', email)

          // Try to authenticate as User (staff/admin)
          let user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              role: true,
              isActive: true,
            },
          })

          if (user && user.isActive) {
            console.log('👤 [AUTH] User found, testing password...')
            const isValidPassword = await compare(password, user.password)

            if (isValidPassword) {
              console.log('✅ [AUTH] User authenticated successfully')
              // Update last login
              await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
              })

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              }
            }
            console.log('❌ [AUTH] User password mismatch')
          }

          // Try to authenticate as Customer
          console.log('👤 [AUTH] Trying customer authentication...')
          const customer = await prisma.customer.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              is_active: true,
            },
          })

          console.log('🔍 [AUTH] Customer search result:', customer ? 'Found' : 'Not found')

          if (customer) {
            console.log('📋 [AUTH] Customer details:', {
              id: customer.id,
              email: customer.email,
              is_active: customer.is_active,
              has_password: !!customer.password,
              password_length: customer.password?.length
            })
          }

          if (customer && customer.is_active && customer.password) {
            console.log('🔐 [AUTH] Testing customer password...')
            const isValidPassword = await compare(password, customer.password)

            if (isValidPassword) {
              console.log('✅ [AUTH] Customer authenticated successfully as:', customer.firstName + ' ' + customer.lastName)
              return {
                id: customer.id,
                email: customer.email,
                name: `${customer.firstName} ${customer.lastName}`,
                role: 'CUSTOMER',
              }
            }
            console.log('❌ [AUTH] Customer password mismatch')
          } else {
            console.log('❌ [AUTH] Customer not found or inactive or no password')
          }

          console.log('❌ [AUTH] Authentication failed - returning null')
          return null
        } catch (error) {
          console.error('❌ [AUTH] Exception:', error)
          console.error('❌ [AUTH] Error name:', error.name)
          console.error('❌ [AUTH] Error message:', error.message)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 heures
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}
