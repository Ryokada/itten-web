import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '公開スケジュール - 一天',
    description: '東京都世田谷区で活動する草野球チーム一天の公開可能なスケジュールです。',
    robots: { index: false, follow: false },
};

const Layput = ({ children }: { children: React.ReactNode }) => {
    return children;
};

export default Layput;
