'use client';

import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { MouseEventHandler, useState } from 'react';
import Message from '@/app/components/Message';
import { auth } from '@/firebase/client';

const ForgetPassword = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultMail = searchParams.get('m');
    const [email, setEmail] = useState(defaultMail ?? '');
    const [disabled, setDisabled] = useState(false);

    const send = async () => {
        setDisabled(true);
        await sendPasswordResetEmail(auth, email);
        router.push('/signin/forget/sent');
    };

    return (
        <main className='flex min-h-screen flex-col items-center'>
            <div className='max-w-md w-full p-5'>
                <div className='my-10'>
                    <Message message='登録メールアドレスにパスワード変更メールを送信します。' />
                </div>
                <div className='my-10'>
                    <label htmlFor='email-address' className='sr-only'>
                        Email アドレス
                    </label>
                    <input
                        id='email-address'
                        name='email'
                        type='email'
                        autoComplete='email'
                        required
                        className='appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                        placeholder='Email アドレス'
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <button
                        className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-30'
                        disabled={disabled}
                        onClick={send}
                    >
                        送信
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ForgetPassword;
