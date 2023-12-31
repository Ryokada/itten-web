import type { Metadata } from 'next';
import AuthOnly from '@/app/components/AuthOnly';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: '一天メンバー',
    description: '一天メンバー用のページです',
    robots: { index: false, follow: false },
};
const MemberLayout = ({ children }: { children: React.ReactNode }) => {
    return <AuthOnly>{children}</AuthOnly>;
};

export default MemberLayout;
