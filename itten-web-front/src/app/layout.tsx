import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '一天',
    description: '東京都世田谷区で活動する草野球チーム一天のサイトです。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='ja'>
            <body>{children}</body>
        </html>
    );
}
