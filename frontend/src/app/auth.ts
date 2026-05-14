import NextAuth from 'next-auth';
import Facebook from 'next-auth/providers/facebook';

const upsertBuyer = async (buyerId: string): Promise<void> => {
  const formData = new FormData();
  formData.append('id', buyerId);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      console.error('upsertBuyer failed', response.status, await response.text().catch(() => ''));
    }
  } catch (error) {
    console.error('upsertBuyer threw', error);
  }
};

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
  events: {
    // Materialise the Buyer row at sign-in so feature gates (Share, coupons) can
    // assume it exists. Idempotent server-side (no-op update if already present).
    async signIn({ user, profile }) {
      const buyerId = (profile?.id as string | undefined) ?? user?.id;
      if (!buyerId) return;
      await upsertBuyer(buyerId);
    },
  },
});
