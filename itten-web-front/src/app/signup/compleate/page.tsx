import Link from 'next/link';
import Message from '@/app/components/Message';

const SignUpComp = () => {
    return (
        <main className='flex min-h-screen flex-col items-center'>
            <div className='max-w-md w-full'>
                <div className='my-10'>
                    <Message message='アカウントの登録が完了しました。以下のリンクからログインしてください。' />
                </div>
                <div className='text-center text-xl'>
                    <Link href='/signin'>{'ログインはこちら >'}</Link>
                </div>
            </div>
        </main>
    );
};

export default SignUpComp;
