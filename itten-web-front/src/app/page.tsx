import Image from 'next/image';
import AosLayout from './components/Aoslayout';
import skyPng from '@public/images/sky.png';
import logo from '@public/itten-logo.png';

export default function Home() {
    return (
        <AosLayout>
            <main className='flex min-h-screen flex-col items-center justify-between'>
                <div className='pt-24 px-12 z-10 max-w-4xl w-full text-zinc-800'>
                    <div>
                        <Image
                            className='mx-auto my-10'
                            src={logo}
                            width={200}
                            height={200}
                            alt='ロゴ'
                            data-aos='fade'
                            data-aos-delay='100'
                        />
                    </div>
                    <div
                        className='flex justify-center items-center text-center leading-loose'
                        data-aos='fade'
                    >
                        <p>
                            一天（いってん）は
                            <br />
                            東京都世田谷区を中心に活動する
                            <br />
                            草野球チームです
                        </p>
                    </div>
                </div>

                <div className={`fixed top-0 left-0 w-full h-screen`}>
                    <Image src={skyPng} layout={`fill`} objectFit={`cover`} alt='背景' />
                </div>
            </main>
        </AosLayout>
    );
}
