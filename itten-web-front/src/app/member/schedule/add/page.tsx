'use client';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import ScheduleForm, { ScheduleTnput } from '../ScheduleForm';
import { ScheduleDoc } from '../schedule';
import Spinner from '@/app/components/Spinner';
import { db, functions } from '@/firebase/client';

const SHOULD_NOTIFY = process.env.NEXT_PUBLIC_SHOULD_NOTIFY === 'true';

const ScheduleAdd = () => {
    const { data: session } = useSession();
    const [disabled, setDisabled] = useState(false);

    if (!session) {
        return <Spinner />;
    }

    const onSubmit = async (inputData: ScheduleTnput) => {
        setDisabled(true);
        try {
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
                helpMembers: [],
            };
            const schedulesCollection = collection(db, 'schedules');
            const deoRef = await addDoc(schedulesCollection, newSchedule);
            console.log('新しいスケジュールを作成しました。', deoRef);
            if (SHOULD_NOTIFY) {
                try {
                    const lineSendAddScheduleMessage = httpsCallable(
                        functions,
                        'lineSendAddScheduleMessage',
                    );
                    await lineSendAddScheduleMessage({ scheduleId: deoRef.id });
                } catch (e) {
                    console.error('LINE通知に失敗しました', e);
                }
            }
            // スクロールが戻らない
            // router.push('/member/schedule', { scroll: true });
            window.location.href = '/member/schedule';
        } finally {
            setDisabled(false);
        }
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
                            disabled={disabled}
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
