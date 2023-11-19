import type { Metadata } from 'next';
import AdminOnly from '../components/AdminOnly';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: '一天管理者',
    description: '一天管理者用のページです',
};
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return <AdminOnly>{children}</AdminOnly>;
};

export default AdminLayout;
