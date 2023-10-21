'use client';

import { Timestamp, DocumentReference, doc, getDoc, runTransaction } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ScheduleForm, { ScheduleTnput } from '../../ScheduleForm';
import { ScheduleDoc } from '../../schedule';
import Spinner from '@/app/components/Spinner';
import { db, functions } from '@/firebase/client';

const SHOULD_NOTIFY = process.env.NEXT_PUBLIC_SHOULD_NOTIFY === 'true';

type ScheduleEditProps = {
    params: {
        scheduleId: string;
    };
};

const ScheduleEdit = ({ params }: ScheduleEditProps) => {
    const router = useRouter();
    const { data: session } = useSession();
    const [member, setMember] = useState<Member>();
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
            if (SHOULD_NOTIFY) {
                try {
                    const lineSendChangeScheduleMessage = httpsCallable(
                        functions,
                        'lineSendChangeScheduleMessage',
                    );
                    await lineSendChangeScheduleMessage({ scheduleId: scheduleDocRef.id });
                } catch (e) {
                    console.error('LINE通知に失敗しました', e);
                }
            }
        });
        // スクロールが戻らない
        // router.push('/member/schedule', { scroll: true });
        window.location.href = `/member/schedule/${params.scheduleId}`;
    };

    useEffect(() => {
        if (!session) return;

        const myMemberDocRef = doc(db, 'members', session.user.uid) as DocumentReference<Member>;
        // TODO 共通化
        const scheduleDocRef = doc(
            db,
            'schedules',
            params.scheduleId,
        ) as DocumentReference<ScheduleDoc>;
        setScheduleDocRef(scheduleDocRef);

        (async () => {
            const memberDoc = await getDoc(myMemberDocRef);
            const memberInfo = memberDoc.data();

            const scheduleDoc = await getDoc(scheduleDocRef);
            const scheduleInfo = scheduleDoc.data();

            if (!memberInfo || !scheduleInfo) {
                throw new PageNotFoundError('schedule edit page not found');
            }

            // 編集ページを開けるのは作成者と管理者のみ
            if (memberInfo.id !== scheduleInfo.createdBy && memberInfo.role !== 'admin') {
                router.push(`/member/schedule/${params.scheduleId}`);
                return;
            }
            setMember(memberInfo);
            setSchedule(scheduleInfo);
        })();
    }, [params.scheduleId, router, session]);

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
