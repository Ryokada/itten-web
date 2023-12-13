import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'スケジュール - 一天',
    description: '一天メンバー用スケジュール画面です',
    robots: { index: false, follow: false },
};

const Layput = ({ children }: { children: React.ReactNode }) => {
    return children;
};

export default Layput;
