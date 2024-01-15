'use client';

// @ts-ignore
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import Image from 'next/image';
import React from 'react';
import useIsDesktop from '../hooks/useIsDesktop';
import Image1 from '@public/images/photos/home/chacher_800.jpg';
import Image2 from '@public/images/photos/home/defence_800.jpg';
import Image3 from '@public/images/photos/home/kuni_800.jpg';
import Image4 from '@public/images/photos/home/moundmtg_800.jpg';
import Image5 from '@public/images/photos/home/no99_800.jpg';
import Image6 from '@public/images/photos/home/ohta_800.jpg';
import Image7 from '@public/images/photos/home/pitcher_800.jpg';
import Image8 from '@public/images/photos/home/zackey_800.jpg';
import '@splidejs/splide/css';

const images = [Image1, Image2, Image3, Image4, Image5, Image6, Image7, Image8];

const HomeImageSlider = () => {
    const [isDesktop] = useIsDesktop();
    return (
        <Splide
            aria-label='ホーム画像スライダー'
            extensions={{ AutoScroll }}
            options={{
                arrows: false,
                pagination: false,
                type: 'loop', // スライドのループを有効
                focus: 'center',
                drag: false,
                pauseOnHover: false,
                perPage: isDesktop ? 3 : 1,
                autoScroll: {
                    speed: 1,
                },
            }}
        >
            {images.map((image, index) => (
                <SplideSlide key={`a-${index}`}>
                    <Image
                        priority={true}
                        loading='eager'
                        id={`a-${index}`}
                        src={image}
                        alt='一天'
                        width={800}
                        height={450}
                    />
                </SplideSlide>
            ))}
        </Splide>
    );
};

export default HomeImageSlider;
