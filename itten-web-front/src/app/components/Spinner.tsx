const Spinner = ({ color = 'border-blue-500' }: { color?: string }) => {
    return (
        <div className='my-20 flex justify-center'>
            <div
                className={`h-10 w-10 animate-spin rounded-full border-4 ${color} border-t-transparent`}
            />
        </div>
    );
};

export const SmallSpinner = ({ color = 'border-blue-500' }: { color?: string }) => {
    return (
        <div className='my-1 flex justify-center'>
            <div
                className={`h-5 w-5 animate-spin rounded-full border-2 ${color} border-t-transparent`}
            />
        </div>
    );
};

export default Spinner;
