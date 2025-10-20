import NextAuth from 'next-auth';
import Facebook from 'next-auth/providers/facebook';
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // token contains data from the OAuth profile
      if (token.id) {
        session.user.id = token.id as string; // map Facebook ID to session
      }
      return session;
    },
    async jwt({ token, profile }) {
      // Store Facebook profile id in JWT
      if (profile) {
        token.id = profile.id;
      }
      return token;
    },
  },
});
