'use client';

import { CollectionReference, collection, getDoc, getDocs, query } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, useWatch, Controller } from 'react-hook-form';
import { PaymentInput } from './types/paymentInput';
import { SmallSpinner } from '@/app/components/Spinner';
import { db, functions } from '@/firebase/client';

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
    const [disabled, setDisabled] = useState(false);
    const { data: session } = useSession();
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [me, setMe] = useState<Member>();

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
        setDisabled(true);
        try {
            console.log(data);

            const updateData = {
                ...data,
                paidDate: formatDate(data.paidDate),
            };

            const addPayment = httpsCallable(functions, 'accounting-addPayment');
            await addPayment(updateData);
            console.log('精算を追加しました。', updateData);
        } finally {
            setDisabled(false);
        }
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
        const membersQuery = query(collection(db, 'members')) as CollectionReference<Member>;

        (async () => {
            const membersDocs = await getDocs(membersQuery);
            const newMembers: Array<Member> = [];
            membersDocs.forEach((d) => {
                const dd = d.data();
                newMembers.push({ ...dd, id: d.id });
                // 自分だったら自分にも入れとく
                if (d.id === session.user.uid) {
                    setMe(dd);
                    setValue('paidMenberName', dd.name);
                }
            });
            setAllMembers(newMembers);
        })();
    }, [session, setValue]);

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
                <Controller
                    name='paidDate'
                    control={control}
                    rules={{ required: '日付は必須です' }}
                    render={({ field }) => (
                        <input
                            type='date'
                            min='2023-04-01'
                            value={field.value ?? ''}
                            onChange={(e) => setValue('paidDate', e.target.value ?? '')}
                            className='p-2 border rounded-md'
                        />
                    )}
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
                <textarea
                    id='description'
                    {...register('description')}
                    className='p-2 border rounded-md'
                />
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
                        valueAsNumber: true,
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
                        valueAsNumber: true,
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
                        valueAsNumber: true,
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
                        valueAsNumber: true,
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
                        valueAsNumber: true,
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
                        valueAsNumber: true,
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
                <textarea id='remarks' {...register('remarks')} className='p-2 border rounded-md' />
            </div>

            <div className='flex flex-col'>
                <label htmlFor='paidMenberName' className='mb-2 font-semibold text-gray-600'>
                    建て替えた人:
                </label>
                <select
                    id='paidMenberName'
                    {...register('paidMenberName', { required: '建て替えた人は必須です' })}
                    className='p-2 border rounded-md'
                    value={me?.name}
                >
                    {allMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                            {member.name}
                        </option>
                    ))}
                </select>
                {errors.paidMenberName && (
                    <p className='text-red-500 text-xs'>{errors.paidMenberName.message}</p>
                )}
            </div>

            <button
                type='submit'
                className='mt-10 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                disabled={disabled}
            >
                {disabled ? <SmallSpinner color='border-white-900' /> : '登録'}
            </button>
        </form>
    );
};

const formatDate = (value: string) => {
    return value.split('-').join('/');
};

export default AddPaymentsPage;
