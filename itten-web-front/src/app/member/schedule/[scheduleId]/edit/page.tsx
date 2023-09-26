'use client';

import { collection, Timestamp, DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
import type { Metadata } from 'next';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ScheduleForm, { ScheduleTnput } from '../../ScheduleForm';
import { ScheduleDoc } from '../../schedule';
import Spinner from '@/app/components/Spinner';
import { db } from '@/firebase/client';

export const metadata: Metadata = {
    title: '一天スケジュール',
    description: '一天メンバー用のスケジュール更新ページです',
};

type ScheduleEditProps = {
    params: {
        scheduleId: string;
    };
};

const ScheduleEdit = ({ params }: ScheduleEditProps) => {
    const { data: session } = useSession();
    const [scheduleDocRef, setScheduleDocRef] = useState<DocumentReference<ScheduleDoc>>();
    const [schedule, setSchedule] = useState<ScheduleDoc>();

    const onSubmit = async (inputData: ScheduleTnput) => {
        if (!session || !schedule || !scheduleDocRef) return;

        const newSchedule: ScheduleDoc = {
            ...schedule,
            ...inputData,
            startTimestamp: Timestamp.fromDate(inputData.startTimestamp),
            endTimestamp: Timestamp.fromDate(inputData.endTimestamp),
            isConfirmed: false,
            updatredBy: session.user.uid,
        };
        const deoRef = await setDoc(scheduleDocRef, newSchedule);
        console.log('スケジュールを更新しました。', deoRef);
        // スクロールが戻らない
        // router.push('/member/schedule', { scroll: true });
        window.location.href = `/member/schedule/${params.scheduleId}`;
    };

    useEffect(() => {
        // TODO 共通化
        const docRef = doc(db, 'schedules', params.scheduleId) as DocumentReference<ScheduleDoc>;
        setScheduleDocRef(docRef);

        (async () => {
            const docSnap = await getDoc(docRef);
            const scheduleInfo = docSnap.data();
            if (scheduleInfo) {
                setSchedule(scheduleInfo);
            } else {
                throw new PageNotFoundError('schedule-edit');
            }
        })();
    }, [params.scheduleId]);

    if (!session || !schedule) {
        return <Spinner />;
    }

    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full mx-auto'>
                <h1 className='mb-8 font-bold text-lg'>スケジュール更新</h1>
                <ScheduleForm
                    onSubmit={onSubmit}
                    cancelTo={`/member/schedule/${params.scheduleId}#top`}
                    currentSchedule={schedule}
                    enabledIsConfirmed
                    submitoBtn={
                        <button
                            type='submit'
                            className='w-1/2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600'
                        >
                            更新
                        </button>
                    }
                />
            </div>
        </main>
    );
};

export default ScheduleEdit;
