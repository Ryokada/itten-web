'use client';

import dayjs from 'dayjs';

import ja from 'dayjs/locale/ja';
import { DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ScheduleDoc } from '../schedule';
import scheduleTypes from '../scheduleTypes';
import ScheduleTypeLabel from '@/app/components/ScheduleTypeLabel';
import Spinner from '@/app/components/Spinner';
import { db } from '@/firebase/client';
import locationIcon from '@public/icons/location_on.svg';
import clockIcon from '@public/icons/schedule.svg';

dayjs.locale(ja);

type ScheduleViewProps = {
    params: {
        scheduleId: string;
    };
};

const ScheduleView = ({ params }: ScheduleViewProps) => {
    const [schedule, setSchedule] = useState<ScheduleDoc>();
    useEffect(() => {
        // TODO 共通化
        const docRef = doc(db, 'schedules', params.scheduleId) as DocumentReference<ScheduleDoc>;
        (async () => {
            const docSnap = await getDoc(docRef);
            const scheduleInfo = docSnap.data();
            if (scheduleInfo) {
                setSchedule(scheduleInfo);
            } else {
                throw new PageNotFoundError('schedule');
            }
        })();
    }, [params.scheduleId]);

    if (!schedule) {
        return <Spinner />;
    }

    const startTsDayjs = dayjs(schedule.startTimestamp.toDate());
    const endTsDayjs = dayjs(schedule.endTimestamp.toDate());

    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full mx-auto'>
                <div className='flex'>
                    <div className='flex flex-col justify-center items-center mr-5'>
                        <div className='text-xl leading-none'>{startTsDayjs.format('M')}月</div>
                        <div className='mb-1 text-6xl font-bold leading-none'>
                            {startTsDayjs.format('D')}
                        </div>
                        <div className=''>{startTsDayjs.format('dd')}</div>
                    </div>
                    <div className='flex flex-col'>
                        <div className='mb-2'>
                            {schedule.isConfirmed ? (
                                <p className='text-red-500'>確定</p>
                            ) : (
                                <p className='text-gray-500'>未確定</p>
                            )}
                        </div>
                        <div className='flex items-center mb-1 text-gray-700'>
                            <Image src={clockIcon} alt='' className='w-5 mr-1 fill-gray-700' />
                            <p>
                                {startTsDayjs.format('H:mm')} ~ {endTsDayjs.format('H:mm')}
                            </p>
                        </div>
                        <div className='flex items-center text-gray-700'>
                            <Image src={locationIcon} alt='' className='w-5 mr-1 fill-gray-700' />
                            <p>{schedule.placeName}</p>
                        </div>
                    </div>
                </div>
                <h1 className='text-xl my-2'>{schedule.title}</h1>
                <ScheduleTypeLabel typeId={schedule.type} />
                {schedule.vs && <div className=''>vs {schedule.vs}</div>}
                {schedule.vs && schedule.isHome ? (
                    <div className='text-sm'>{'(ホーム)'}</div>
                ) : (
                    <div className='text-sm'>{'(ビジター)'}</div>
                )}
            </div>
        </main>
    );
};

export default ScheduleView;
