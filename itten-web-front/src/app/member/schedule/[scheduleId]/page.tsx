'use client';

import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import { DocumentReference, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ScheduleDoc, scheduledMember } from '../schedule';
import Message from '@/app/components/Message';
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
    const { data: session } = useSession();
    const [scheduleDocRef, setScheduleDocRef] = useState<DocumentReference<ScheduleDoc>>();
    const [schedule, setSchedule] = useState<ScheduleDoc>();
    const [message, setMessage] = useState<string>('');
    const [disabledAttendance, setDisabledAttendance] = useState(false);
    const [disabledAbsence, setDisabledAbsence] = useState(false);
    const [disabledHold, setDisabledHold] = useState(false);

    const registAttendance = async () => {
        if (!scheduleDocRef || !schedule || !session) return;

        const now = new Date();
        setDisabledAttendance(true);
        try {
            const myMemberDocRef = doc(
                db,
                'members',
                session.user.uid,
            ) as DocumentReference<Member>;
            let myMemberInfo: Member | undefined;
            if (!session.user.name || !session.user.image) {
                const myMemberDocSnap = await getDoc(myMemberDocRef);
                myMemberInfo = myMemberDocSnap.data();
            }

            const attendanse: scheduledMember = {
                ref: myMemberDocRef,
                id: session.user.uid,
                name: session.user.name ?? myMemberInfo?.name ?? '不明',
                imageUrl: session.user.image ?? myMemberInfo?.imageUrl,
                createdAt: Timestamp.fromDate(now),
                updatedAt: Timestamp.fromDate(now),
            };

            const newSchedule: ScheduleDoc = {
                ...schedule,
                okMembers: [...schedule.okMembers, attendanse],
            };
            const setDecRef = await setDoc(scheduleDocRef, newSchedule);
            console.log('参加にしました。', setDecRef);
            setMessage('「出席」登録しました。');
        } finally {
            setDisabledAttendance(false);
        }
    };

    const registAbsence = async () => {
        if (!scheduleDocRef || !schedule || !session) return;

        const now = new Date();
        setDisabledAbsence(true);
        try {
            const myMemberDocRef = doc(
                db,
                'members',
                session.user.uid,
            ) as DocumentReference<Member>;
            let myMemberInfo: Member | undefined;
            if (!session.user.name || !session.user.image) {
                const myMemberDocSnap = await getDoc(myMemberDocRef);
                myMemberInfo = myMemberDocSnap.data();
            }

            const absence: scheduledMember = {
                ref: myMemberDocRef,
                id: session.user.uid,
                name: session.user.name ?? myMemberInfo?.name ?? '不明',
                imageUrl: session.user.image ?? myMemberInfo?.imageUrl,
                createdAt: Timestamp.fromDate(now),
                updatedAt: Timestamp.fromDate(now),
            };

            const newSchedule: ScheduleDoc = {
                ...schedule,
                ngMembers: [...schedule.ngMembers, absence],
            };
            const setDecRef = await setDoc(scheduleDocRef, newSchedule);
            console.log('欠席にしました。', setDecRef);
            setMessage('「欠席」登録しました。');
        } finally {
            setDisabledAbsence(false);
        }
    };

    const registHold = async () => {
        if (!scheduleDocRef || !schedule || !session) return;

        const now = new Date();
        setDisabledHold(true);
        try {
            const myMemberDocRef = doc(
                db,
                'members',
                session.user.uid,
            ) as DocumentReference<Member>;
            let myMemberInfo: Member | undefined;
            if (!session.user.name || !session.user.image) {
                const myMemberDocSnap = await getDoc(myMemberDocRef);
                myMemberInfo = myMemberDocSnap.data();
            }

            const hold: scheduledMember = {
                ref: myMemberDocRef,
                id: session.user.uid,
                name: session.user.name ?? myMemberInfo?.name ?? '不明',
                imageUrl: session.user.image ?? myMemberInfo?.imageUrl,
                createdAt: Timestamp.fromDate(now),
                updatedAt: Timestamp.fromDate(now),
            };

            const newSchedule: ScheduleDoc = {
                ...schedule,
                holdMembers: [...schedule.holdMembers, hold],
            };
            const setDecRef = await setDoc(scheduleDocRef, newSchedule);
            console.log('保留にしました。', setDecRef);
            setMessage('「保留」登録しました。');
        } finally {
            setDisabledHold(false);
        }
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
                {message && (
                    <div className='mb-3'>
                        <Message message={message} />
                    </div>
                )}
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
                <div className='my-2 mx-1 p-2 bg-gray-100 rounded text-sm'>
                    {schedule.memo ? schedule.memo : '　'}
                </div>

                <div className='flex w-full space-x-3 my-5'>
                    <button
                        className='w-1/3 p-4 bg-rose-600 text-white rounded-md hover:bg-rose-800 text-center cursor-pointer disabled:opacity-30'
                        onClick={registAbsence}
                        disabled={disabledAbsence}
                    >
                        欠席
                    </button>
                    <button
                        className='w-1/3 p-4 bg-gray-600 text-white rounded-md hover:bg-gray-800 text-center cursor-pointer disabled:opacity-30'
                        onClick={registHold}
                        disabled={disabledHold}
                    >
                        保留
                    </button>
                    <button
                        className='w-1/3 p-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-800 text-center cursor-pointer disabled:opacity-30'
                        onClick={registAttendance}
                        disabled={disabledAttendance}
                    >
                        参加
                    </button>
                </div>
                <Link
                    href={`/member/schedule/${params.scheduleId}/edit`}
                    className='block text-center mx-auto mt-10 w-2/3 p-2 bg-green-500 text-white rounded-md hover:bg-green-600'
                >
                    編集はこちら
                </Link>
            </div>
        </main>
    );
};

export default ScheduleView;
