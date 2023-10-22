import React, { FC, useEffect } from 'react';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Dialog: FC<DialogProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const dialog = document.getElementById('dialog');
            if (dialog && !dialog.contains(event.target as Node)) {
                onClose();
            }
        };

        let timer: NodeJS.Timeout;
        if (isOpen) {
            timer = setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            }, 0);
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('click', handleOutsideClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50'>
            <div id='dialog' className='mx-10 bg-white p-4 rounded min-w-[50%]'>
                {children}
            </div>
        </div>
    );
};

export default Dialog;
