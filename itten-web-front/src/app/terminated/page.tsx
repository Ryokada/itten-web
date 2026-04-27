import Image from 'next/image';
import logo from '@public/itten-logo.png';

export default function TerminatedPage() {
    return (
        <div className='min-h-screen bg-slate-100 flex flex-col items-center justify-center px-6 text-center'>
            <Image src={logo} width={120} height={120} alt='一天ロゴ' className='mb-8 opacity-70' />
            <h1 className='text-2xl font-bold text-zinc-700 mb-4'>サービス終了のお知らせ</h1>
            <p className='text-zinc-600 leading-loose max-w-md'>
                草野球チーム一天のWebシステムは、サービスを終了しました。
                <br />
                長らくのご利用ありがとうございました。
            </p>
        </div>
    );
}
