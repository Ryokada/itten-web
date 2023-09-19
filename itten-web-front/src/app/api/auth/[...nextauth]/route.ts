import NextAuth from 'next-auth'
import type { NextAuthOptions, User } from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'

import { auth } from '@/firebase/admin'

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
                        const decoded = await auth.verifyIdToken(credentials?.idToken)

                        return {
                            id: decoded.uid,
                            name: decoded.name || '', // nameが存在しない場合はデフォルト値を使用
                            email: decoded.emailVerified || decoded.email || '',
                            image: decoded.picture || '', // pictureが存在しない場合はデフォルト値を使用
                            emailVerified: decoded.emailVerified || false,
                            // 他の必要なプロパティもこちらに追加します
                        }
                    } catch (err) {
                        console.error(err)
                    }
                }
                return null
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            return token
        },
        // sessionにJWTトークンからのユーザ情報を格納
        async session({ session, token }) {
            session.user.emailVerified = token.emailVerified
            session.user.uid = token.uid
            return session
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
