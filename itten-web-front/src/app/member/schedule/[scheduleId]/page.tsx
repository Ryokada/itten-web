'use client';

import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import {
    DocumentReference,
    Timestamp,
    doc,
    getDoc,
    query,
    collection,
    CollectionReference,
    getDocs,
    runTransaction,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { set } from 'react-hook-form';
import {
    ScheduleDoc,
    comparAscScheduledMemberCreatedAt,
    ScheduledMember,
    getScheduleState,
    ScheduleStatus,
    getNoAnsweredMembers,
    canEditSchedule,
} from '../schedule';
import Dialog from '@/app/components/Dialog';
import { SmallIcon } from '@/app/components/Icon';
import Message from '@/app/components/Message';
import ScheduleTypeLabel from '@/app/components/ScheduleTypeLabel';
import Spinner from '@/app/components/Spinner';
import { db, functions } from '@/firebase/client';
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
    const [members, setMembers] = useState<Member[]>([]);
    const [noAnsweredMembers, setNoAnsweredMembers] = useState<ScheduledMember[]>([]);
    const [me, setMe] = useState<Member>();
    const [scheduleStatus, setScheduleStatus] = useState<ScheduleStatus>();
    const [message, setMessage] = useState<string>('');

    const [registLock, setRegistLock] = useState<boolean>(false);
    const [disabledAttendance, setDisabledAttendance] = useState(false);
    const [disabledAbsence, setDisabledAbsence] = useState(false);
    const [disabledHold, setDisabledHold] = useState(false);
    const [disabledRemaind, setDisabledRemaind] = useState(false);
    const [attendanseMemo, setAttendanseMemo] = useState<string>('');

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [additionalRemindMessage, setAdditionalRemindMessage] = useState('');

    const handleOpenDialog = () => {
        console.log('handleOpenDialog', isDialogOpen);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        console.log('handleCloseDialog', isDialogOpen);
        setDialogOpen(false);
    };

    const sendRemind = async () => {
        if (!scheduleDocRef || !noAnsweredMembers || noAnsweredMembers.length === 0) return;

        setDisabledRemaind(true);
        try {
            const lineSendRemindInputSchedule = httpsCallable(
                functions,
                'lineSendRemindInputSchedule',
            );
            await lineSendRemindInputSchedule({
                scheduleId: scheduleDocRef.id,
                toIds: noAnsweredMembers.filter((m) => m.lineId).map((m) => m.lineId),
                additionalMessage: additionalRemindMessage ?? '',
            });
            setMessage('催促のLINEを送信しました');
        } catch (e) {
            console.error('LINE通知に失敗しました', e);
            setMessage('催促のLINEを送信に失敗しました');
        } finally {
            setDialogOpen(false);
            setDisabledRemaind(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /**
     * 出欠を登録します
     *
     * @param stetus
     * @returns
     */
    const regist = async (stetus: ScheduleStatus) => {
        if (!scheduleDocRef || !schedule || !session) return;
        if (registLock) return;

        const now = new Date();

        setRegistLock(true);
        try {
            let registLabel = '';
            let setDisabled: (value: boolean) => void;
            let isAlreadyRgisterd: (schedule: ScheduleDoc) => boolean;
            let buildNewSchedule: (
                updateTarget: ScheduleDoc,
                attendanse: ScheduledMember,
            ) => ScheduleDoc;

            switch (stetus) {
                case 'ok': {
                    registLabel = '参加';
                    setDisabled = setDisabledAttendance;
                    isAlreadyRgisterd = (schedule) =>
                        schedule.okMembers.find((m) => m.id === session.user.uid) !== undefined;
                    buildNewSchedule = (updateTarget, attendanse) => ({
                        ...updateTarget,
                        okMembers: [...schedule.okMembers, attendanse],
                        ngMembers: updateTarget.ngMembers.filter((m) => m.id !== session.user.uid),
                        holdMembers: updateTarget.holdMembers.filter(
                            (m) => m.id !== session.user.uid,
                        ),
                    });
                    break;
                }
                case 'ng': {
                    registLabel = '欠席';
                    setDisabled = setDisabledAbsence;
                    isAlreadyRgisterd = (schedule) =>
                        schedule.ngMembers.find((m) => m.id === session.user.uid) !== undefined;
                    buildNewSchedule = (updateTarget, attendanse) => ({
                        ...updateTarget,
                        okMembers: updateTarget.okMembers.filter((m) => m.id !== session.user.uid),
                        ngMembers: [...schedule.ngMembers, attendanse],
                        holdMembers: updateTarget.holdMembers.filter(
                            (m) => m.id !== session.user.uid,
                        ),
                    });
                    break;
                }
                case 'hold': {
                    registLabel = '保留';
                    setDisabled = setDisabledHold;
                    isAlreadyRgisterd = (schedule) =>
                        schedule.holdMembers.find((m) => m.id === session.user.uid) !== undefined;
                    buildNewSchedule = (updateTarget, attendanse) => ({
                        ...updateTarget,
                        okMembers: updateTarget.okMembers.filter((m) => m.id !== session.user.uid),
                        ngMembers: updateTarget.ngMembers.filter((m) => m.id !== session.user.uid),
                        holdMembers: [...schedule.holdMembers, attendanse],
                    });
                    break;
                }
                default: {
                    throw new Error('invalid status');
                }
            }

            setDisabled(true);
            try {
                const myMemberDocRef = doc(
                    db,
                    'members',
                    session.user.uid,
                ) as DocumentReference<Member>;

                const attendanse: ScheduledMember = {
                    ref: myMemberDocRef,
                    id: session.user.uid,
                    name: me?.name ?? '不明',
                    imageUrl: me?.imageUrl ?? '',
                    createdAt: Timestamp.fromDate(now),
                    updatedAt: Timestamp.fromDate(now),
                    memo: attendanseMemo ?? '',
                    lineId: me?.lineId ?? '',
                };

                await runTransaction(db, async (transaction) => {
                    const sfDoc = await transaction.get(scheduleDocRef);
                    if (!sfDoc.exists()) {
                        throw Error('対象のスケージュールが存在しません');
                    }

                    const updateTarget = sfDoc.data();

                    const already = isAlreadyRgisterd(updateTarget);
                    if (already) {
                        console.log(`すでに「${registLabel}」登録済みです`, updateTarget, already);
                        setSchedule(updateTarget);
                        return;
                    }

                    const newSchedule = buildNewSchedule(updateTarget, attendanse);
                    console.log('newSchedule', newSchedule);

                    transaction.update(scheduleDocRef, newSchedule);
                    setSchedule(newSchedule);
                    setNoAnsweredMembers(
                        getNoAnsweredMembers(newSchedule, members).map((m) => {
                            const dummyTimestamp = Timestamp.now();
                            return {
                                id: m.id,
                                name: m.name,
                                imageUrl: m.imageUrl,
                                createdAt: dummyTimestamp,
                                updatedAt: dummyTimestamp,
                                memo: '',
                                lineId: m.lineId,
                            };
                        }),
                    );
                    console.log(`「${registLabel}」登録しました。`, newSchedule);
                });
                setMessage(`「${registLabel}」登録しました。`);
                setScheduleStatus(stetus);
            } catch (e) {
                console.error(`「${registLabel}」登録に失敗しました。`, e);
                setMessage(`「${registLabel}」登録に失敗しました。もう一度やり直してください。`);
            } finally {
                setDisabled(false);
            }
        } finally {
            setRegistLock(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (!session) return;
        // TODO 共通化
        const docRef = doc(db, 'schedules', params.scheduleId) as DocumentReference<ScheduleDoc>;
        const membersQuery = query(collection(db, 'members')) as CollectionReference<Member>;
        setScheduleDocRef(docRef);

        (async () => {
            const docSnap = await getDoc(docRef);
            const scheduleInfo = docSnap.data();
            if (scheduleInfo) {
                // ここで出欠メンバーをソートしておく
                scheduleInfo.okMembers.sort(comparAscScheduledMemberCreatedAt);
                scheduleInfo.ngMembers.sort(comparAscScheduledMemberCreatedAt);
                scheduleInfo.holdMembers.sort(comparAscScheduledMemberCreatedAt);
                setSchedule(scheduleInfo);
                const attendanse = getScheduleState(scheduleInfo, session.user.uid);
                setScheduleStatus(attendanse?.state);
                setAttendanseMemo(attendanse?.me.memo ?? '');
            } else {
                throw new PageNotFoundError('schedule');
            }

            const membersDocs = await getDocs(membersQuery);
            const newMembers: Array<Member> = [];
            membersDocs.forEach((d) => {
                newMembers.push({ ...d.data(), id: d.id });
                // 自分だったら自分にも入れとく
                if (d.id === session.user.uid) {
                    setMe(d.data());
                }
            });
            setMembers(newMembers);
            setNoAnsweredMembers(
                getNoAnsweredMembers(scheduleInfo, newMembers).map((m) => {
                    const dummyTimestamp = Timestamp.now();
                    return {
                        id: m.id,
                        name: m.name,
                        imageUrl: m.imageUrl,
                        createdAt: dummyTimestamp,
                        updatedAt: dummyTimestamp,
                        memo: '',
                        lineId: m.lineId,
                    };
                }),
            );
        })();
    }, [session, params.scheduleId]);

    if (!schedule) {
        return <Spinner />;
    }

    const startTsDayjs = dayjs(schedule.startTimestamp.toDate());
    const endTsDayjs = dayjs(schedule.endTimestamp.toDate());

    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full mx-auto mb-5'>
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
                        <div className=''>{`（${startTsDayjs.format('dd')}）`}</div>
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
                {schedule.vs &&
                    (schedule.isHome ? (
                        <div className='text-sm'>{'ホーム'}</div>
                    ) : (
                        <div className='text-sm'>{'ビジター'}</div>
                    ))}

                {/* メモ */}
                <div className='my-2 mx-1 p-2 bg-gray-100 rounded text-sm'>
                    {schedule.memo ? schedule.memo : '　'}
                </div>

                {/* 出欠登録ボタン */}
                {!scheduleStatus && (
                    <div className='w-full text-center font-bold rounded bg-yellow-400 p-1 border border-gray-400'>
                        ⚠️ 出欠未登録です ⚠️
                    </div>
                )}
                <div className='flex w-full space-x-3 mt-10 mb-3'>
                    <button
                        className='w-1/3 p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-800 text-center cursor-pointer opacity-30 disabled:opacity-100 disabled:cursor-not-allowed'
                        onClick={() => regist('ok')}
                        disabled={disabledAttendance || scheduleStatus === 'ok'}
                    >
                        参加
                    </button>
                    <button
                        className='w-1/3 p-3 bg-teal-600 text-white rounded-md hover:bg-teal-800 text-center cursor-pointer opacity-30 disabled:opacity-100 disabled:cursor-not-allowed'
                        onClick={() => regist('hold')}
                        disabled={disabledHold || scheduleStatus === 'hold'}
                    >
                        保留
                    </button>
                    <button
                        className='w-1/3 p-3 bg-rose-600 text-white rounded-md hover:bg-rose-800 text-center cursor-pointer opacity-30 disabled:opacity-100 disabled:cursor-not-allowed'
                        onClick={() => regist('ng')}
                        disabled={disabledAbsence || scheduleStatus === 'ng'}
                    >
                        欠席
                    </button>
                </div>
                <textarea
                    className='mx-1 p-2 border rounded-md w-full text-sm'
                    name='attendandeMemo'
                    rows={3}
                    value={attendanseMemo}
                    placeholder='出欠に関しての補足を入力できます'
                    onChange={(event) => setAttendanseMemo(event.target.value)}
                />

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
                    <ScheduledMemberList
                        title='⚠️未登録メンバー'
                        scheduledMembers={noAnsweredMembers}
                    />
                </div>

                {me && canEditSchedule(schedule, me) && (
                    <Link
                        href={`/member/schedule/${params.scheduleId}/edit`}
                        className='block text-center mx-auto mt-10 w-2/3 p-2 bg-green-500 text-white rounded-md hover:bg-green-600'
                    >
                        編集はこちら
                    </Link>
                )}
                {me?.role === 'admin' && (
                    <>
                        <button
                            className='block text-center mx-auto mt-10 w-2/3 p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600'
                            onClick={handleOpenDialog}
                        >
                            未回答メンバーに通知する
                        </button>
                        <Dialog isOpen={isDialogOpen} onClose={handleCloseDialog}>
                            <div>
                                <h1 className='mb-2 text-lg'>催促LINEを送ります</h1>
                                <h2 className='text-sm'>追加メッセージ（省略可）</h2>
                                <textarea
                                    className='border rounded-md w-full mb-2 p-2 text-sm'
                                    value={additionalRemindMessage}
                                    onChange={(e) => setAdditionalRemindMessage(e.target.value)}
                                ></textarea>
                                <div className='mb-5'>
                                    <ScheduledMemberList
                                        title='未登録メンバー'
                                        scheduledMembers={noAnsweredMembers}
                                    />
                                </div>

                                <div className='flex w-full space-x-3'>
                                    <button
                                        onClick={handleCloseDialog}
                                        className='w-1/2 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600'
                                    >
                                        閉じる
                                    </button>
                                    <button
                                        onClick={sendRemind}
                                        className='w-1/2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                                        disabled={disabledRemaind}
                                    >
                                        送信
                                    </button>
                                </div>
                            </div>
                        </Dialog>
                    </>
                )}
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
                <>
                    <div className='flex flex-wrap mt-2'>
                        {scheduledMembers.map((m, i) => {
                            return (
                                <div key={`${m.id}`} className='mt-2 mr-3'>
                                    {m.imageUrl ? (
                                        <SmallIcon src={m.imageUrl} alt={m.name} />
                                    ) : (
                                        <div className='h-8 w-8 bg-gray-600 rounded-full'></div>
                                    )}
                                    <div className='text-sm'>{m.name ?? 'noname'}</div>
                                </div>
                            );
                        })}
                    </div>
                    {scheduledMembers.some((m) => m.memo) && (
                        <div className='my-1 mx-1 py-1 px-2 bg-gray-100 rounded text-sm text-gray-600'>
                            {scheduledMembers.map((m) =>
                                m.memo ? (
                                    <p key={`memo-${m.id}`}>
                                        {`${m.name}: ${m.memo}`}
                                        <br />
                                    </p>
                                ) : (
                                    ''
                                ),
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className='h-10'>
                    <p className='ml-5 text-gray-700'>なし</p>
                </div>
            )}
        </div>
    );
};
