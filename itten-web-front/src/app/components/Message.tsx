type MessageProps = {
    message: string;
};

const Message = ({ message }: MessageProps) => {
    return <div className='py-3 px-5 bg-blue-200 border border-blue-400 rounded'>{message}</div>;
};

export default Message;
