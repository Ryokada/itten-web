import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            // Firebaseの認証情報
            uid: string;
            emailVerified?: boolean;
        } & DefaultSession['user'];
    }
    interface User extends DefaultUser {
        uid: string;
        emailVerified?: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        // Firebaseの認証情報
        uid: string;
        emailVerified: boolean;
    }
}
