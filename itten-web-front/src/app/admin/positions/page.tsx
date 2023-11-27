'use client';

import { CollectionReference, collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { MemberIcon, SmallIcon } from '@/app/components/Icon';
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
                            <div
                                key={`${position.name}_${m.id}}`}
                                className='flex flex-col justify-center items-center mt-2 mr-3'
                            >
                                <MemberIcon id={m.id} imageUrl={m.imageUrl} name={m.name} />
                                <div className='flex items-end text-sm w-max'>
                                    {m.name ?? 'noname'}
                                    <div className='text-xs'>{`(${m.rank})`}</div>
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
