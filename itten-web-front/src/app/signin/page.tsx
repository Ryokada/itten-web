'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn as signInByNextAuth, useSession } from 'next-auth/react';

import { useEffect, useState } from 'react';
import Message from '../components/Message';
import { auth } from '@/firebase/client';

/**
 * サインイン画面
 */
const SingIn = () => {
    const session = useSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [message, setMessage] = useState<string>('');
    const router = useRouter();

    const searchParams = useSearchParams();

    const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;
        if (!password) return;

        setDisabled(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                setMessage('メールアドレスを確認してください');
                return;
            }
            const fromPatn = searchParams.get('from');
            const idToken = await userCredential.user.getIdToken();
            await signInByNextAuth('credentials', {
                idToken,
                callbackUrl: fromPatn ?? '/member/mypage',
            });
        } catch (e) {
            console.error(e);
            setMessage('ログインに失敗しました');
        } finally {
            setDisabled(false);
        }
    };

    useEffect(() => {
        if (!session) return;
        if (session?.status === 'authenticated' && session?.data.user.emailVerified) {
            const fromPatn = searchParams.get('from');
            router.push(fromPatn ?? '/member/mypage');
        }
    }, [session]);

    return (
        <main className='flex min-h-screen flex-col items-center'>
            <div className='max-w-xs w-full space-y-8'>
                <div>
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                        ログインしてください
                    </h2>
                </div>
                {message && (
                    <div className='mb-3'>
                        <Message message={message} />
                    </div>
                )}
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
                            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-30'
                            disabled={disabled}
                        >
                            ログイン
                        </button>
                    </div>

                    <div className='mt-6 text-center text-gray-900'>
                        <a href='/signin/forget'>{`パスワード忘れた>`}</a>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default SingIn;
