import ClientComponent from './ClientComponent';
import ServerComponent from './ServerComponent';

const Dummy = () => {
    return (
        <main className='flex min-h-screen flex-col items-center p-24'>
            <ClientComponent />
            <ServerComponent />
        </main>
    );
};

export default Dummy;
