import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

export type IconProps = {
    src: string | StaticImport;
    alt: string;
};

/**
 * 大きいアイコンコンポーネント
 */
export const BigIcon = ({ src, alt }: IconProps) => {
    return (
        <div className='rounded-full w-32 h-32 overflow-hidden'>
            <Image src={src} alt={alt} className='w-full h-full object-cover' />
        </div>
    );
};
