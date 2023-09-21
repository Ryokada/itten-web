'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export type SessionProviderProps = {
    children: React.ReactNode;
};

/**
 * 認証用情報の保持するセッションを利用するためのプロバイダーコンポーネント
 */
const SessionProvider = ({ children }: SessionProviderProps) => {
    return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
};

export default SessionProvider;
