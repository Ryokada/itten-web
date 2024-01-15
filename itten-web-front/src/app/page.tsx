import Image from 'next/image';
import AosLayout from './components/Aoslayout';
import HomeImageSlider from './components/HomeImageSlider';
import gloves from '@public/images/photos/gloves1.jpg';
import meeting from '@public/images/photos/meeting.jpg';
import score from '@public/images/photos/score.jpg';
import uni from '@public/images/photos/uni.jpg';
import skyPng from '@public/images/sky.png';
import logo from '@public/itten-logo.png';

export default function Home() {
    return (
        <AosLayout>
            <main className='flex min-h-screen flex-col items-center justify-between'>
                <div className='pt-24 z-10 mb-40 h-screen'>
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
                        className='mb-24 lg:mb-60 flex flex-col justify-center items-center text-center leading-loose'
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
                    <div className='w-full' data-aos='fade' data-aos-delay='50'>
                        <HomeImageSlider />
                    </div>
                </div>

                <div className='py-12 px-5 z-10 w-full bg-white bg-opacity-50'>
                    {/* ジグザグ */}
                    <div className='max-w-4xl w-full py-10 text-zinc-800 mx-auto'>
                        {/* ジグザグ1 */}
                        <div className='flex flex-col lg:flex-row w-full items-center justify-center space-y-5 lg:space-x-10 mb-24 lg:mb-8'>
                            <div
                                className='rounded-lg overflow-hidden'
                                data-aos='fade'
                                data-aos-delay='100'
                            >
                                <div className='transition-transform duration-300 ease-in-out hover:scale-125'>
                                    <Image
                                        src={uni}
                                        objectFit={`cover`}
                                        alt='背景'
                                        className='object-cover h-40 w-80 lg:h-72 lg:w-96'
                                    />
                                </div>
                            </div>
                            <div className='px-5 lg:px-0 w-full lg:w-1/2' data-aos='fade-up'>
                                <h1 className='text-2xl font-bold mb-5 text-zinc-600 text-center lg:text-left'>
                                    一天について
                                </h1>
                                <p>
                                    ▫︎設立　2020年4月
                                    <br />
                                    ▫︎活動　毎週土曜午後中心に土日どちらか
                                    <br />
                                    ▫︎場所　東京・世田谷
                                    <br />
                                    ▫︎人数　約20名(20代〜50代)
                                    <br />
                                    <br />
                                    未経験者から経験者まで幅広く在籍しています。
                                    <br />
                                    対戦申込はインスタDMまでお願い致します。
                                    <br />
                                </p>
                            </div>
                        </div>
                        {/* ジグザグ2 */}
                        <div className='flex flex-col lg:flex-row-reverse w-full items-center justify-center space-y-5 lg:space-x-10 lg:space-x-reverse mb-24 lg:mb-8'>
                            <div
                                className='rounded-lg overflow-hidden'
                                data-aos='fade'
                                data-aos-delay='100'
                            >
                                <div className='transition-transform duration-300 ease-in-out hover:scale-125'>
                                    <Image
                                        src={score}
                                        objectFit={`cover`}
                                        alt='背景'
                                        className='object-cover h-40 w-80 lg:h-72 lg:w-96'
                                    />
                                </div>
                            </div>
                            <div className='px-5 lg:px-0 w-full lg:w-1/2' data-aos='fade-up'>
                                <h1 className='text-2xl font-bold mb-5 text-zinc-600 text-center lg:text-left'>
                                    戦績
                                </h1>
                                <p>
                                    <a
                                        href='https://teams.one/teams/itten/game'
                                        className='underline'
                                    >
                                        {'Teams'}
                                    </a>
                                    で成績をまとめています。試合結果や個人成績も見ることができます。
                                </p>
                            </div>
                        </div>
                        {/* ジグザグ3 */}
                        <div className='flex flex-col lg:flex-row w-full items-center justify-center space-y-5 lg:space-x-10 mb-24 lg:mb-8'>
                            <div
                                className='rounded-lg overflow-hidden'
                                data-aos='fade'
                                data-aos-delay='100'
                            >
                                <div className='transition-transform duration-300 ease-in-out hover:scale-125'>
                                    <Image
                                        src={meeting}
                                        objectFit={`cover`}
                                        alt='背景'
                                        className='object-cover h-40 w-80 lg:h-72 lg:w-96'
                                    />
                                </div>
                            </div>
                            <div className='px-5 lg:px-0 w-full lg:w-1/2' data-aos='fade-up'>
                                <h1 className='text-2xl font-bold mb-5 text-zinc-600 text-center lg:text-left'>
                                    公式戦
                                </h1>
                                <p>
                                    <a
                                        href='https://ts-league.com/team/itten/'
                                        className='underline'
                                    >
                                        {'東京スカイツリーグ'}
                                    </a>
                                    に所属しています。目指せプロスタ。
                                </p>
                            </div>
                        </div>
                        {/* ジグザグ4 */}
                        <div className='flex flex-col lg:flex-row-reverse w-full items-center justify-center space-y-5 lg:space-x-10 lg:space-x-reverse mb-24 lg:mb-8'>
                            <div
                                className='rounded-lg overflow-hidden'
                                data-aos='fade'
                                data-aos-delay='100'
                            >
                                <div className='transition-transform duration-300 ease-in-out hover:scale-125'>
                                    <Image
                                        src={gloves}
                                        objectFit={`cover`}
                                        alt='背景'
                                        className='object-cover h-40 w-80 lg:h-72 lg:w-96'
                                    />
                                </div>
                            </div>
                            <div className='px-5 lg:px-0 w-full lg:w-1/2' data-aos='fade-up'>
                                <h1 className='text-2xl font-bold mb-5 text-zinc-600 text-center lg:text-left'>
                                    Instagram
                                </h1>
                                <p>
                                    <a
                                        href='https://www.instagram.com/itten2020/'
                                        className='underline'
                                    >
                                        {'インスタ'}
                                    </a>
                                    やってます。ぜひフォローお願いします。
                                </p>
                            </div>
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
