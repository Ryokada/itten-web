import Link from 'next/link';

const AdminTop = () => {
    const links = [
        { label: '管理トップ', href: '/admin' },
        { label: '希望ポジション一覧', href: '/admin/positions' },
    ];
    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            <h1 className='mb-8 text-xl font-bold'>管理者ページ</h1>
            <div className=''>
                <ul className='text-left'>
                    {links.map((value, index) => (
                        <li key={`lg-menu-${index}`} className='mb-4'>
                            <Link href={`${value.href}#top`}>{value.label} </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};

export default AdminTop;
