import { CollectionReference } from 'firebase-admin/firestore';
import NextAuth from 'next-auth';
import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { v4 as uuidv4 } from 'uuid';
import { authAdmin, dbAdmin } from '@/firebase/admin';

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
                        // console.log('authorize', decoded);
                        const memberCollection = dbAdmin.collection(
                            'members',
                        ) as CollectionReference<Member>;
                        const userDocRef = memberCollection.doc(decoded.uid);
                        const docSnap = await userDocRef.get();
                        const memberInfo = docSnap.data();
                        const sessionStateId = uuidv4();

                        return {
                            uid: decoded.uid,
                            id: decoded.uid,
                            email: decoded.email || '',
                            image: memberInfo?.imageUrl || decoded.picture || '',
                            name: memberInfo?.name || decoded.name || '',
                            emailVerified: decoded.email_verified || false,
                            sessionStateId: sessionStateId,
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
        async jwt({ token, user, session }) {
            // console.log('jwt', token, user, session);
            if (session?.user) {
                token.name = session.user.name;
                token.picture = session.user.image;
            }
            if (user) {
                if (user.emailVerified instanceof Date) {
                    token.emailVerified = true;
                } else {
                    token.emailVerified = user.emailVerified ?? false;
                }
                token.uid = user.id;
                token.sessionStateId = user.sessionStateId;
            }
            return token;
        },
        // sessionにJWTトークンからのユーザ情報を格納
        async session({ session, token }) {
            // console.log('callback session', session, token);
            session.user.emailVerified = token.emailVerified;
            session.user.uid = token.uid ?? token.sub;
            session.user.sessionStateId = token.sessionStateId;
            session.user.name = token.name;
            session.user.image = token.picture;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
