'use client';

import { DocumentReference, doc, getDoc } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';
import { BigIcon } from '@/app/components/Icon';
import { PostionLabel } from '@/app/components/Postion';
import Spinner from '@/app/components/Spinner';
import { db } from '@/firebase/client';
import logo from '@public/itten-logo.png';

type MemberPageProps = {
    params: {
        memberId: string;
    };
};

const MemberPage: FC<MemberPageProps> = ({ params }) => {
    const [member, setMember] = useState<Member>();

    useEffect(() => {
        if (!params.memberId) return;

        // TODO 共通化
        const docRef = doc(db, 'members', params.memberId) as DocumentReference<Member>;

        (async () => {
            const docSnap = await getDoc(docRef);
            const memberInfo = docSnap.data();
            if (memberInfo) {
                setMember(memberInfo);
            }
        })();
    }, [params.memberId]);

    if (!member) {
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
        </main>
    );
};

export default MemberPage;
