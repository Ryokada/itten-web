'use client';

import { signOut as singOutByFirebase } from 'firebase/auth';
import { signOut as signOutByNextAuth } from 'next-auth/react';

import { useState } from 'react';
import AuthOnly from '../components/AuthOnly';
import { auth } from '@/firebase/client';

/**
 * サインアウト画面
 */
const SingOut = () => {
    const [disabled, setDisabled] = useState(false);

    const signOut = async () => {
        setDisabled(true);
        try {
            await singOutByFirebase(auth);
            await signOutByNextAuth({ redirect: true, callbackUrl: '/' });
        } finally {
            setDisabled(false);
        }
    };
    return (
        <AuthOnly>
            <main className='flex min-h-screen flex-col items-center'>
                <div className='max-w-xs w-full space-y-8'>
                    <div className='my-10'>
                        <button
                            type='button'
                            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-30'
                            onClick={() => signOut()}
                            disabled={disabled}
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </main>
        </AuthOnly>
    );
};

export default SingOut;
