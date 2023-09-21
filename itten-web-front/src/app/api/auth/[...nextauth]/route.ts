import NextAuth from 'next-auth';
import type { NextAuthOptions, User } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';

import { authAdmin } from '@/firebase/admin';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            credentials: {
                idToken: {
                    type: 'text',
                },
            },
            authorize: async (credentials, req) => {
                if (credentials?.idToken) {
                    try {
                        const decoded = await authAdmin.verifyIdToken(credentials?.idToken);
                        return {
                            uid: decoded.uid,
                            id: decoded.uid,
                            email: decoded.email || '',
                            image: decoded.picture || '',
                            name: decoded.name || '',
                            emailVerified: decoded.emailVerified || false,
                        };
                    } catch (err) {
                        console.error(err);
                    }
                }
                return null;
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                if (user.emailVerified instanceof Date) {
                    token.emailVerified = true;
                } else {
                    token.emailVerified = user.emailVerified ?? false;
                }
                token.uid = user.id;
            }
            return token;
        },
        // sessionにJWTトークンからのユーザ情報を格納
        async session({ session, token }) {
            session.user.emailVerified = token.emailVerified;
            session.user.uid = token.uid ?? token.sub;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
