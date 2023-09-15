import Image from 'next/image'
import logo from '../../../public/itten-logo.png'
import HambugerMenu from './HamburgerMenu'

/**
 * 共通のヘッダーコンポーネントです
 * @returns
 */
export default function Header() {
    const menuLinks = [{ label: 'トップ', href: '/' }]
    return (
        <header>
            <div className='fixed top-0 left-0 flex w-full bg-white px-6 z-20 h-16 shadow-md items-center justify-between'>
                <Image src={logo} alt='一天' className='h-10 w-10' />
                <HambugerMenu links={menuLinks} />
            </div>
        </header>
    )
}
