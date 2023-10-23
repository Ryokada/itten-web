'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { ScheduleDoc } from './schedule';
import scheduleTypes from './scheduleTypes';

export type ScheduleTnput = {
    title: string;
    placeName: string;
    startTimestamp: Date;
    endTimestamp: Date;
    type: string;
    vs?: string;
    memo: string;
    isHome: boolean;
    isConfirmed?: boolean;
    isOpened: boolean;
};

type ScheduleFormProps = {
    onSubmit: (inputData: ScheduleTnput) => Promise<void>;
    submitoBtn: ReactNode;
    shouldNotifyToggle?: ReactNode;
    cancelTo?: string;
    enabledIsConfirmed?: boolean;
    currentSchedule?: ScheduleDoc;
};

const DATETIME_LOCAL_INPUT_FORMAT = 'YYYY-MM-DDTHH:mm';

/**
 * スケジュール追加更新用のフォームです
 * @returns
 */
const ScheduleForm = ({
    onSubmit,
    submitoBtn,
    shouldNotifyToggle,
    cancelTo,
    enabledIsConfirmed = false,
    currentSchedule,
}: ScheduleFormProps) => {
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
        defaultValue: currentSchedule?.isHome ?? true,
    });

    useEffect(() => {
        if (watchIsHome) {
            setValue('isHome', watchIsHome.valueOf());
        }
    }, [watchIsHome, setValue]);

    const watchIsConfirmed = useWatch({
        control,
        name: 'isConfirmed',
        defaultValue: currentSchedule?.isConfirmed ?? false,
    });

    useEffect(() => {
        if (watchIsConfirmed) {
            setValue('isConfirmed', watchIsConfirmed.valueOf());
        }
    }, [watchIsConfirmed, setValue]);

    const watchIsOpened = useWatch({
        control,
        name: 'isOpened',
        defaultValue: currentSchedule?.isOpened ?? true, //デフォルトは公開
    });

    useEffect(() => {
        if (watchIsOpened) {
            setValue('isOpened', watchIsOpened.valueOf());
        }
    }, [watchIsOpened, setValue]);

    const watchStartTimestamp = useWatch({
        control,
        name: 'startTimestamp',
    });

    const toDatetimeLocal = (date: Date, defaultDate?: Date) => {
        if (!date) {
            return '';
        }
        return dayjs(date).format(DATETIME_LOCAL_INPUT_FORMAT);
    };

    useEffect(() => {
        if (currentSchedule) {
            setValue('startTimestamp', currentSchedule.startTimestamp.toDate());
            setValue('endTimestamp', currentSchedule.endTimestamp.toDate());
        }
    }, [currentSchedule, setValue]);

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
                <span className='mb-2 font-semibold text-gray-600'>公開</span>
                <div className='flex'>
                    <label htmlFor='isOpened' className='relative inline-block w-10 h-6 mr-5'>
                        <input
                            id='isOpened'
                            type='checkbox'
                            {...register('isOpened')}
                            className='hidden'
                        />
                        <div
                            className={`block w-12 h-6 rounded-full absolute top-0 left-0 transition ${
                                watchIsOpened ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                        />
                        <div
                            className={`block w-6 h-6 bg-white rounded-full absolute top-0 left-0 transform-gpu transition-transform duration-300 ease-in-out ${
                                watchIsOpened ? 'translate-x-full' : ''
                            }`}
                        />
                    </label>
                    <p className='text-gray-600'>{watchIsOpened ? '公開' : '未公開'}</p>
                </div>
                {errors.isOpened && (
                    <span className='text-red-500 text-xs'>{errors.isOpened.message}</span>
                )}
            </div>
            {enabledIsConfirmed && (
                <div className='flex flex-col'>
                    <span className='mb-2 font-semibold text-gray-600'>確定</span>
                    <div className='flex'>
                        <label
                            htmlFor='isConfirmed'
                            className='relative inline-block w-10 h-6 mr-5'
                        >
                            <input
                                id='isConfirmed'
                                type='checkbox'
                                {...register('isConfirmed')}
                                className='hidden'
                            />
                            <div
                                className={`block w-12 h-6 rounded-full absolute top-0 left-0 transition ${
                                    watchIsConfirmed ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            />
                            <div
                                className={`block w-6 h-6 bg-white rounded-full absolute top-0 left-0 transform-gpu transition-transform duration-300 ease-in-out ${
                                    watchIsConfirmed ? 'translate-x-full' : ''
                                }`}
                            />
                        </label>
                        <p className='text-gray-600'>{watchIsConfirmed ? '確定' : '未確定'}</p>
                    </div>
                    {errors.isConfirmed && (
                        <span className='text-red-500 text-xs'>{errors.isConfirmed.message}</span>
                    )}
                </div>
            )}
            <div className='flex flex-col'>
                <label htmlFor='title' className='mb-2 font-semibold text-gray-600'>
                    タイトル
                </label>
                <input
                    id='title'
                    {...register('title', { required: true, maxLength: 50 })}
                    className='p-2 border rounded-md'
                    defaultValue={currentSchedule?.title}
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
                    defaultValue={currentSchedule?.placeName}
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
                <select
                    id='type'
                    {...register('type')}
                    className='p-2 border rounded-md'
                    defaultValue={currentSchedule?.type}
                >
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
                <input
                    id='vs'
                    {...register('vs')}
                    className='p-2 border rounded-md'
                    defaultValue={currentSchedule?.vs}
                />
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
                            value={toDatetimeLocal(
                                field.value,
                                currentSchedule?.startTimestamp.toDate(),
                            )}
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
                            value={toDatetimeLocal(
                                field.value,
                                currentSchedule?.endTimestamp.toDate(),
                            )}
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
                    defaultValue={currentSchedule?.memo}
                />
                {errors.memo && <span className='text-red-500 text-xs'>{errors.memo.message}</span>}
            </div>

            <div className='flex w-full space-x-3'>
                <Link
                    className='w-1/2 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600 text-center cursor-pointer'
                    href={cancelTo ?? '/member/schedule'}
                >
                    キャンセル
                </Link>
                {submitoBtn}
            </div>
            {shouldNotifyToggle}
        </form>
    );
};

export default ScheduleForm;
