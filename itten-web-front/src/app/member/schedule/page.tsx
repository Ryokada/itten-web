import { CollectionReference } from 'firebase-admin/firestore';
import type { Metadata } from 'next';
import { dbAdmin } from '@/firebase/admin';

export const metadata: Metadata = {
    title: '一天スケジュール',
    description: '一天メンバー用のスケジュールです',
};

const Schedule = async () => {
    const schedulesCollection = dbAdmin.collection('schedules') as CollectionReference<Schedule>;
    const schedules = (
        await schedulesCollection.orderBy('startTimestamp').startAt(new Date()).get()
    ).docs;

    console.log(
        'schedules',
        schedules.map((s) => s.data()),
    );
    return (
        <main className='min-h-screen py-5 px-10'>
            <div className='max-w-xl w-full'>
                <h1>スケジュール</h1>
            </div>
        </main>
    );
};

export default Schedule;
