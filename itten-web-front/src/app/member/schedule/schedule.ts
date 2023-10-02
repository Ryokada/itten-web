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
};

export type ScheduledMember = {
    ref?: DocumentReference<Member> | AdminDocumentReference<Member>;
    id: string;
    name: string;
    imageUrl?: string;
    memo?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
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
 * ScheduleStatus の値から出欠状況の日本語表示を取得します
 *
 * @param scheduleStatus
 * @returns
 */
export const getScheduleStatusLabel = (scheduleStatus: ScheduleStatus) => {
    switch (scheduleStatus) {
        case 'ok':
            return '参加';
        case 'ng':
            return '欠席';
        case 'hold':
            return '保留';
        default:
            return '未回答';
    }
};

/**
 * 指定したユーザーのスケジュールの出欠登録状況を取得します
 *
 * @param userId 対象のユーザーID
 * @param schedule 対象のスケジュール
 * @returns 出欠状況。未登録の場合 null です。
 */
export const getScheduleState = (userId: string, schedule: ScheduleDoc): ScheduleStatus => {
    const ok = schedule.okMembers.find((m) => m.id === userId);
    if (ok) {
        return 'ok';
    }

    const ng = schedule.ngMembers.find((m) => m.id === userId);
    if (ng) {
        return 'ng';
    }

    const hold = schedule.holdMembers.find((m) => m.id === userId);
    if (hold) {
        return 'hold';
    }

    return null;
};

/**
 * 出欠未回答ユーザーの一覧を取得します
 *
 * @param schedule 対象のスケジュール
 * @param members 全メンバー（要ID）
 * @returns
 */
export const getNoAnsweredMembers = (
    schedule: ScheduleDoc,
    members: Array<Member>,
): Array<Member> => {
    return members.filter(
        (m) =>
            !schedule.okMembers.some((ok) => m.id === ok.id) &&
            !schedule.ngMembers.some((ng) => m.id === ng.id) &&
            !schedule.holdMembers.some((hold) => m.id === hold.id),
    );
};
