import Image from 'next/image';
import AosLayout from './components/Aoslayout';
import uni from '@public/images/photos/uni.jpg';
import skyPng from '@public/images/sky.png';
import logo from '@public/itten-logo.png';

export default function Home() {
    return (
        <AosLayout>
            <main className='flex min-h-screen flex-col items-center justify-between'>
                <div className='pt-24 px-5 z-10 max-w-4xl w-full text-zinc-800'>
                    <div className='mb-40'>
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
                            <p className='text-lg'>
                                一天（いってん）は
                                <br />
                                東京都世田谷区を中心に活動する
                                <br />
                                草野球チームです
                            </p>
                        </div>
                    </div>
                    {/* ジグザグ */}
                    {/* ジグザグ1 */}
                    <div className='flex flex-col lg:flex-row w-full items-center justify-center space-x-10 space-y-10 mb-12'>
                        <div>
                            <Image
                                src={uni}
                                objectFit={`cover`}
                                alt='背景'
                                data-aos='fade-right'
                                className='rounded-xl object-cover h-40 w-80 lg:h-72 lg:w-96'
                            />
                        </div>
                        <div data-aos='fade-up'>
                            <h1 className='text-2xl font-bold mb-5 text-zinc-600'>一天について</h1>
                            <p>
                                一天（いってん）は
                                <br />
                                東京都世田谷区を中心に活動する
                                <br />
                                草野球チームです
                            </p>
                        </div>
                    </div>
                    {/* ジグザグ2 */}
                    <div className='flex flex-col lg:flex-row-reverse w-full items-center justify-center space-x-10 space-y-10 lg:space-x-reverse mb-12'>
                        <div>
                            <Image
                                src={uni}
                                objectFit={`cover`}
                                alt='背景'
                                data-aos='fade-left'
                                className='rounded-xl object-cover h-40 w-80 lg:h-72 lg:w-96'
                            />
                        </div>
                        <div data-aos='fade-up'>
                            <h1 className='text-2xl font-bold mb-5 text-zinc-600'>一天について</h1>
                            <p>
                                一天（いってん）は
                                <br />
                                東京都世田谷区を中心に活動する
                                <br />
                                草野球チームです
                            </p>
                        </div>
                    </div>
                    {/* ジグザグ3 */}
                    <div className='flex flex-col lg:flex-row w-full items-center justify-center space-x-10 space-y-10 mb-12'>
                        <div>
                            <Image
                                src={uni}
                                objectFit={`cover`}
                                alt='背景'
                                data-aos='fade-right'
                                className='rounded-xl object-cover h-40 w-80 lg:h-72 lg:w-96'
                            />
                        </div>
                        <div data-aos='fade-up'>
                            <h1 className='text-2xl font-bold mb-5 text-zinc-600'>一天について</h1>
                            <p>
                                一天（いってん）は
                                <br />
                                東京都世田谷区を中心に活動する
                                <br />
                                草野球チームです
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`fixed top-0 left-0 w-full h-screen`}>
                    <Image src={skyPng} layout={`fill`} objectFit={`cover`} alt='背景' />
                </div>
            </main>
        </AosLayout>
    );
}
