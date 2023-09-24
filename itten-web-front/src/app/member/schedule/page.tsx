import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '一天スケジュール',
    description: '一天メンバー用のスケジュールです',
};

const Schedule = () => {
    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full'>
                <h1>スケジュール</h1>
            </div>
        </main>
    );
};

export default Schedule;
