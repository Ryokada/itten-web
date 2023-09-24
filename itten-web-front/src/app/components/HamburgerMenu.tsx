'use client';
import Link from 'next/link';
import React, { useState } from 'react';

// Props の型定義
type HamburgerMenuProps = {
    links: LinkItem[];
};

export default function HambugerMenu({ links }: HamburgerMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenuOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <div
                className={
                    isOpen
                        ? 'text-left fixed bg-slate-50 right-0 top-0 w-8/12 h-screen flex flex-col justify-start pt-8 px-3 ease-linear duration-300'
                        : 'fixed right-[-100%] ease-linear duration-300'
                }
            >
                <ul className='mt-6'>
                    {links.map((value, index) => (
                        <li key={`md-menu-${index}`} className='p-4'>
                            <Link href={value.href} onClick={() => setIsOpen(false)}>
                                {value.label}{' '}
                            </Link>
                        </li>
                    ))}
                    <li key='lg-menu-close'>
                        <p onClick={toggleMenuOpen} className='p-4 text-gray-600 cursor-pointer'>
                            閉じる
                        </p>
                    </li>
                </ul>
            </div>
            <button onClick={toggleMenuOpen} className='z-20 space-y-2 h-5.5'>
                <div
                    className={
                        isOpen
                            ? 'w-8 h-0.5 bg-black translate-y-2.5 rotate-45 transition duration-500 ease-in-out'
                            : 'w-8 h-0.5 bg-black transition duration-500 ease-in-out'
                    }
                />
                <div
                    className={
                        isOpen
                            ? 'opacity-0 transition duration-500 ease-in-out'
                            : 'w-8 h-0.5 bg-black transition duration-500 ease-in-out'
                    }
                />
                <div
                    className={
                        isOpen
                            ? 'w-8 h-0.5 bg-black -rotate-45 transition duration-500 ease-in-out'
                            : 'w-8 h-0.5 bg-black transition duration-500 ease-in-out'
                    }
                />
            </button>
        </div>
    );
}
