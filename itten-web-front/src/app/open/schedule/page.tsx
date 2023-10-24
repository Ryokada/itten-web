'use client';

import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ScheduleTypeLabel from '@/app/components/ScheduleTypeLabel';
import Spinner from '@/app/components/Spinner';
import { ScheduleDoc, getScheduleState } from '@/app/member/schedule/schedule';
import { db } from '@/firebase/client';
import locationIcon from '@public/icons/location_on.svg';
import clockIcon from '@public/icons/schedule.svg';

dayjs.locale(ja);

const OpenSchedule = () => {
    const { data: session } = useSession();
    const [schedulesDocs, setSchedulesDocs] = useState<QueryDocumentSnapshot<ScheduleDoc>[]>();

    useEffect(() => {
        const q = query(
            collection(db, 'schedules'),
            where('startTimestamp', '>=', new Date()),
            orderBy('startTimestamp'),
        );
        (async () => {
            const schedulesSnapshots = await getDocs(q);
            const sDocs = schedulesSnapshots.docs as QueryDocumentSnapshot<ScheduleDoc>[];
            setSchedulesDocs(sDocs);
        })();
    }, []);

    if (!schedulesDocs) {
        return (
            <main className='flex flex-col items-center min-h-screen p-24'>
                <Spinner />
            </main>
        );
    }

    if (schedulesDocs.length === 0) {
        return (
            <main className='flex flex-col items-center min-h-screen py-5 px-10'>
                <div className='max-w-xl w-full space-y-5'>
                    <div className='text-center'>
                        <p className='text-xl'>スケジュールはありません</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full mx-auto'>
                <div className='flex flex-col'>
                    {schedulesDocs.map((s) => (
                        <ScheduleRow
                            meId={session?.user.uid || ''}
                            id={s.id}
                            schedule={s.data()}
                            key={s.id}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default OpenSchedule;

type ScheduleRowProps = {
    meId: string;
    id: string;
    schedule: ScheduleDoc;
};
const ScheduleRow = ({ meId, id, schedule }: ScheduleRowProps) => {
    const startTsDayjs = dayjs(schedule.startTimestamp.toDate());
    const endTsDayjs = dayjs(schedule.endTimestamp.toDate());

    const myStatus = getScheduleState(schedule, meId);

    return (
        <div className='border-b border-slate-300 py-2 px-2'>
            <div className='flex' id={id}>
                <div className='flex flex-col justify-center items-center mr-5'>
                    <div className='mb-1 rounded-full bg-white w-12 h-12 p-1 text-center leading-10 font-bold'>
                        {startTsDayjs.format('M/D')}
                    </div>
                    <div className=''>{startTsDayjs.format('dd')}</div>
                </div>
                <div>
                    <div className='mt-2 text-sm'>
                        {schedule.isConfirmed ? (
                            <p className='text-red-500'>確定</p>
                        ) : (
                            <p className='text-gray-500'>未確定</p>
                        )}
                    </div>
                    <h3 className='mb-1 line-clamp-2'>{schedule.title}</h3>
                    <ScheduleTypeLabel typeId={schedule.type} />
                    <div className='flex items-center mb-1 text-sm text-gray-700'>
                        <Image src={clockIcon} alt='' className='w-5 mr-1 fill-gray-700' />
                        <p>
                            {startTsDayjs.format('H:mm')} ~ {endTsDayjs.format('H:mm')}
                        </p>
                    </div>
                    <div className='flex items-center text-sm text-gray-700'>
                        <Image src={locationIcon} alt='' className='w-5 mr-1 fill-gray-700' />
                        <p>{schedule.placeName}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
