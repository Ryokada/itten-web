import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

const useIsDesktop = () => {
    // 何故かisDesktopOrLaptopを使うとエラー（Warning: Prop `className` did not match. ）が出るのでステートを挟む。
    const [isDesktop, setIsDesktop] = useState(false);
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1024px)' }); //1024 = lg

    useEffect(() => {
        setIsDesktop(isDesktopOrLaptop);
    }, [isDesktopOrLaptop]);

    return [isDesktop, setIsDesktop];
};

export default useIsDesktop;
