'use client';

import { CollectionReference, collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { SmallIcon } from '@/app/components/Icon';
import { Position, PostionLabel, positionsMaster } from '@/app/components/Postion';
import { db } from '@/firebase/client';

type DisierdMember = Member & { rank: number };

const PostionsList = () => {
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [positions, setPositions] = useState<Dictionary<DisierdMember[]>>({});

    const getAllMembers = async () => {
        const membersQuery = query(collection(db, 'members')) as CollectionReference<Member>;
        const membersDocs = await getDocs(membersQuery);
        const newMembers: Array<Member> = [];
        membersDocs.forEach((d) => {
            newMembers.push({ ...d.data(), id: d.id });
        });

        let dummyCount = 20;
        // ダミーデータを追加
        for (let i = 0; i < dummyCount; i++) {
            const dummyMember: Member = {
                id: `dummy${i}`,
                email: `dummy${i}@example.com`,
                number: `${i + 90}`,
                name: `ダミー${i}`,
                role: 'member',
                desiredPositions: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            };
            newMembers.push(dummyMember);
        }

        return newMembers;
    };

    const getAllPositions = (allMembers: Member[]): Dictionary<DisierdMember[]> => {
        const positions: Dictionary<DisierdMember[]> = {};
        Object.entries(positionsMaster).forEach(([key, _value]) => {
            if (key === '0') return; // DHは除外
            positions[key] = [];
            allMembers.forEach((m) => {
                // disierdPositionsにkeyが含まれている場合、そのindex番号をrankとして追加
                const rank = m.desiredPositions.findIndex((p) => p === key);
                if (rank >= 0) {
                    positions[key].push({ ...m, rank: rank + 1 });
                }
            });

            // positionのrankでソート
            positions[key].sort((a, b) => {
                if (a.rank < b.rank) return -1;
                if (a.rank > b.rank) return 1;
                return 0;
            });
        });

        return positions;
    };

    useEffect(() => {
        (async () => {
            const members = await getAllMembers();
            setAllMembers(members);
            setPositions(getAllPositions(members));
        })();
    }, []);

    return (
        <main className='flex flex-col items-center min-h-screen py-5 px-10'>
            <h1 className='text-xl font-bold'>希望ポジション一覧</h1>
            <div className='max-w-xl w-full'>
                {Object.entries(positions).map(([key, value]) => {
                    return (
                        <div key={key} className='mb-3'>
                            <PositionComponent
                                position={positionsMaster[key]}
                                desiredMembers={value}
                            />
                        </div>
                    );
                })}
            </div>
        </main>
    );
};

const PositionComponent = ({
    position,
    desiredMembers,
}: {
    position: Position;
    desiredMembers: DisierdMember[];
}) => {
    return (
        <div>
            <div className='flex items-center'>
                <div className='text-xl'>
                    <PostionLabel position={position} />
                </div>
                <div className='text-sm ml-2'>{`(${desiredMembers.length}人)`}</div>
            </div>

            <div className='flex overflow-x-auto my-1'>
                {desiredMembers.length === 0 ? (
                    <div className='text-sm'>希望者なし</div>
                ) : (
                    desiredMembers.map((m) => {
                        return (
                            <div key={m.id} className='flex items-center mr-2'>
                                <div
                                    key={`${position.name}_${m.id}}`}
                                    className='flex flex-col justify-center items-center mt-2 mr-3'
                                >
                                    {m.imageUrl ? (
                                        <SmallIcon src={m.imageUrl} alt={m.name} />
                                    ) : (
                                        <div className='h-8 w-8 bg-gray-600 rounded-full'></div>
                                    )}
                                    <div className='text-sm w-max'>
                                        {m.name ?? 'noname'} {`(${m.rank})`}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PostionsList;
