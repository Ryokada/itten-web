'use client';

import { FC, useState } from 'react';
import { HelpMember } from './schedule';

type HelpMemberFormProps = {
    close: () => void;
    onSubmit: (members: HelpMember[]) => Promise<void>;
    members: HelpMember[];
};

const HeloMemberForm: FC<HelpMemberFormProps> = ({ close, onSubmit, members }) => {
    const [disabled, setDisabled] = useState(false);
    const [formMembers, setFormMembers] = useState<HelpMember[]>(members);

    const addMember = () => {
        const newId = (
            formMembers.length > 0 ? Math.max(...formMembers.map((m) => Number(m.id))) + 1 : 1
        ).toString();
        setFormMembers([...formMembers, { id: newId, name: '', memo: '' }]);
    };

    const removeMember = (id: string) => {
        const newMembers = formMembers.filter((member) => member.id !== id);
        setFormMembers(newMembers);
    };

    const updateMember = (id: string, key: keyof Omit<HelpMember, 'id'>, value: string) => {
        const newMembers = formMembers.map((member) =>
            member.id === id ? { ...member, [key]: value } : member,
        );
        setFormMembers(newMembers);
    };

    const onClickRemove = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        removeMember(id);
    };

    const handleClose = () => {
        setFormMembers(members);
        close();
    };

    const onClickSubmit = async () => {
        setDisabled(true);
        try {
            const safetyMembers = formMembers.filter((member) => member.name !== '');
            await onSubmit(safetyMembers);
        } finally {
            setDisabled(false);
        }
    };

    return (
        <div>
            <h1 className='mb-2 text-lg'>助っ人メンバー編集</h1>
            <div className='mx-2 my-2 '>
                {formMembers.map((member) => (
                    <div key={member.id} className='mb-1'>
                        <input
                            className='p-2 border rounded-md mr-1'
                            type='text'
                            placeholder='名前'
                            value={member.name}
                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                        />
                        <input
                            className='p-2 border rounded-md mr-2'
                            type='text'
                            placeholder='メモ'
                            value={member.memo}
                            onChange={(e) => updateMember(member.id, 'memo', e.target.value)}
                        />
                        <button onClick={(e) => onClickRemove(e, member.id)}>削除</button>
                    </div>
                ))}
            </div>
            <button className='my-2' onClick={addMember}>
                ＋メンバーを追加する
            </button>

            <div className='flex w-full space-x-3'>
                <button
                    onClick={handleClose}
                    className='w-1/2 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600'
                >
                    閉じる
                </button>
                <button
                    onClick={onClickSubmit}
                    className='w-1/2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={disabled}
                >
                    更新
                </button>
            </div>
        </div>
    );
};

export default HeloMemberForm;
