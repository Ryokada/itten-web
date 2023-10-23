import { DocumentReference, Timestamp } from 'firebase/firestore';
import { DocumentReference as AdminDocumentReference } from 'firebase-admin/firestore';

export type ScheduleDoc = {
    /**
     * タイトル
     */
    title: string;

    /**
     * 場所名
     */
    placeName: string;

    /**
     * 開始日時
     */
    startTimestamp: Timestamp;

    /**
     * 終了日時
     */
    endTimestamp: Timestamp;

    /**
     * スケジュールのタイプ
     *
     * ex) 練習、練習試合、公式戦...
     */
    type: string;

    /**
     * 対戦相手
     */
    vs?: string;

    /**
     * メモ
     */
    memo: string;

    /**
     * 確定済みかどうか
     */
    isConfirmed: boolean;

    /**
     * ホームかどうか
     */
    isHome: boolean;

    /**
     * 作成者
     */
    createdBy: string;

    /**
     * 最終更新者
     */
    updatredBy: string;

    /**
     * 参加者
     */
    okMembers: Array<ScheduledMember>;

    /**
     * 欠席者
     */
    ngMembers: Array<ScheduledMember>;

    /**
     * 参加保留者
     */
    holdMembers: Array<ScheduledMember>;

    /**
     * 助っ人メンバー
     */
    helpMembers?: Array<HelpMember>;

    /**
     * メンバー以外に公開するかどうか
     */
    isOpened?: boolean;
};

export type ScheduledMember = {
    ref?: DocumentReference<Member> | AdminDocumentReference<Member>;
    id: string;
    lineId?: string;
    name: string;
    imageUrl?: string;
    memo?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type HelpMember = {
    id: string;
    name: string;
    memo?: string;
};

/**
 * 時系列昇順にソートするための関数です。
 *
 * @param a
 * @param b
 * @returns
 */
export const comparAscScheduledMemberCreatedAt = (a: ScheduledMember, b: ScheduledMember): number =>
    a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();

export type ScheduleStatus = 'ok' | 'ng' | 'hold' | null | undefined;

/**
 * 指定したユーザーのスケジュールの出欠登録状況を取得します
 *
 * @param schedule 対象のスケジュール
 * @param userId 対象のユーザーID
 * @returns 出欠状況。未登録の場合 null です。
 */
export const getScheduleState = (
    schedule: ScheduleDoc,
    userId: string,
): { state: ScheduleStatus; me: ScheduledMember } | null => {
    const ok = schedule.okMembers.find((m) => m.id === userId);
    if (ok) {
        return {
            state: 'ok',
            me: ok,
        };
    }

    const ng = schedule.ngMembers.find((m) => m.id === userId);
    if (ng) {
        return {
            state: 'ng',
            me: ng,
        };
    }

    const hold = schedule.holdMembers.find((m) => m.id === userId);
    if (hold) {
        return {
            state: 'hold',
            me: hold,
        };
    }

    return null;
};

/**
 * 指定したスケジュールが変種可能かどうかを判定します
 *
 * @param schedule
 * @param me
 * @returns
 */
export const canEditSchedule = (schedule: ScheduleDoc, me: Member): boolean => {
    if (me.role === 'admin') {
        return true;
    }

    if (me.id === schedule.createdBy) {
        return true;
    }

    return false;
};

/**
 * 出欠未回答ユーザーの一覧を取得します
 *
 * @param schedule 対象のスケジュール
 * @param allMembers 全メンバー（要ID）
 * @returns
 */
export const getNoAnsweredMembers = (
    schedule: ScheduleDoc,
    allMembers: Array<Member>,
): Array<Member> => {
    return allMembers.filter(
        (m) =>
            !schedule.okMembers.some((ok) => m.id === ok.id) &&
            !schedule.ngMembers.some((ng) => m.id === ng.id) &&
            !schedule.holdMembers.some((hold) => m.id === hold.id),
    );
};
