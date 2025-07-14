import React from 'react';
import Image from 'next/image';
import Button from '@/shared/ui/Button/Button';
import { ICONS } from '@/shared/assets/Icons/icons';
import { useTranslation } from 'react-i18next';

interface GoogleAuthButtonProps {
    type: 'login' | 'register'; // Prop to determine button text
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ type }) => {
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
            className="sign-with-google-button" // Apply the CSS module class
            onClick={handleGoogleLogin}
        >
            <Image src={ICONS.google} alt="Google icon" width={20} height={20} />
            <span>{t(buttonTextKey)}</span>
        </Button>
    );
};

export default GoogleAuthButton;