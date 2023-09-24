'use client';

import type { Metadata } from 'next';
import { useForm, Controller } from 'react-hook-form';
import scheduleTypes from '../scheduleTypes';

export const metadata: Metadata = {
    title: '一天スケジュール',
    description: '一天メンバー用のスケジュールです',
};

const ScheduleAdd = () => {
    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full mx-auto'>
                <h1 className='mb-10 font-bold text-lg'>スケジュール追加</h1>
                <ScheduleForm />
            </div>
        </main>
    );
};

export default ScheduleAdd;

const ScheduleForm = () => {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<Schedule>();

    const watchIsHome = watch('isHome', true);

    const onSubmit = (data: Schedule) => {
        console.log(data);
    };

    const toDatetimeLocal = (date: Date) => {
        if (!date) return '';
        return date.toISOString().slice(0, 16);
    };

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
