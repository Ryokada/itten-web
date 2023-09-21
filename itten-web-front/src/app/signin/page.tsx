'use client';

import { signInWithEmailAndPassword, signOut as singOutByFirebase } from 'firebase/auth';
import { signIn as signInByNextAuth, signOut as signOutByNextAuth } from 'next-auth/react';

import { useState } from 'react';
import { auth } from '@/firebase/client';

/**
 * サインイン画面
 */
const SingIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;
        if (!password) return;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            await signInByNextAuth('credentials', {
                idToken,
                callbackUrl: '/member/mypage',
            });
        } catch (e) {
            console.error(e);
            // TODO: エラーメッセージ
        }
    };

    const signOut = async () => {
        await singOutByFirebase(auth);
        signOutByNextAuth({ redirect: true, callbackUrl: '/' });
    };
    return (
        <main className='flex min-h-screen flex-col items-center'>
            <div className='max-w-md w-full space-y-8'>
                <div>
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                        ログインしてください
                    </h2>
                </div>
                <form className='mt-8 space-y-6' onSubmit={signIn}>
                    <div className='rounded-md shadow-sm -space-y-px'>
                        <div>
                            <label htmlFor='email-address' className='sr-only'>
                                Email アドレス
                            </label>
                            <input
                                id='email-address'
                                name='email'
                                type='email'
                                autoComplete='email'
                                required
                                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                                placeholder='Email アドレス'
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor='password' className='sr-only'>
                                パスワード
                            </label>
                            <input
                                id='password'
                                name='password'
                                type='password'
                                autoComplete='current-password'
                                required
                                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                                placeholder='パスワード'
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type='submit'
                            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        >
                            ログイン
                        </button>
                    </div>
                </form>

                <div>
                    <button
                        type='button'
                        className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                        onClick={() => signOut()}
                    >
                        ログアウト
                    </button>
                </div>
            </div>
        </main>
    );
};

export default SingIn;
