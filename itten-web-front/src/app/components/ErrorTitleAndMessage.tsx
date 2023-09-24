type ErrorTitleAndMessageProps = {
    title: string;
    message: string;
    children?: React.ReactNode;
};

const ErrorTitleAndMessage = ({ title, message, children }: ErrorTitleAndMessageProps) => {
    return (
        <div className='flex flex-col items-center max-w-md w-full'>
            <div className='pb-5 font-bold text-lg'>LINE認証エラー</div>
            <div className='mb-1'>LINE連係のための認証に失敗しました。もう一度お試しください。</div>
            {children}
        </div>
    );
};

export default ErrorTitleAndMessage;
