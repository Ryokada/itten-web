type Member = {
    /**
     * メンバーのアカウントID
     */
    id: string

    /**
     * 名前
     */
    name: string

    /**
     * 背番号
     *
     * 001などがあるので文字列
     */
    number: string

    /**
     * 通知用のLINEID
     */
    lineId?: string

    /**
     * アイコン画像のURL
     */
    imageUrl?: string

    /**
     * 希望ポジション
     *
     * ポジション番号の配列
     */
    desiredPositions: Array<string>

    /**
     * ポジションについてコメント
     */
    positionComment?: string
}
