'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';

/**
 * ラップしたコンポーネントを認証済みユーザーのみ表示可能にするコンポーネント
 *
 * @param children
 */
const AuthOnly = ({ children }: { children: React.ReactNode }) => {
    const session = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname != '/signin' && session?.status === 'unauthenticated') {
            router.push('/signin');
        }
        if (
            pathname != '/signin' &&
            session?.status === 'authenticated' &&
            !session?.data.user.emailVerified
        ) {
            router.push('/signin');
        }
    }, [router, pathname, session, session.status]);

    if (session?.status === 'authenticated' && session?.data.user.emailVerified) return children;

    return <p>Loading...</p>;
};

export default AuthOnly;
