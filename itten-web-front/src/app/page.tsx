import Image from 'next/image';
import AosLayout from './components/Aoslayout';
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
                    <div className='flex flex-col lg:flex-row w-full items-center justify-center space-y-10 lg:space-x-10 mb-14'>
                        <div className='rounded-xl overflow-hidden' data-aos='fade-right'>
                            <div className='transition-transform duration-300 ease-in-out hover:scale-125'>
                                <Image
                                    src={uni}
                                    objectFit={`cover`}
                                    alt='背景'
                                    className='object-cover h-40 w-80 lg:h-72 lg:w-96'
                                />
                            </div>
                        </div>
                        <div className='lg:w-1/2' data-aos='fade-up'>
                            <h1 className='text-2xl font-bold mb-5 text-zinc-600'>一天について</h1>
                            <p>
                                ▫︎設立　2020年4月
                                <br />
                                ▫︎活動　毎週土曜午後中心に土日どちらか
                                <br />
                                ▫︎場所　東京・世田谷
                                <br />
                                ▫︎人数　23名(20代〜50代)
                                <br />
                                経験者(小〜高)&初心者ミックスで野球を楽しんでいます。
                                <br />
                                対戦申込はDMまでお願い致します！
                                <br />
                            </p>
                        </div>
                    </div>
                    {/* ジグザグ2 */}
                    <div className='flex flex-col lg:flex-row-reverse w-full items-center justify-center space-y-10  lg:space-x-10 lg:space-x-reverse mb-14'>
                        <div className='rounded-xl overflow-hidden' data-aos='fade-left'>
                            <div className='transition-transform duration-300 ease-in-out hover:scale-125'>
                                <Image
                                    src={gloves}
                                    objectFit={`cover`}
                                    alt='背景'
                                    className='object-cover h-40 w-80 lg:h-72 lg:w-96'
                                />
                            </div>
                        </div>
                        <div className='lg:w-1/2' data-aos='fade-up'>
                            <h1 className='text-2xl font-bold mb-5 text-zinc-600'>Instagram</h1>
                            <p>
                                <a
                                    href='https://www.instagram.com/itten2020/'
                                    className='underline'
                                >
                                    {'インスタ'}
                                </a>
                                やってます
                            </p>
                        </div>
                    </div>
                    {/* ジグザグ3 */}
                    <div className='flex flex-col lg:flex-row w-full items-center justify-center space-y-10 lg:space-x-10 mb-14'>
                        <div className='rounded-xl overflow-hidden' data-aos='fade-right'>
                            <div className='transition-transform duration-300 ease-in-out hover:scale-125'>
                                <Image
                                    src={meeting}
                                    objectFit={`cover`}
                                    alt='背景'
                                    className='object-cover h-40 w-80 lg:h-72 lg:w-96'
                                />
                            </div>
                        </div>
                        <div className='lg:w-1/2' data-aos='fade-up'>
                            <h1 className='text-2xl font-bold mb-5 text-zinc-600'>公式戦</h1>
                            <p>
                                <a href='https://ts-league.com/team/itten/' className='underline'>
                                    {'東京スカイツリーグ'}
                                </a>
                                に所属しています
                            </p>
                        </div>
                    </div>
                    {/* ジグザグ4 */}
                    <div className='flex flex-col lg:flex-row-reverse w-full items-center justify-center space-y-10 lg:space-x-10 lg:space-x-reverse mb-14'>
                        <div className='rounded-xl overflow-hidden' data-aos='fade-left'>
                            <div className='transition-transform duration-300 ease-in-out hover:scale-125'>
                                <Image
                                    src={score}
                                    objectFit={`cover`}
                                    alt='背景'
                                    className='object-cover h-40 w-80 lg:h-72 lg:w-96'
                                />
                            </div>
                        </div>
                        <div className='lg:w-1/2' data-aos='fade-up'>
                            <h1 className='text-2xl font-bold mb-5 text-zinc-600'>戦績</h1>
                            <p>
                                <a href='https://teams.one/teams/itten/game' className='underline'>
                                    {'Teams'}
                                </a>
                                で成績をまとめています
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
