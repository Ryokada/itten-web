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
import DeleteScheduleConfirm from '../DeleteScheduleConfirm';
import HeloMemberForm from '../HelpMemberForm';
import {
    ScheduleDoc,
    comparAscScheduledMemberCreatedAt,
    ScheduledMember,
    getScheduleState,
    ScheduleStatus,
    getNoAnsweredMembers,
    canEditSchedule,
    HelpMember,
} from '../schedule';
import Dialog from '@/app/components/Dialog';
import { MemberIcon, SmallIcon } from '@/app/components/Icon';
import Message from '@/app/components/Message';
import ScheduleTypeLabel from '@/app/components/ScheduleTypeLabel';
import Spinner from '@/app/components/Spinner';
import { ICAL_TIMESTAMP_FORMAT } from '@/app/utiles/calenderFormats';
import { db, functions } from '@/firebase/client';
import calenderIcon from '@public/icons/calender.svg';
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
    const [allMembers, setAllMembers] = useState<Member[]>([]);
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

    const [additionalRemindMessage, setAdditionalRemindMessage] = useState('');
    const [isNoAnswerNotifyDialogOpen, setNoAnswerNotifyDialogOpen] = useState(false);

    const handleOpenNotifyDialog = () => {
        setNoAnswerNotifyDialogOpen(true);
    };

    const handleCloseNotifyDialog = () => {
        setNoAnswerNotifyDialogOpen(false);
    };
    const [isHoldrNotifyDialogOpen, setHoldNotifyDialogOpen] = useState(false);

    const handleOpenHoldNotifyDialog = () => {
        setHoldNotifyDialogOpen(true);
    };

    const handleCloseHoldNotifyDialog = () => {
        setHoldNotifyDialogOpen(false);
    };

    const [isAddHelperDialogOpen, setAddHelperDialogOpen] = useState(false);

    const handleOpenAddHelperDialog = () => {
        setAddHelperDialogOpen(true);
    };

    const handleCloseAddHelperDialog = () => {
        setAddHelperDialogOpen(false);
    };

    const [isDeleteialogOpen, setDeleteDialogOpen] = useState(false);

    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const sendRemind = async (toMembers: Array<ScheduledMember>) => {
        if (!scheduleDocRef || !toMembers || toMembers.length === 0) return;

        setDisabledRemaind(true);
        try {
            const lineSendRemindInputSchedule = httpsCallable(
                functions,
                'lineSendRemindInputSchedule',
            );
            await lineSendRemindInputSchedule({
                scheduleId: scheduleDocRef.id,
                toIds: toMembers.filter((m) => m.lineId).map((m) => m.lineId),
                additionalMessage: additionalRemindMessage ?? '',
            });
            setMessage('催促のLINEを送信しました');
        } catch (e) {
            console.error('LINE通知に失敗しました', e);
            setMessage('催促のLINEを送信に失敗しました');
        } finally {
            setNoAnswerNotifyDialogOpen(false);
            setHoldNotifyDialogOpen(false);
            setDisabledRemaind(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const updateHelpMembers = async (members: HelpMember[]) => {
        if (!scheduleDocRef) return;
        try {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(scheduleDocRef);
                if (!sfDoc.exists()) {
                    throw Error('対象のスケージュールが存在しません');
                }

                const updateTarget = sfDoc.data();
                const newData = { ...updateTarget, helpMembers: members };
                transaction.update(scheduleDocRef, newData);
                setSchedule(newData);
            });
            setMessage('助っ人を更新しました');
        } catch (e) {
            console.error('助っ人の更新に失敗しました', e);
            setMessage('助っ人の更新に失敗しました');
        } finally {
            setAddHelperDialogOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const deleteSchedule = async () => {
        if (!scheduleDocRef) return;
        try {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(scheduleDocRef);
                if (!sfDoc.exists()) {
                    throw Error('対象のスケージュールが存在しません');
                }

                const updateTarget = sfDoc.data();
                const newData = { ...updateTarget, isDeleted: true };
                transaction.update(scheduleDocRef, newData);
                setSchedule(newData);
            });
            setMessage('予定を削除しました');
        } catch (e) {
            console.error('予定の削除に失敗しました', e);
            setMessage('予定の削除に失敗しました');
        } finally {
            setDeleteDialogOpen(false);
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
                    console.error;
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
                        getNoAnsweredMembers(newSchedule, allMembers).map((m) => {
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
                console.error('スケジュールが見つかりませんでした');
                window.location.href = '/member/schedule-notfound';
                return;
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
            setAllMembers(newMembers);
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
                {schedule.isDeleted && (
                    <div className='w-full my-3 py-5 text-center font-bold rounded bg-red-400 p-1 border border-red-600'>
                        このスケジュールは削除済みです
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

                {/* 公開 or 非公開 */}
                {schedule.isOpened ? (
                    <div className='text-sm font-bold text-green-600'>{'公開'}</div>
                ) : (
                    <div className='text-sm'>{'非公開'}</div>
                )}

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
                <textarea
                    className='mt-8 p-2 border rounded-md w-full text-xs'
                    name='attendandeMemo'
                    rows={2}
                    value={attendanseMemo}
                    placeholder='出欠に関しての補足を入力できます'
                    onChange={(event) => setAttendanseMemo(event.target.value)}
                />
                <div className='flex w-full space-x-3 mb-3'>
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

                <hr
                    className='h-px my-8
                 bg-gray-300 border-0'
                />

                {/* 出欠メンバー */}
                <div className='flex flex-col space-y-3'>
                    <div>
                        <ScheduledMemberList
                            title='出席メンバー'
                            scheduledMembers={schedule.okMembers}
                        />
                        <div className='mt-2'>
                            <div className='flex text-sm text-gray-600'>
                                <p>助っ人</p>
                                <p>{`(${schedule.helpMembers?.length ?? 0})`}</p>
                            </div>
                            {schedule.helpMembers && schedule.helpMembers.length > 0 && (
                                <div className='flex space-x-3'>
                                    {schedule.helpMembers.map((m) => {
                                        return (
                                            <div
                                                key={`helper${m.name}`}
                                                className='flex space-x-0.5'
                                            >
                                                <p>{m.name}</p>
                                                <p>{`(${m.memo ?? ''})`}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
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

                <div className='flex w-full space-x-3 mt-10 justify-center'>
                    <div className='flex'>
                        <Image src={calenderIcon} alt='' className='w-5 mr-0.5 fill-gray-700' />
                        <a
                            className='text-sm'
                            target='_blank'
                            rel='noopener noreferrer'
                            href={`/api/calender?start=${startTsDayjs.format(
                                ICAL_TIMESTAMP_FORMAT,
                            )}&end=${endTsDayjs.format(ICAL_TIMESTAMP_FORMAT)}&summary=${
                                schedule.title
                            }&description=${schedule.memo}&location=${schedule.placeName}&url=${
                                window.location.href
                            }`}
                        >
                            iPhoneカレンダー
                        </a>
                    </div>
                    <div className='flex'>
                        <Image src={calenderIcon} alt='' className='w-5 mr-0.5 fill-gray-700' />
                        <a
                            className='text-sm'
                            target='_blank'
                            rel='noopener noreferrer'
                            href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${
                                schedule.title
                            }&dates=${startTsDayjs.format(
                                ICAL_TIMESTAMP_FORMAT,
                            )}%2F${endTsDayjs.format(ICAL_TIMESTAMP_FORMAT)}&details=${
                                schedule.memo
                            }&location=${schedule.placeName}&ctz=Asia%2FTokyo`}
                        >
                            Googleカレンダー
                        </a>
                    </div>
                </div>

                {me && canEditSchedule(schedule, me) && (
                    <Link
                        href={`/member/schedule/${params.scheduleId}/edit#top`}
                        className='block text-center mx-auto mt-10 w-2/3 p-2 bg-green-500 text-white rounded-md hover:bg-green-600'
                    >
                        編集はこちら
                    </Link>
                )}
                {me?.role === 'admin' && (
                    <>
                        <button
                            className='block text-center mx-auto mt-5 w-2/3 p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
                            onClick={handleOpenAddHelperDialog}
                        >
                            助っ人編集
                        </button>
                        <Dialog isOpen={isAddHelperDialogOpen} onClose={handleCloseAddHelperDialog}>
                            <div>
                                <HeloMemberForm
                                    close={() => handleCloseAddHelperDialog()}
                                    onSubmit={updateHelpMembers}
                                    members={schedule.helpMembers ?? []}
                                />
                            </div>
                        </Dialog>
                        <button
                            className='block text-center mx-auto mt-10 w-2/3 p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600'
                            onClick={handleOpenHoldNotifyDialog}
                        >
                            保留メンバーに催促
                        </button>
                        <Dialog
                            isOpen={isHoldrNotifyDialogOpen}
                            onClose={handleOpenHoldNotifyDialog}
                        >
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
                                        scheduledMembers={schedule.holdMembers}
                                    />
                                </div>

                                <div className='flex w-full space-x-3'>
                                    <button
                                        onClick={handleCloseHoldNotifyDialog}
                                        className='w-1/2 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600'
                                    >
                                        閉じる
                                    </button>
                                    <button
                                        onClick={() => sendRemind(schedule.holdMembers)}
                                        className='w-1/2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={disabledRemaind}
                                    >
                                        送信
                                    </button>
                                </div>
                            </div>
                        </Dialog>
                        <button
                            className='block text-center mx-auto mt-5 w-2/3 p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600'
                            onClick={handleOpenNotifyDialog}
                        >
                            未回答メンバーに催促
                        </button>
                        <Dialog
                            isOpen={isNoAnswerNotifyDialogOpen}
                            onClose={handleCloseNotifyDialog}
                        >
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
                                        onClick={handleCloseNotifyDialog}
                                        className='w-1/2 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600'
                                    >
                                        閉じる
                                    </button>
                                    <button
                                        onClick={() => sendRemind(noAnsweredMembers)}
                                        className='w-1/2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={disabledRemaind}
                                    >
                                        送信
                                    </button>
                                </div>
                            </div>
                        </Dialog>
                        <button
                            className='block text-center mx-auto mt-10 w-2/3 p-2 bg-red-500 text-white rounded-md hover:bg-red-600'
                            onClick={handleOpenDeleteDialog}
                        >
                            スケジュール削除
                        </button>
                        <Dialog isOpen={isDeleteialogOpen} onClose={handleCloseDeleteDialog}>
                            <div>
                                <DeleteScheduleConfirm
                                    close={handleCloseAddHelperDialog}
                                    onSubmit={deleteSchedule}
                                />
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
            <div className='flex font-bold'>
                <p>{title}</p>
                <p>{`(${scheduledMembers.length})`}</p>
            </div>
            {scheduledMembers.length > 0 ? (
                <>
                    <div className='flex flex-wrap mt-2'>
                        {scheduledMembers.map((m, i) => {
                            return (
                                <div key={`${m.id}`} className='mt-2 mr-3'>
                                    <MemberIcon id={m.id} imageUrl={m.imageUrl} name={m.name} />
                                    <div className='text-sm w-max'>{m.name ?? 'noname'}</div>
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
