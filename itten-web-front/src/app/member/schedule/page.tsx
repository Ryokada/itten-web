import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import { CollectionReference } from 'firebase-admin/firestore';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ScheduleDoc } from './schedule';
import ScheduleTypeLabel from '@/app/components/ScheduleTypeLabel';
import { dbAdmin } from '@/firebase/admin';
import locationIcon from '@public/icons/location_on.svg';
import clockIcon from '@public/icons/schedule.svg';

dayjs.locale(ja);

export const metadata: Metadata = {
    title: '一天スケジュール',
    description: '一天メンバー用のスケジュールです',
};

const Schedule = async () => {
    const schedulesCollection = dbAdmin.collection('schedules') as CollectionReference<ScheduleDoc>;
    const schedulesSnapshots = await schedulesCollection
        .orderBy('startTimestamp')
        .startAt(new Date())
        .get();

    const schedulesDocs = schedulesSnapshots.docs;

    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full mx-auto'>
                <div className='flex flex-col'>
                    {schedulesDocs.map((s) => (
                        <ScheduleRow id={s.id} schedule={s.data()} key={s.id} />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Schedule;

type ScheduleRowProps = {
    id: string;
    schedule: ScheduleDoc;
};
const ScheduleRow = ({ id, schedule }: ScheduleRowProps) => {
    const startTsDayjs = dayjs(schedule.startTimestamp.toDate());
    const endTsDayjs = dayjs(schedule.endTimestamp.toDate());

    return (
        <Link href={`/member/schedule/${id}`} className='cursor-pointer'>
            <div className='flex border-b border-slate-300 py-4 px-2'>
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
        </Link>
    );
};
