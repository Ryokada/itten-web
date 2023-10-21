'use client';

import { DocumentReference, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Message from '@/app/components/Message';
import { positionsMaster } from '@/app/components/Postion';
import Spinner from '@/app/components/Spinner';
import { db } from '@/firebase/client';

type MemberProfileInput = {
    name: string;
    imageUrl?: string;
    desiredPositions: Array<string>;
    positionComment?: string;
};

/**
 * プロフィール更新画面
 */
const MypageEdit = () => {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [memberDocRef, setMemberDocRef] = useState<DocumentReference<Member>>();
    const [member, setMember] = useState<Member>();
    const [positionInputs, setPositionInputs] = useState<string[]>([]);
    const [disabledSubmit, setDisabledSubmit] = useState(false);
    const [message, setMessage] = useState<string>('');
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MemberProfileInput>();

    useEffect(() => {
        if (!session) return;
        // TODO 共通化
        const docRef = doc(db, 'members', session.user.uid) as DocumentReference<Member>;
        setMemberDocRef(docRef);

        (async () => {
            const docSnap = await getDoc(docRef);
            const memberInfo = docSnap.data();
            if (memberInfo) {
                setMember(memberInfo);
                setPositionInputs([...memberInfo.desiredPositions]);
            }
        })();
    }, [session]);

    const addPositionInput = () => {
        setPositionInputs([...positionInputs, '']);
    };

    const handlePositionChange = (index: number, value: string) => {
        const updatedPositions = [...positionInputs];
        updatedPositions[index] = value;
        setPositionInputs(updatedPositions);
    };

    const onSubmit: SubmitHandler<MemberProfileInput> = async (data) => {
        if (!session || !member || !data || !memberDocRef) return;

        try {
            setDisabledSubmit(true);
            const updatedPositions = [...positionInputs];
            data.desiredPositions = updatedPositions.filter((i) => i !== '');
            console.log(data);

            const updateMember: Member = {
                ...member,
                name: data.name ?? member.name,
                desiredPositions: data.desiredPositions,
                positionComment: data.positionComment,
            };
            await setDoc(memberDocRef, updateMember);
            update({
                user: { ...session.user, name: updateMember.name },
            });
            setMessage('変更しました');
            router.push('/member/mypage');
            router.refresh();
        } catch (e) {
            console.error(e);
            setMessage('変更に失敗しました');
        } finally {
            setDisabledSubmit(false);
        }
    };

    if (!session || !member) {
        return (
            <div className='p-10'>
                <Spinner />
            </div>
        );
    }

    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full'>
                {message && (
                    <div className='mb-3'>
                        <Message message={message} />
                    </div>
                )}
                <div className='flex flex-col text-lg mb-1'>
                    <div>
                        <span className='mr-2'>背番号:</span>
                        <span className='font-bold'>{member?.number}</span>
                    </div>
                    <div>
                        <span className='mr-2'>email:</span>
                        <span className='font-bold'>{session?.user.email}</span>
                    </div>
                </div>
                <p className='text-xs text-gray-500 mb-4'>
                    背番号、メールアドレスは変えられません。
                    <br />
                    変えたい人はお問い合わせください。
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className='p-2'>
                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='name'
                        >
                            名前
                        </label>
                        <input
                            type='text'
                            defaultValue={member?.name}
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                            {...register('name', { required: true, maxLength: 50 })}
                        />
                        {errors.name && <span className='text-red-500 text-xs'>必須です</span>}
                    </div>

                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='desiredPositions'
                        >
                            希望ポジション
                        </label>
                        {positionInputs.map((position, index) => (
                            <div key={index} className='mb-2 flex items-center'>
                                <span className='mr-2'>{index + 1}.</span>
                                <select
                                    value={position}
                                    onChange={(e) => handlePositionChange(index, e.target.value)}
                                    className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                                >
                                    <option value=''>{`第${index + 1}希望`}</option>
                                    {Object.entries(positionsMaster).map(([key, value]) => (
                                        <option
                                            key={key}
                                            value={key}
                                            style={{ color: value.color }}
                                        >
                                            {value.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                        <button type='button' onClick={addPositionInput} className='text-blue-500'>
                            {`＋第${positionInputs.length + 1}希望を追加`}
                        </button>
                    </div>

                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 text-sm font-bold mb-2'
                            htmlFor='positionComment'
                        >
                            ポジションについてコメント
                        </label>
                        <textarea
                            defaultValue={member?.positionComment}
                            rows={5}
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm'
                            {...register('positionComment', { required: false, maxLength: 500 })}
                        ></textarea>
                        {errors.positionComment && (
                            <p className='text-red-600'>{errors.positionComment.message}</p>
                        )}
                    </div>

                    <button
                        type='submit'
                        disabled={disabledSubmit}
                        className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-30'
                    >
                        変更
                    </button>
                </form>
            </div>
        </main>
    );
};

export default MypageEdit;
