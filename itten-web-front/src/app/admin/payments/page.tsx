'use client';

import { CollectionReference, collection, getDoc, getDocs, query } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, useWatch, Controller } from 'react-hook-form';
import { PaymentInput } from './types/paymentInput';
import { db } from '@/firebase/client';

const AddPaymentsPage = () => {
    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            <h1 className='mb-8 text-xl font-bold'>精算追加ページ</h1>
            <div className='max-w-xl w-full mx-auto'>
                <PaymentForm />
            </div>
        </main>
    );
};

const PaymentForm = () => {
    const { data: session } = useSession();
    const [allMembers, setAllMembers] = useState<Member[]>([]);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<PaymentInput>({
        defaultValues: {
            participationFeeIncome: 0,
            fromVsTeamIncome: 0,
            otherIncome: 0,
            groundFeeExpenses: 0,
            umpirFeeExpenses: 0,
            otherExpenses: 0,
        },
    });
    const onSubmit: SubmitHandler<PaymentInput> = async (data) => {
        // ここに送信ロジックを実装
        console.log(data);
    };

    const watchPaid = useWatch({
        control,
        name: 'paid',
        defaultValue: false,
    });

    useEffect(() => {
        if (watchPaid) {
            setValue('paid', watchPaid.valueOf());
        }
    }, [watchPaid, setValue]);

    useEffect(() => {
        if (!session) return;
        // TODO 共通化
        const membersQuery = query(collection(db, 'members')) as CollectionReference<Member>;

        (async () => {
            const membersDocs = await getDocs(membersQuery);
            const newMembers: Array<Member> = [];
            membersDocs.forEach((d) => {
                newMembers.push({ ...d.data(), id: d.id });
            });
            setAllMembers(newMembers);
        })();
    }, [session]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='p-4 space-y-4 bg-gray-100'>
            {/* 精算済み */}
            <div className='flex flex-col'>
                <span className='mb-2 font-semibold text-gray-600'>精算済み:</span>
                <div className='flex'>
                    <label htmlFor='paid' className='relative inline-block w-10 h-6 mr-5'>
                        <input id='paid' type='checkbox' {...register('paid')} className='hidden' />
                        <div
                            className={`block w-12 h-6 rounded-full absolute top-0 left-0 transition ${
                                watchPaid ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                        />
                        <div
                            className={`block w-6 h-6 bg-white rounded-full absolute top-0 left-0 transform-gpu transition-transform duration-300 ease-in-out ${
                                watchPaid ? 'translate-x-full' : ''
                            }`}
                        />
                    </label>
                    <p className='text-gray-600'>{watchPaid ? '精算済み' : '未精算'}</p>
                </div>
            </div>

            {/* 精算日 */}
            <div className='flex flex-col'>
                <label htmlFor='paidDate' className='mb-2 font-semibold text-gray-600'>
                    日付 (YYYY/MM/DD):
                </label>
                <input
                    id='paidDate'
                    type='text'
                    {...register('paidDate', { required: '日付は必須です' })}
                    className='p-2 border rounded-md'
                />
                {errors.paidDate && (
                    <p className='text-red-500 text-xs'>{errors.paidDate.message}</p>
                )}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='type' className='mb-2 font-semibold text-gray-600'>
                    タイプ:
                </label>
                <select
                    id='type'
                    {...register('type', { required: 'タイプは必須です' })}
                    className='p-2 border rounded-md'
                >
                    <option value='試合'>試合</option>
                    <option value='練習'>練習</option>
                    <option value='その他'>その他</option>
                </select>
                {errors.type && <p className='text-red-500 text-xs'>{errors.type.message}</p>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='description' className='mb-2 font-semibold text-gray-600'>
                    内容:
                </label>
                <textarea id='description' {...register('description')} />
            </div>
            <div className='flex flex-col'>
                <label
                    htmlFor='participationFeeIncome'
                    className='mb-2 font-semibold text-gray-600'
                >
                    参加費(円):
                </label>
                <input
                    id='participationFeeIncome'
                    type='number'
                    min='0'
                    {...register('participationFeeIncome', {
                        min: { value: 0, message: '0以上の値を入力してください' },
                    })}
                    className='p-2 border rounded-md'
                />
                {errors.participationFeeIncome && (
                    <p className='text-red-500 text-xs'>{errors.participationFeeIncome.message}</p>
                )}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='fromVsTeamIncome' className='mb-2 font-semibold text-gray-600'>
                    相手チームから(円):
                </label>
                <input
                    id='fromVsTeamIncome'
                    type='number'
                    min='0'
                    {...register('fromVsTeamIncome', {
                        min: { value: 0, message: '0以上の値を入力してください' },
                    })}
                    className='p-2 border rounded-md'
                />
                {errors.fromVsTeamIncome && (
                    <p className='text-red-500 text-xs'>{errors.fromVsTeamIncome.message}</p>
                )}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='otherIncome' className='mb-2 font-semibold text-gray-600'>
                    その他収入(円):
                </label>
                <input
                    id='otherIncome'
                    type='number'
                    min='0'
                    {...register('otherIncome', {
                        min: { value: 0, message: '0以上の値を入力してください' },
                    })}
                    className='p-2 border rounded-md'
                />
                {errors.otherIncome && (
                    <p className='text-red-500 text-xs'>{errors.otherIncome.message}</p>
                )}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='groundFeeExpenses' className='mb-2 font-semibold text-gray-600'>
                    場代(円):
                </label>
                <input
                    id='groundFeeExpenses'
                    type='number'
                    min='0'
                    {...register('groundFeeExpenses', {
                        min: { value: 0, message: '0以上の値を入力してください' },
                    })}
                    className='p-2 border rounded-md'
                />
                {errors.groundFeeExpenses && (
                    <p className='text-red-500 text-xs'>{errors.groundFeeExpenses.message}</p>
                )}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='umpirFeeExpenses' className='mb-2 font-semibold text-gray-600'>
                    審判代(円):
                </label>
                <input
                    id='umpirFeeExpenses'
                    type='number'
                    min='0'
                    {...register('umpirFeeExpenses', {
                        min: { value: 0, message: '0以上の値を入力してください' },
                    })}
                    className='p-2 border rounded-md'
                />
                {errors.umpirFeeExpenses && (
                    <p className='text-red-500 text-xs'>{errors.umpirFeeExpenses.message}</p>
                )}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='otherExpenses' className='mb-2 font-semibold text-gray-600'>
                    その他支出(円):
                </label>
                <input
                    id='otherExpenses'
                    type='number'
                    min='0'
                    {...register('otherExpenses', {
                        min: { value: 0, message: '0以上の値を入力してください' },
                    })}
                    className='p-2 border rounded-md'
                />
                {errors.otherExpenses && (
                    <p className='text-red-500 text-xs'>{errors.otherExpenses.message}</p>
                )}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='remarks' className='mb-2 font-semibold text-gray-600'>
                    備考:
                </label>
                <textarea id='remarks' {...register('remarks')} />
            </div>

            <div className='flex flex-col'>
                <label htmlFor='paidMenberName' className='mb-2 font-semibold text-gray-600'>
                    建て替えた人:
                </label>
                <select
                    id='typpaidMenberNamee'
                    {...register('paidMenberName', { required: '建て替えた人は必須です' })}
                    className='p-2 border rounded-md'
                >
                    {allMembers.map((member) => {
                        if (member.id === session?.user.uid) {
                            return (
                                <option key={member.id} value={member.name} selected>
                                    {member.name}
                                </option>
                            );
                        }

                        return (
                            <option key={member.id} value={member.name}>
                                {member.name}
                            </option>
                        );
                    })}
                </select>
                {errors.paidMenberName && (
                    <p className='text-red-500 text-xs'>{errors.paidMenberName.message}</p>
                )}
            </div>

            <button
                type='submit'
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
                送信
            </button>
        </form>
    );
};

export default AddPaymentsPage;
