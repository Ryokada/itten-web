'use client';

import { DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BigIcon } from '@/app/components/Icon';
import { PostionLabel, positionsMaster } from '@/app/components/Postion';
import Spinner from '@/app/components/Spinner';
import { buildLineAuthLInkUrl } from '@/app/utiles/lineUtil';
import { db } from '@/firebase/client';
import logo from '@public/itten-logo.png';
import lineLogo from '@public/line/btn_base.png';
import lineLinkLogo from '@public/line/btn_login_base.png';

/**
 * メンバー用のマイページコンポーネントです
 */
const Mypage = () => {
    const { data: session } = useSession();
    const [member, setMember] = useState<Member>();
    const [lineLink, setLineLink] = useState<string>();

    useEffect(() => {
        if (!session) return;
        // TODO 共通化
        const docRef = doc(db, 'members', session.user.uid) as DocumentReference<Member>;
        setLineLink(buildLineAuthLInkUrl(session.user.sessionStateId));

        (async () => {
            const docSnap = await getDoc(docRef);
            const memberInfo = docSnap.data();
            if (memberInfo) {
                setMember(memberInfo);
            }
        })();
    }, [session]);

    if (!session || !member) {
        return (
            <main className='flex flex-col items-center min-h-screen p-24'>
                <Spinner />
            </main>
        );
    }

    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full space-y-5'>
                <div className='flex items-center'>
                    <div className='mr-10'>
                        {member.imageUrl ? (
                            <BigIcon src={member.imageUrl} alt='アイコン画像' />
                        ) : (
                            <BigIcon src={logo} alt='ロゴ' />
                        )}
                    </div>
                    <div>
                        <div className=''>
                            <div className='text-xl font-bold mr-3'>No. {member.number}</div>
                            <div className='text-3xl'>{member.name}</div>
                            {member.lineName && (
                                <div className='text-gray-600'>LINE: {member.lineName}</div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='mt-5'>
                    {member.lineId ? (
                        <>
                            <div className='flex items-center'>
                                <Image src={lineLogo} alt='line-login' className='w-5 h-5 mr-2' />
                                <p className='mr-1 text-gray-700 text-sm'>
                                    {member.lineName && `(${member.lineName})`} 連係済み
                                </p>
                            </div>
                            <a href={lineLink} className='text-xs text-gray-500 cursor-pointer'>
                                {'再連携はこちら >'}
                            </a>
                        </>
                    ) : (
                        <a href={lineLink}>
                            <Image src={lineLinkLogo} alt='line-login' className='w-1/5 h-1/5' />
                        </a>
                    )}
                </div>
                <div className='text-lg'>{session.user.email}</div>
                <div>
                    <p className='text-sm'>希望ポジション</p>
                    <div className='text-lg flex space-x-2 mb-3'>
                        {member.desiredPositions.map((p, i) => {
                            return (
                                <div key={p}>
                                    {i + 1}.
                                    <PostionLabel positionNumber={p} />
                                </div>
                            );
                        })}
                    </div>
                    {member.positionComment && (
                        <div className='text-xs rounded bg-slate-300 p-2 h-24'>
                            <p className='text-clip overflow-scroll w-full h-full'>
                                {member.positionComment}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <Link href='/member/mypage/edit' className='my-3 text-blue-600 font-bold'>
                {'変更はこちら >'}
            </Link>
            <Link href='/signout' className='my-3 text-gray-600 font-bold'>
                {'ログアウト >'}
            </Link>
            <Link
                href={`/signin/forget?m=${session.user.email}`}
                className='my-3 text-gray-600 font-bold'
            >
                {'パスワード変更 >'}
            </Link>
        </main>
    );
};

export default Mypage;
