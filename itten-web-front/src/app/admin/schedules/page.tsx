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
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ScheduleList from '@/app/components/Schedules/ScheduleList';
import ScheduleTypeLabel from '@/app/components/Schedules/ScheduleTypeLabel';
import { ScheduleDoc, getScheduleState } from '@/app/components/Schedules/schedule';
import Spinner from '@/app/components/Spinner';
import { db } from '@/firebase/client';
import locationIcon from '@public/icons/location_on.svg';
import peoplesIcon from '@public/icons/peoples.svg';
import clockIcon from '@public/icons/schedule.svg';

dayjs.locale(ja);

const AdminSchedule = () => {
    const [schedulesDocs, setSchedulesDocs] = useState<QueryDocumentSnapshot<ScheduleDoc>[]>();

    useEffect(() => {
        const now = new Date();
        const nowYear1_1 = new Date(now.getFullYear(), 0, 1);

        const q = query(
            collection(db, 'schedules'),
            where('startTimestamp', '>=', nowYear1_1),
            orderBy('startTimestamp', 'desc'),
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
                <ScheduleList schedulesDocs={schedulesDocs} />
            </div>
        </main>
    );
};

export default AdminSchedule;

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
        <Link
            href={`/member/schedule/${id}`}
            className='cursor-pointer'
            target='_blank'
            rel='noopener noreferrer'
        >
            <div className='border-b border-slate-300 py-4 px-2'>
                <div className='flex mb-1.5' id={id}>
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
                            <Image src={peoplesIcon} alt='' className='w-5 mr-1 fill-gray-700' />
                            <div className='flex space-x-1'>
                                <p>{`(出)${schedule.okMembers.length}`}</p>
                                <p>{`(助)${schedule.helpMembers?.length ?? 0}`}</p>
                                <p>{`(欠)${schedule.ngMembers.length}`}</p>
                                <p>{`(保)${schedule.holdMembers.length}`}</p>
                            </div>
                        </div>
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
                <div className='flex mx-2 text-sm itmes-center'>
                    <span>自分の回答:</span>
                    <div className='mx-2'>
                        {myStatus?.state === 'ok' && (
                            <span className='px-2 py-0.5 rounded text-white bg-indigo-600'>
                                参加
                            </span>
                        )}
                        {myStatus?.state === 'ng' && (
                            <span className='px-2 py-0.5 rounded text-white bg-rose-600'>
                                不参加
                            </span>
                        )}
                        {myStatus?.state === 'hold' && (
                            <span className='px-2 py-0.5 rounded text-white bg-teal-600'>保留</span>
                        )}
                        {!myStatus && <span className='text-gray-600'>未回答</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
};
