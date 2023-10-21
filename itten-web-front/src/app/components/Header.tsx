'use client';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../../../public/itten-logo.png';
import HambugerMenu from '@/app/components/HamburgerMenu';
import useIsDesktop from '@/app/hooks/useIsDesktop';

const menuLinks = [
    { label: 'トップ', href: '/' },
    { label: 'マイページ', href: '/member/mypage' },
    { label: 'スケジュール', href: '/member/schedule' },
    { label: 'スケジュール追加', href: '/member/schedule/add' },
    { label: 'ログイン', href: '/signin' },
    { label: 'ログアウト', href: '/signout' },
];

/**
 * 共通のヘッダーコンポーネントです
 * @returns
 */
export default function Header() {
    const [isDesktop] = useIsDesktop();

    return (
        <header>
            <div className='fixed top-0 left-0 flex w-full bg-white px-6 z-20 h-16 shadow-md items-center justify-between'>
                <Link href='/'>
                    <Image src={logo} alt='一天' className='h-10 w-10' />
                </Link>
                {isDesktop ? (
                    <DesktopLinks links={menuLinks} />
                ) : (
                    <HambugerMenu links={menuLinks} />
                )}
            </div>
        </header>
    );
}

type DesktopLinksProps = {
    links: LinkItem[];
};
function DesktopLinks({ links }: DesktopLinksProps) {
    return (
        <div className='flex-initial'>
            <ul className='flex flex-initial text-left'>
                {links.map((value, index) => (
                    <li key={`lg-menu-${index}`} className='p-4'>
                        <Link href={`${value.href}#top`}>{value.label} </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
