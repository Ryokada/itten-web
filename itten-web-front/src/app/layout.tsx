import './globals.css'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import Header from './components/Header'
import SessionProvider from '@/app/utiles/SessionProvider'

const notoSansJp = Noto_Sans_JP({
    weight: ['400', '700'],
    display: 'swap',
    preload: false,
})

export const metadata: Metadata = {
    title: '一天',
    description: '一天のサイトです',
}

/**
 * アプリケーション全体のレイアウトコンポーネント
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='ja'>
            <body className={notoSansJp.className}>
                <SessionProvider>
                    <Header />
                    <div className='mt-16 bg-slate-200 min-h-screen'>{children}</div>
                </SessionProvider>
            </body>
        </html>
    )
}
