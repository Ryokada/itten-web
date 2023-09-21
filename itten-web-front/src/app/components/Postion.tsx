type Position = {
    /**
     * ラベル（一文字）
     */
    label: string;

    /**
     * 名前
     */
    name: string;

    /**
     * 表示するときの文字色
     */
    color: string;
};

/**
 * ポジションの一覧データ
 */
export const positionsMaster: Dictionary<Position> = {
    '0': {
        label: 'DH',
        name: 'DH',
        color: '#C0C0C0',
    },
    '1': {
        label: '投',
        name: 'ピッチャー',
        color: '#ea736b',
    },
    '2': {
        label: '捕',
        name: 'キャッチャー',
        color: '#60cffb',
    },
    '3': {
        label: '一',
        name: 'ファースト',
        color: '#f9d54b',
    },
    '4': {
        label: '二',
        name: 'セカンド',
        color: '#f9d54b',
    },
    '5': {
        label: '三',
        name: 'サード',
        color: '#f9d54b',
    },
    '6': {
        label: '遊',
        name: 'ショート',
        color: '#f9d54b',
    },
    '7': {
        label: '左',
        name: 'レフト',
        color: '#5ec53e',
    },
    '8': {
        label: '中',
        name: 'センター',
        color: '#5ec53e',
    },
    '9': {
        label: '右',
        name: 'ライト',
        color: '#5ec53e',
    },
};

type PostionProps = {
    /**
     * ポジション番号
     */
    positionNumber: string;
};

/**
 * ポジションを表すラベル
 *
 * 「投」とか「遊」とか
 *
 * @param positionNumber ポジション番号
 */
export const PostionLabel = ({ positionNumber }: PostionProps) => {
    const postion = positionsMaster[positionNumber];
    const style = {
        color: postion.color,
    };
    return (
        <span className='font-bold' style={style}>
            {postion.label}
        </span>
    );
};
