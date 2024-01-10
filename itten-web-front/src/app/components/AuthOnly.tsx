'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { auth } from '@/firebase/client';

import { signOut as signOutByNextAuth } from 'next-auth/react';

/**
 * ラップしたコンポーネントを認証済みユーザーのみ表示可能にするコンポーネント
 *
 * @param children
 */
const AuthOnly = ({ children }: { children: React.ReactNode }) => {
    const session = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        if (!session) {
            return;
        }
        if (session?.status === 'loading') return;
        if (
            pathname != '/signin' &&
            session?.status === 'authenticated' &&
            !session?.data.user.emailVerified
        ) {
            router.push('/signin?from=' + pathname);
        }

        if (session?.status === 'authenticated' && session?.data.user.emailVerified) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    if (!user) return;
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                    signOutByNextAuth({ redirect: true, callbackUrl: '/' }).finally(() =>
                        router.push('/signin'),
                    );
                }
            });
        }

        if (pathname != '/signin' && session?.status === 'unauthenticated') {
            router.push('/signin?from=' + pathname);
        }
    }, [router, pathname, session]);

    if (authenticated) {
        return <>{children}</>;
    } else {
        return (
            <div className='flex flex-col items-center min-h-screen p-24'>
                <Spinner />
            </div>
        );
    }
};

export default AuthOnly;
