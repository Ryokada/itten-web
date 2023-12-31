'use client';

import AOS from 'aos';
import React, { FC, useEffect } from 'react';

import 'aos/dist/aos.css';

type AosLayoutProps = {
    children: React.ReactNode;
};

const AosLayout: FC<AosLayoutProps> = ({ children }) => {
    useEffect(() => {
        AOS.init({
            once: true,
            duration: 1000,
            easing: 'ease-in-out-sine',
        });
    });

    return children;
};

export default AosLayout;
