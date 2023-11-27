import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import Link from 'next/link';

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
            <Image
                src={src}
                alt={alt}
                className='w-full h-full object-cover'
                width={128}
                height={128}
            />
        </div>
    );
};

/**
 * 小さいアイコンコンポーネント
 */
export const SmallIcon = ({ src, alt }: IconProps) => {
    return (
        <div className='rounded-full w-8 h-8 overflow-hidden'>
            <Image
                src={src}
                alt={alt}
                className='w-full h-full object-cover'
                width={128}
                height={128}
            />
        </div>
    );
};

type MemberIconProps = {
    imageUrl?: string;
    name: string;
    id: string;
};

/**
 * メンバーのアイコンコンポーネント
 */
export const MemberIcon = ({ imageUrl, name, id }: MemberIconProps) => {
    return (
        <Link href={`/member/u/${id}#top`}>
            {imageUrl ? (
                <SmallIcon src={imageUrl} alt={name ?? 'noname'} />
            ) : (
                <div className='h-8 w-8 bg-gray-600 rounded-full'></div>
            )}
        </Link>
    );
};
