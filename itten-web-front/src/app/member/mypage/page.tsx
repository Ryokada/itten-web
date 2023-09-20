import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * メンバー用のマイページコンポーネントです
 */
const Mypage = async () => {
    const session = await getServerSession(authOptions)
    console.log('mypage', session)
    return (
        <main className='flex min-h-screen flex-col items-center p-24'>
            <div>Hello ITTEN こんにちは</div>
            <div className='max-w-md w-full space-y-8'>
                <div className='flex justify-between'>
                    <div>メールアドレス</div>
                    <div>{session?.user.email}</div>
                </div>
            </div>
        </main>
    )
}

export default Mypage
