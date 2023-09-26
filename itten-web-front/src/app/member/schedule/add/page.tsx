'use client';

import dayjs from 'dayjs';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import scheduleTypes from '../scheduleTypes';
import Spinner from '@/app/components/Spinner';
import { db } from '@/firebase/client';

export const metadata: Metadata = {
    title: '一天スケジュール',
    description: '一天メンバー用のスケジュールです',
};

const ScheduleAdd = () => {
    const { data: session } = useSession();
    if (!session) {
        return <Spinner />;
    }

    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full mx-auto'>
                <h1 className='mb-10 font-bold text-lg'>スケジュール追加</h1>
                <ScheduleForm userId={session.user.uid} />
            </div>
        </main>
    );
};

export default ScheduleAdd;

type ScheduleTnput = {
    title: string;
    placeName: string;
    startTimestamp: Date;
    endTimestamp: Date;
    type: string;
    vs?: string;
    memo: string;
    isHome: boolean;
};

type ScheduleFormProps = {
    userId: string;
};
const ScheduleForm = ({ userId }: ScheduleFormProps) => {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<ScheduleTnput>();

    const watchIsHome = useWatch({
        control,
        name: 'isHome',
        defaultValue: true,
    });

    const watchStartTimestamp = useWatch({
        control,
        name: 'startTimestamp',
    });

    const onSubmit = async (inputData: ScheduleTnput) => {
        const newSchedule = {
            ...inputData,
            startTimestamp: Timestamp.fromDate(inputData.startTimestamp),
            endTimestamp: Timestamp.fromDate(inputData.endTimestamp),
            isConfirmed: false,
            createdBy: userId,
            updatredBy: userId,
        };
        const schedulesCollection = collection(db, 'schedules');
        const deoRef = await addDoc(schedulesCollection, newSchedule);
        console.log('新しいスケジュールを作成しました。', deoRef);
        // スクロールが戻らない
        // router.push('/member/schedule', { scroll: true });
        window.location.href = '/member/schedule';
    };

    const toDatetimeLocal = (date: Date) => {
        if (!date) return '';
        return dayjs(date).format('YYYY-MM-DDTHH:mm');
    };

    /**
     * 開始時刻の入力後、終了時刻を自動的に入力サポート
     */
    useEffect(() => {
        if (!watchStartTimestamp) return;

        let intarval = 2;
        const end = getValues('endTimestamp');
        if (end) {
            intarval = end.getHours() - watchStartTimestamp.getHours();
            if (intarval < 0) {
                intarval = 2;
            }
        }
        const startDate = new Date(watchStartTimestamp);
        startDate.setHours(startDate.getHours() + intarval);
        setValue('endTimestamp', startDate);
    }, [watchStartTimestamp, setValue, getValues]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='p-4 space-y-4 bg-gray-100'>
            <div className='flex flex-col'>
                <label htmlFor='title' className='mb-2 font-semibold text-gray-600'>
                    タイトル
                </label>
                <input
                    id='title'
                    {...register('title', { required: true, maxLength: 50 })}
                    className='p-2 border rounded-md'
                />
                {errors.title && <span className='text-red-500 text-xs'>必須です</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='placeName' className='mb-2 font-semibold text-gray-600'>
                    場所
                </label>
                <input
                    id='placeName'
                    {...register('placeName', { required: true, maxLength: 100 })}
                    className='p-2 border rounded-md'
                />
                {errors.placeName && <span className='text-red-500 text-xs'>必須です</span>}
            </div>

            <div className='flex flex-col'>
                <span className='mb-2 font-semibold text-gray-600'>ホームかどうか</span>
                <div className='flex'>
                    <label htmlFor='isHome' className='relative inline-block w-10 h-6 mr-5'>
                        <input
                            id='isHome'
                            type='checkbox'
                            {...register('isHome')}
                            className='hidden'
                        />
                        <div
                            className={`block w-12 h-6 rounded-full absolute top-0 left-0 transition ${
                                watchIsHome ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                        />
                        <div
                            className={`block w-6 h-6 bg-white rounded-full absolute top-0 left-0 transform-gpu transition-transform duration-300 ease-in-out ${
                                watchIsHome ? 'translate-x-full' : ''
                            }`}
                        />
                    </label>
                    <p className='text-gray-600'>{watchIsHome ? 'ホーム' : 'ビジター'}</p>
                </div>
                {errors.memo && <span className='text-red-500 text-xs'>必須です</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='type' className='mb-2 font-semibold text-gray-600'>
                    種類
                </label>
                <select id='type' {...register('type')} className='p-2 border rounded-md'>
                    {Object.entries(scheduleTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value}
                        </option>
                    ))}
                </select>
                {errors.type && <span className='text-red-500 text-xs'>必須です</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='vs' className='mb-2 font-semibold text-gray-600'>
                    対戦相手
                </label>
                <input id='vs' {...register('vs')} className='p-2 border rounded-md' />
            </div>

            <div className='flex flex-col'>
                <label htmlFor='startTimestamp' className='mb-2 font-semibold text-gray-600'>
                    開始日時
                </label>
                <Controller
                    name='startTimestamp'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <input
                            type='datetime-local'
                            min='2023-04-01T00:00'
                            value={toDatetimeLocal(field.value)}
                            onChange={(e) => setValue('startTimestamp', new Date(e.target.value))}
                            className='p-2 border rounded-md'
                        />
                    )}
                />
                {errors.startTimestamp && <span className='text-red-500 text-xs'>必須です</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='endTimestamp' className='mb-2 font-semibold text-gray-600'>
                    終了日時
                </label>
                <Controller
                    name='endTimestamp'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <input
                            type='datetime-local'
                            min='2023-04-01T00:00'
                            value={toDatetimeLocal(field.value)}
                            onChange={(e) => setValue('endTimestamp', new Date(e.target.value))}
                            className='p-2 border rounded-md'
                        />
                    )}
                />
                {errors.endTimestamp && <span className='text-red-500 text-xs'>必須です</span>}
            </div>

            <div className='flex flex-col'>
                <label htmlFor='memo' className='mb-2 font-semibold text-gray-600'>
                    メモ
                </label>
                <textarea
                    id='memo'
                    rows={5}
                    {...register('memo', { maxLength: 500 })}
                    className='p-2 border rounded-md'
                />
                {errors.memo && <span className='text-red-500 text-xs'>{errors.memo.message}</span>}
            </div>

            <div className='flex w-full space-x-3'>
                <a
                    className='w-1/2 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600 text-center cursor-pointer'
                    href='/'
                >
                    キャンセル
                </a>
                <button
                    type='submit'
                    className='w-1/2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                >
                    作成
                </button>
            </div>
        </form>
    );
};
