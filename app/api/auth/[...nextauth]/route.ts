import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { connect } from "@/lib/mongodb"
import { User } from "@/models/User"

const config: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
            // Update Google ID if it changed (??)
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
    async session({ session, token }) {
      try {
        await connect()
        // Get user from database and add any custom fields to session
        const user = await User.findOne({ email: session.user?.email })
        if (user) {
          session.user.id = user._id.toString()
          // Add any other custom fields you want to include in the session
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
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(config)

export { handler as GET, handler as POST }
