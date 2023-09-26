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
    okMembers: Array<scheduledMember>;

    /**
     * 欠席者
     */
    ngMembers: Array<scheduledMember>;

    /**
     * 参加保留者
     */
    holdMembers: Array<scheduledMember>;
};

export type scheduledMember = {
    ref?: DocumentReference<Member> | AdminDocumentReference<Member>;
    id: string;
    name: string;
    imageUrl?: string;
    memo?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};
