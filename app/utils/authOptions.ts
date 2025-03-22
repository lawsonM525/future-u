// authOptions.ts

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { connect } from "@/lib/mongodb"
import { User } from "@/models/User"

export const { handlers: authHandlers, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connect()
          
          // Find or create user in MongoDB
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user
            await User.create({
              email: user.email,
              name: user.name,
              googleId: user.id,
              avatarUrl: user.image
            })
          } else if (existingUser.googleId !== user.id) {
            // Update Google ID if it changed
            existingUser.googleId = user.id
            existingUser.avatarUrl = user.image
            await existingUser.save()
          }
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      return true
    },
    async session({ session }) {
      try {
        await connect()
        // Get user from database and add any custom fields to session
        const user = await User.findOne({ email: session.user?.email })
        if (user && session.user) {
          session.user.id = user._id.toString()
        }
      } catch (error) {
        console.error('Session callback error:', error)
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",
})
