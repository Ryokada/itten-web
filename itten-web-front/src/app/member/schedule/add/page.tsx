'use client';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import ScheduleForm, { ScheduleTnput } from '../ScheduleForm';
import { ScheduleDoc } from '../schedule';
import Spinner from '@/app/components/Spinner';
import { db } from '@/firebase/client';

const ScheduleAdd = () => {
    const { data: session } = useSession();
    if (!session) {
        return <Spinner />;
    }

    const onSubmit = async (inputData: ScheduleTnput) => {
        const newSchedule: ScheduleDoc = {
            ...inputData,
            startTimestamp: Timestamp.fromDate(inputData.startTimestamp),
            endTimestamp: Timestamp.fromDate(inputData.endTimestamp),
            isConfirmed: false,
            createdBy: session.user.uid,
            updatredBy: session.user.uid,
            okMembers: [],
            ngMembers: [],
            holdMembers: [],
        };
        const schedulesCollection = collection(db, 'schedules');
        const deoRef = await addDoc(schedulesCollection, newSchedule);
        console.log('新しいスケジュールを作成しました。', deoRef);
        // スクロールが戻らない
        // router.push('/member/schedule', { scroll: true });
        window.location.href = '/member/schedule';
    };

    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full mx-auto'>
                <h1 className='mb-8 font-bold text-lg'>スケジュール追加</h1>
                <ScheduleForm
                    onSubmit={onSubmit}
                    submitoBtn={
                        <button
                            type='submit'
                            className='w-1/2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                        >
                            作成
                        </button>
                    }
                />
            </div>
        </main>
    );
};

export default ScheduleAdd;
