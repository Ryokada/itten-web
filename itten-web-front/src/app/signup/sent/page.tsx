import Message from '@/app/components/Message';

const SignUpSent = () => {
    return (
        <main className='flex min-h-screen flex-col items-center'>
            <div className='max-w-md w-full p-5'>
                <div className='my-10'>
                    <Message message='メールアドレスの確認メールを送信しました' />
                </div>
                <div className='leading-relaxed p-3'>
                    設定したメールアドレスに確認メールを送信しました。メールを確認してメール内のリンクにアクセスしてください。
                    <br />
                    <br />
                    来ない人は迷惑メールフォルダなどを確認してください。
                    <br />
                    それでも来ない人は岡田に連絡してください。
                </div>
            </div>
        </main>
    );
};

export default SignUpSent;
