'use client';

import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Message from '../components/Message';
import { auth, db } from '@/firebase/client';

type SignUpInput = {
    email: string;
    emailC: string;
    password: string;
    passwordC: string;
    name: string;
    number: string;
};

const SignUp = () => {
    const router = useRouter();
    const [origin, setOringin] = useState<string>();
    const [disabled, setDisabled] = useState(false);
    const [message, setMessage] = useState<string>('');
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<SignUpInput>();

    const signUp = async (data: SignUpInput) => {
        setDisabled(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password,
            );
            const docRef = doc(db, 'members', userCredential.user.uid) as DocumentReference<Member>;
            await setDoc(docRef, {
                id: userCredential.user.uid,
                email: userCredential.user.email ?? data.email,
                name: data.name,
                number: data.number,
                desiredPositions: [],
                role: 'member',
            });
            await sendEmailVerification(userCredential.user, { url: `${origin}/signup/compleate` });
            setMessage('アカウント作成しました');
            window.location.href = '/signup/sent';
        } catch (e) {
            console.error('アカウント作成処理で失敗しました', e);
            if (e instanceof FirebaseError) {
                if (e.code.startsWith('auth/email-already-in-use')) {
                    setMessage('指定したアドレスは登録済みです');
                    return;
                }
            }
            setMessage('アカウント作成処理で失敗しました');
        } finally {
            setDisabled(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const url = new URL(document.URL);
        console.log(url.origin.toString());
        setOringin(url.origin.toString());
    }, []);

    return (
        <main className='flex min-h-screen flex-col items-center'>
            <div className='max-w-md w-full'>
                <div>
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                        アカウント作成
                    </h2>
                </div>
                {message && (
                    <div className='m-3'>
                        <Message message={message} />
                    </div>
                )}
                <form onSubmit={handleSubmit(signUp)} className='p-2'>
                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='name'
                        >
                            名前
                        </label>
                        <input
                            type='text'
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            {...register('name', { required: true, maxLength: 50 })}
                        />
                        {errors.name && <span className='text-red-500 text-xs'>必須です</span>}
                    </div>

                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='number'
                        >
                            背番号
                        </label>
                        <input
                            type='text'
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            {...register('number', { required: true, maxLength: 3 })}
                        />
                        {errors.number && <span className='text-red-500 text-xs'>必須です</span>}
                    </div>

                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='email'
                        >
                            メールアドレス
                        </label>
                        <input
                            type='email'
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            {...register('email', { required: true, maxLength: 300 })}
                        />
                        {errors.email && (
                            <span className='text-red-500 text-xs'>{errors.email.message}</span>
                        )}
                    </div>
                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='emailC'
                        >
                            メールアドレス（確認）
                        </label>
                        <input
                            type='email'
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            {...register('emailC', {
                                required: true,
                                maxLength: 300,
                                validate: () =>
                                    getValues('email') === getValues('emailC') ||
                                    'メールアドレスが一致しません',
                            })}
                        />
                        {errors.emailC && (
                            <span className='text-red-500 text-xs'>{errors.emailC.message}</span>
                        )}
                    </div>

                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='password'
                        >
                            パスワード
                        </label>
                        <input
                            type='password'
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            {...register('password', { required: true, maxLength: 50 })}
                        />
                        {errors.password && (
                            <span className='text-red-500 text-xs'>{errors.password.message}</span>
                        )}
                    </div>

                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='passwordC'
                        >
                            パスワード（確認）
                        </label>
                        <input
                            type='password'
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            {...register('passwordC', {
                                required: true,
                                maxLength: 50,
                                validate: () =>
                                    getValues('password') === getValues('passwordC') ||
                                    'パスワードが一致しません',
                            })}
                        />
                        {errors.passwordC && (
                            <span className='text-red-500 text-xs'>{errors.passwordC.message}</span>
                        )}
                    </div>

                    <button
                        type='submit'
                        disabled={disabled}
                        className='mt-5 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-30'
                    >
                        アカウント作成
                    </button>
                </form>
            </div>
        </main>
    );
};

export default SignUp;
