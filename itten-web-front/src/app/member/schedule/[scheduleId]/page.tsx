'use client';

import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import { DocumentReference, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ScheduleDoc, comparAscScheduledMemberCreatedAt, ScheduledMember } from '../schedule';
import { SmallIcon } from '@/app/components/Icon';
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
    const [members, sermembers] = useState<Member>();
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

            const attendanse: ScheduledMember = {
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

            const absence: ScheduledMember = {
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

            const hold: ScheduledMember = {
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
                scheduleInfo.okMembers.sort(comparAscScheduledMemberCreatedAt);
                scheduleInfo.ngMembers.sort(comparAscScheduledMemberCreatedAt);
                scheduleInfo.holdMembers.sort(comparAscScheduledMemberCreatedAt);
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
                {/* メッセージ */}
                {message && (
                    <div className='mb-3'>
                        <Message message={message} />
                    </div>
                )}
                <div className='flex'>
                    {/* 日付 */}
                    <div className='flex flex-col justify-center items-center mr-5'>
                        <div className='text-xl leading-none'>{startTsDayjs.format('M')}月</div>
                        <div className='mb-1 text-6xl font-bold leading-none'>
                            {startTsDayjs.format('D')}
                        </div>
                        <div className=''>{startTsDayjs.format('dd')}</div>
                    </div>
                    {/* 概要 */}
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

                {/* タイトル */}
                <h1 className='text-xl my-2'>{schedule.title}</h1>

                {/* スケジュール種別 */}
                <ScheduleTypeLabel typeId={schedule.type} />

                {/* 対戦相手 */}
                {schedule.vs && <div className=''>vs {schedule.vs}</div>}

                {/* ホーム or ビジター */}
                {schedule.vs && schedule.isHome ? (
                    <div className='text-sm'>{'(ホーム)'}</div>
                ) : (
                    <div className='text-sm'>{'(ビジター)'}</div>
                )}

                {/* メモ */}
                <div className='my-2 mx-1 p-2 bg-gray-100 rounded text-sm'>
                    {schedule.memo ? schedule.memo : '　'}
                </div>

                {/* 出欠人数まとめ */}
                <div className='flex space-x-2'>
                    <div>出: {schedule.okMembers.length} 人</div>
                    <div>欠: {schedule.ngMembers.length} 人</div>
                    <div>保: {schedule.holdMembers.length} 人</div>
                    <div>未：</div>
                </div>

                {/* 出欠登録ボタン */}
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

                <hr
                    className='h-px my-8
                 bg-gray-300 border-0'
                />

                {/* 出欠メンバー */}
                <div className='flex flex-col space-y-3'>
                    <ScheduledMemberList
                        title='出席メンバー'
                        scheduledMembers={schedule.okMembers}
                    />
                    <ScheduledMemberList
                        title='欠席メンバー'
                        scheduledMembers={schedule.ngMembers}
                    />
                    <ScheduledMemberList
                        title='保留メンバー'
                        scheduledMembers={schedule.holdMembers}
                    />
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

const ScheduledMemberList = ({
    scheduledMembers,
    title,
}: {
    scheduledMembers: Array<ScheduledMember>;
    title: string;
}) => {
    return (
        <div>
            <div className='flex'>
                <p>{title}</p>
                <p>{`(${scheduledMembers.length})`}</p>
            </div>
            {scheduledMembers.length > 0 ? (
                <div className='flex flex-wrap mt-2'>
                    {scheduledMembers.map((m) => {
                        return (
                            <div key={m.id} className='mt-2 mr-3'>
                                {m.imageUrl ? (
                                    <SmallIcon src={m.imageUrl} alt={m.name} />
                                ) : (
                                    <div className='h-8 w-8 bg-gray-800'></div>
                                )}
                                <div className='text-sm'>{m.name}</div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='h-10'>
                    <p className='ml-5 text-gray-700'>登録メンバーなし</p>
                </div>
            )}
        </div>
    );
};
