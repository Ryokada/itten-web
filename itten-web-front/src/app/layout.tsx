import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import Header from './components/Header';
import SessionProvider from '@/app/utiles/SessionProvider';

const notoSansJp = Noto_Sans_JP({
    weight: ['400', '700'],
    display: 'swap',
    preload: false,
});

export const metadata: Metadata = {
    title: '一天',
    description: '東京都世田谷区で活動する草野球チーム一天のサイトです。',
    applicationName: '草野球チーム管理アプリ',
    authors: {
        name: 'Ryoya Okada',
    },
    generator: 'Next.js',
    keywords: ['baseball', '草野球', '野球', '一天', '世田谷', '東京'],
    themeColor: '#0355f9',
    viewport: { width: 'device-width', initialScale: 1 },
    robots: { index: true, follow: false },
};

/**
 * アプリケーション全体のレイアウトコンポーネント
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='ja'>
            <body className={notoSansJp.className}>
                <SessionProvider>
                    <Header />
                    {/* top要素を作っておいてここにリンクすることで強制的に戦闘にスクロールさせる */}
                    <div id='top' className='h-px bg-slate-200'></div>
                    <div className='pt-16 bg-slate-200 min-h-screen'>{children}</div>
                </SessionProvider>
                <Analytics />
            </body>
        </html>
    );
}
