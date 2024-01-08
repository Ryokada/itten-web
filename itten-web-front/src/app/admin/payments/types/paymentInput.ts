export type PaymentInput = {
    /** 精算済みかどうか */
    paid: boolean;
    /** 日付 YYYY/MM/DD */
    paidDate: string;
    /** タイプ（試合|練習|その他） */
    type: string;
    /** 内容 */
    description: string;
    /** 参加費 */
    participationFeeIncome: number;
    /** 相手チームから */
    fromVsTeamIncome: number;
    /** その他収入 */
    otherIncome: number;
    /** 場代 */
    groundFeeExpenses: number;
    /** 審判代 */
    umpirFeeExpenses: number;
    /** その他支出 */
    otherExpenses: number;
    /** 備考 */
    remarks: string;
    /** 建て替えた人 */
    paidMenberName: string;
};
