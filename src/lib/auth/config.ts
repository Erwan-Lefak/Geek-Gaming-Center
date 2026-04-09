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
          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
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

          if (!user || !user.isActive) {
            return null
          }

          const isValidPassword = await compare(password, user.password)

          if (!isValidPassword) {
            return null
          }

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
        } catch (error) {
          console.error('Auth error:', error)
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
