import React from 'react';
import Image from 'next/image';
import Button from '@/shared/ui/Button/Button';
import { 
    Google 
} from '@/shared/assets/Icons/icons';
import { 
    useTranslation 
} from 'react-i18next';
import { variantsStylesIcons } from '@/shared/assets/variantStyles/variantStyles';

interface GoogleAuthButtonProps {
    type: 'login' | 'register'; // Prop to determine button text
    className?: string; // Optional className prop for additional styling
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ type, className }) => {
    const { t } = useTranslation();

    const buttonTextKey = type === 'login' ? 'login_page.sign_in_with_google' : 'register_page.sign_up_with_google';

    const handleGoogleLogin = () => {
        // Determine the correct redirect URL based on the environment
        const redirectUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:4000/auth/google/callback'
            : 'https://brainmessenger.onrender.com/auth/google/callback';
        window.location.href = redirectUrl;
    };

    return (
        <Button
            type="button"
            variant="secondary"
            className="w-full flex items-center justify-center gap-x-2"
            onClick={handleGoogleLogin}
        >
            <Google
                alt="Google icon" 
                width={20} 
                height={20}
                className={`${variantsStylesIcons.iconAccent} w-6 h-6`} 
            />
            <span>{t(buttonTextKey)}</span>
        </Button>
    );
};

export default GoogleAuthButton;