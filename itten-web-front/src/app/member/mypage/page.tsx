import { CollectionReference } from 'firebase-admin/firestore';
import { PageNotFoundError } from 'next/dist/shared/lib/utils';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BigIcon } from '@/app/components/Icon';
import { PostionLabel } from '@/app/components/Postion';
import { dbAdmin } from '@/firebase/admin';
import logo from '@public/itten-logo.png';

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

    if (!memberInfo) {
        return <main className='flex flex-col items-center min-h-screen p-24'>ロード中</main>;
    }

    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full space-y-8'>
                <div className='flex items-center'>
                    <div className='mr-10'>
                        {memberInfo.imageUrl ? (
                            <BigIcon src={memberInfo.imageUrl} alt='アイコン画像' />
                        ) : (
                            <BigIcon src={logo} alt='ロゴ' />
                        )}
                    </div>
                    <div className='text-2xl font-bold mr-3'>{memberInfo.number}</div>
                    <div className='text-xl'>{memberInfo.name}</div>
                </div>
                <div className='text-lg'>{session.user.email}</div>
                <div>
                    <p className='text-xs'>希望ポジション</p>
                    <div className='text-lg flex space-x-2 mb-1'>
                        {memberInfo.desiredPositions.map((p, i) => {
                            return (
                                <div key={p}>
                                    {i + 1}.
                                    <PostionLabel positionNumber={p} />
                                </div>
                            );
                        })}
                    </div>
                    <div className='text-xs rounded bg-slate-300 p-2 h-20'>
                        <p className='text-clip overflow-scroll w-full h-full'>
                            {memberInfo.positionComment}
                        </p>
                    </div>
                </div>
            </div>
            <Link href='/member/mypage/edit' className='my-3 text-blue-600 font-bold'>
                {'変更はこちら >'}
            </Link>
        </main>
    );
};

export default Mypage;
