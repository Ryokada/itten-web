import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'サインアウト - 一天',
    description: '一天メンバー用サインアウト画面です',
    robots: { index: false, follow: false },
};

const Layput = ({ children }: { children: React.ReactNode }) => {
    return children;
};

export default Layput;
