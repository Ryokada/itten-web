'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { DocumentReference, doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { auth, db } from '@/firebase/client';

/**
 * ラップしたコンポーネントを認証済み管理者ユーザーのみ表示可能にするコンポーネント
 *
 * @param children
 */
const AdminOnly = ({ children }: { children: React.ReactNode }) => {
    const session = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pathname != '/signin' && session?.status === 'unauthenticated') {
            setLoading(false);
            router.push('/signin?from=' + pathname);
        }
        if (
            pathname != '/signin' &&
            session?.status === 'authenticated' &&
            !session?.data.user.emailVerified
        ) {
            setLoading(false);
            router.push('/signin?from=' + pathname);
        }

        if (session?.status === 'authenticated' && session?.data.user.emailVerified) {
            onAuthStateChanged(auth, (user) => {
                setLoading(false);
                if (user) {
                    if (!user) return;
                    const docRef = doc(db, 'members', user.uid) as DocumentReference<Member>;

                    (async () => {
                        const docSnap = await getDoc(docRef);
                        const memberInfo = docSnap.data();
                        if (memberInfo) {
                            setIsAdmin(memberInfo.role === 'admin');
                        }
                    })();
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            });
        }
    }, [router, pathname, session, session.status]);

    if (loading) {
        return (
            <div className='flex flex-col items-center min-h-screen p-24'>
                <Spinner />
            </div>
        );
    }

    if (isAdmin) {
        return <>{children}</>;
    } else {
        <div className='flex flex-col items-center min-h-screen p-24'>見ちゃだめ</div>;
    }
};

export default AdminOnly;
