'use client';

import { FC, useState } from 'react';
import { HelpMember } from '../../components/Schedules/schedule';

type DeleteScheduleConfirmProps = {
    close: () => void;
    onSubmit: () => Promise<void>;
};

const DeleteScheduleConfirm: FC<DeleteScheduleConfirmProps> = ({ close, onSubmit }) => {
    const [disabled, setDisabled] = useState(false);

    return (
        <div>
            <h1 className='mb-2 text-lg'>スケジュールを削除していいですか？</h1>

            <div className='flex w-full space-x-3'>
                <button
                    onClick={close}
                    className='w-1/2 p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600'
                >
                    閉じる
                </button>
                <button
                    onClick={onSubmit}
                    className='w-1/2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={disabled}
                >
                    削除
                </button>
            </div>
        </div>
    );
};

export default DeleteScheduleConfirm;
