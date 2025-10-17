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
    async session({ session, token, user }) {
      // ✅ Works whether you use a DB adapter or not
      if (user?.id) session.user.id = user.id;
      else if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
});
