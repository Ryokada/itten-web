'use client';

import {
    Timestamp,
    DocumentReference,
    doc,
    getDoc,
    setDoc,
    runTransaction,
} from 'firebase/firestore';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ScheduleForm, { ScheduleTnput } from '../../ScheduleForm';
import { ScheduleDoc } from '../../schedule';
import Spinner from '@/app/components/Spinner';
import { db } from '@/firebase/client';

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

        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(scheduleDocRef);
            if (!sfDoc.exists()) {
                throw Error('Document does not exist!');
            }

            const updateTarget = sfDoc.data();

            const newSchedule: ScheduleDoc = {
                ...updateTarget,
                ...inputData,
                startTimestamp: Timestamp.fromDate(inputData.startTimestamp),
                endTimestamp: Timestamp.fromDate(inputData.endTimestamp),
                isConfirmed: false,
                updatredBy: session.user.uid,
            };
            transaction.update(scheduleDocRef, newSchedule);
            console.log('スケジュールを更新しました。', newSchedule);
        });
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
