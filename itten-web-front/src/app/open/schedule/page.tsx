import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import Image from 'next/image';
import ScheduleTypeLabel from '@/app/components/ScheduleTypeLabel';
import Spinner from '@/app/components/Spinner';
import { ScheduleDoc } from '@/app/member/schedule/schedule';
import { dbAdmin } from '@/firebase/admin';
import locationIcon from '@public/icons/location_on.svg';
import clockIcon from '@public/icons/schedule.svg';

dayjs.locale(ja);

const OpenSchedule = async () => {
    const schedulesSnapshots = await dbAdmin.collection('schedules')
        .where('startTimestamp', '>=', new Date())
        .orderBy('startTimestamp')
        .get();

    const openSchedulesDocs = schedulesSnapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as ScheduleDoc
    }));

    if (!openSchedulesDocs) {
        return (
            <main className='flex flex-col items-center min-h-screen p-24'>
                <Spinner />
            </main>
        );
    }

    if (openSchedulesDocs.length === 0) {
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
                    {openSchedulesDocs.map((schedule) => (
                        <ScheduleRow
                            id={schedule.id}
                            schedule={schedule}
                            key={schedule.id}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default OpenSchedule;

type ScheduleRowProps = {
    id: string;
    schedule: ScheduleDoc;
};
const ScheduleRow = ({ id, schedule }: ScheduleRowProps) => {
    const startTsDayjs = dayjs(schedule.startTimestamp.toDate());
    const endTsDayjs = dayjs(schedule.endTimestamp.toDate());

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
