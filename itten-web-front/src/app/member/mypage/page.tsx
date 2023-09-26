import { CollectionReference } from 'firebase-admin/firestore';
import type { Metadata } from 'next';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BigIcon } from '@/app/components/Icon';
import { PostionLabel } from '@/app/components/Postion';
import { buildLineAuthLInkUrl } from '@/app/utiles/lineUtil';
import { dbAdmin } from '@/firebase/admin';
import logo from '@public/itten-logo.png';
import lineLogo from '@public/line/btn_base.png';
import lineLinkLogo from '@public/line/btn_login_base.png';

export const metadata: Metadata = {
    title: '一天マイページ',
    description: '一天メンバー用のマイページです',
};

/**
 * メンバー用のマイページコンポーネントです
 */
const Mypage = async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new PageNotFoundError('MyPage');
    }

    // TODO 共通化
    const memberCollection = dbAdmin.collection('members') as CollectionReference<Member>;
    const userDocRef = memberCollection.doc(session?.user.uid);
    const docSnap = await userDocRef.get();
    const memberInfo = docSnap.data();

    const lineLink = buildLineAuthLInkUrl(session.user.sessionStateId);

    if (!memberInfo) {
        return <main className='flex flex-col items-center min-h-screen p-24'>ロード中</main>;
    }

    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full space-y-5'>
                <div className='flex items-center'>
                    <div className='mr-10'>
                        {memberInfo.imageUrl ? (
                            <BigIcon src={memberInfo.imageUrl} alt='アイコン画像' />
                        ) : (
                            <BigIcon src={logo} alt='ロゴ' />
                        )}
                    </div>
                    <div>
                        <div className=''>
                            <div className='text-xl font-bold mr-3'>No. {memberInfo.number}</div>
                            <div className='text-3xl'>{memberInfo.name}</div>
                        </div>
                    </div>
                </div>
                <div className='mt-5'>
                    {memberInfo.lineId ? (
                        <>
                            <div className='flex items-center'>
                                <Image src={lineLogo} alt='line-login' className='w-5 h-5 mr-2' />
                                <p className='mr-1 text-gray-700 text-sm'>連係済み</p>
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
                        {memberInfo.desiredPositions.map((p, i) => {
                            return (
                                <div key={p}>
                                    {i + 1}.
                                    <PostionLabel positionNumber={p} />
                                </div>
                            );
                        })}
                    </div>
                    {memberInfo.positionComment && (
                        <div className='text-xs rounded bg-slate-300 p-2 h-24'>
                            <p className='text-clip overflow-scroll w-full h-full'>
                                {memberInfo.positionComment}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <Link href='/member/mypage/edit' className='my-3 text-blue-600 font-bold'>
                {'変更はこちら >'}
            </Link>
        </main>
    );
};

export default Mypage;
