'use client';

import { DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ErrorTitleAndMessage from '@/app/components/ErrorTitleAndMessage';
import { BigIcon } from '@/app/components/Icon';
import Message from '@/app/components/Message';
import { LineIdToken, requestAccessToken } from '@/app/utiles/lineUtil';
import { db } from '@/firebase/client';
import logo from '@public/itten-logo.png';

/**
 * LINE認証後のコールバック画面
 *
 * コールバックで渡される情報からLINEIDを取得し一天のDBに保存します。
 */
const LineCallback = () => {
    const searchParams = useSearchParams();
    const codeParam = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescriptionParam = searchParams.get('error_description');
    const session = useSession();

    console.log('codeParam', codeParam);
    console.log('stateParam', stateParam);
    console.log('errorParam', errorParam);
    console.log('errorDescriptionParam', errorDescriptionParam);

    const [lineProfile, setLineProfile] = useState<LineIdToken>();

    useEffect(() => {
        if (errorParam) return;
        if (!codeParam) return;
        if (!session.data?.user.sessionStateId) return;
        if (stateParam !== session.data.user.sessionStateId) {
            console.error('不正な遷移です');
            return;
        }

        (async () => {
            console.log('LINE ID トークンを取得します');
            const lineToken = await requestAccessToken(codeParam);
            if (!lineToken) {
                console.error('不正な遷移です');
                return;
            }
            setLineProfile(lineToken);
            console.log('LINE ID トークンを取得しました', lineToken);

            const docRef = doc(db, 'members', session.data.user.uid) as DocumentReference<Member>;
            const docSnap = await getDoc(docRef);
            const memberInfo = docSnap.data();
            if (!memberInfo) {
                console.error('不正な遷移です');
                return;
            }

            memberInfo.imageUrl = lineToken.picture;
            memberInfo.lineId = lineToken.sub;
            await setDoc(docRef, memberInfo);
            console.log('LINE ID トークンを一天Webに登録しました', lineToken);
        })();
    }, [errorParam, codeParam, stateParam, session]);
    if (errorParam) {
        console.error('エラー', { error: errorParam, discription: errorDescriptionParam });
        return <LineAuthError />;
    }

    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            {lineProfile && (
                <>
                    <div className='mb-5'>
                        <Message message='LINE連係が完了しました' />
                    </div>
                    <div className='mb-3'>
                        {lineProfile.picture ? (
                            <BigIcon src={lineProfile.picture} alt='アイコン画像' />
                        ) : (
                            <BigIcon src={logo} alt='一天ロゴ' />
                        )}
                    </div>
                    <div className='mb-8'>
                        <div className='text-gray-700 text-sm font-bold mb-1'>LINE名</div>
                        <div className=''>{lineProfile.name}</div>
                    </div>
                    <div>
                        <a href='/member/mypage' className='text-blue-600 font-bold'>
                            マイページへ戻る
                        </a>
                    </div>
                </>
            )}
        </main>
    );
};

export default LineCallback;

const LineAuthError = () => {
    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            <ErrorTitleAndMessage
                title='LINE認証エラー'
                message='LINE連係のための認証に失敗しました。もう一度お試しください。'
            >
                <div>
                    <a href='/member/mypage' className='text-blue-600 font-bold'>
                        マイページへ戻る
                    </a>
                </div>
            </ErrorTitleAndMessage>
        </main>
    );
};
