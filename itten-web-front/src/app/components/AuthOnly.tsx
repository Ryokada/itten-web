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
    const { status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated' && pathname != '/signin') {
            router.push('/signin');
        }
    }, [router, pathname, status]);
    if (status === 'loading') return <p>Loading...</p>;
    if (status === 'authenticated') return children;
};

export default AuthOnly;
