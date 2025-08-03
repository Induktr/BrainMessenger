import React from 'react';
import Image from 'next/image';
import { 
  Shield, 
  Channel, 
  Castle, 
  Increase 
} from '@/shared/assets/Icons/icons';
import { 
  IMAGES 
} from '@/shared/assets/Images/images';
import { 
  useTranslation 
} from 'react-i18next';

interface SlideLayoutProps {
    image: string;
    title: string;
    description: string;
}

export const SlideLayout = () => {
    const { t } = useTranslation();

    const slides = [
        {
          image: <Image src={IMAGES.logoBrainMessenger} alt={t('welcome_page.logo_alt')} className="logo-container-size" width={175} height={175}></Image>, // Temporarily commented out for debugging
          title: t('welcome_page.slide1_title'),
          description: t('welcome_page.slide1_description'),
          // Add more slides as needed based on the mockup/requirements
        },
        {
          icon: <Shield alt={t('welcome_page.shield_alt')} className="icon-container-size" width={120} height={120}></Shield>,
          title: t('welcome_page.slide2_title'),
          description: t('welcome_page.slide2_description'),
        },
        {
          icon: <Channel alt={t('welcome_page.group_alt')} className="icon-container-size" width={120} height={120}></Channel>,
          title: t('welcome_page.slide3_title'),
          description: t('welcome_page.slide3_description'),
        },
        {
          icon: <Castle alt={t('welcome_page.castle_alt')} className="icon-container-size" width={120} height={120}></Castle>,
          title: t('welcome_page.slide4_title'),
          description: t('welcome_page.slide4_description'),
        },
        {
          icon: <Increase alt={t('welcome_page.increase_alt')} className="icon-container-size" width={120} height={120}></Increase>,
          title: t('welcome_page.slide5_title'),
          description: t('welcome_page.slide5_description'),
        },
    ];
}

export default SlideLayout;
