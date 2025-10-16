import { Shield, Channel, Castle, Increase, BurgerMenu } from '@/shared/assets/Icons/icons';
import { IMAGES } from '@/shared/assets/Images/images';

export const SLIDE_DEFINITIONS = [
  { type: 'image', src: IMAGES.logoBrainMessenger, altKey: 'welcome_page.logo_alt', width: 175, height: 175, titleKey: 'welcome_page.slide1_title', descriptionKey: 'welcome_page.slide1_description' },
  { type: 'icon', IconComponent: Shield, altKey: 'welcome_page.shield_alt', titleKey: 'welcome_page.slide2_title', descriptionKey: 'welcome_page.slide2_description' },
  { type: 'icon', IconComponent: Channel, altKey: 'welcome_page.group_alt', titleKey: 'welcome_page.slide3_title', descriptionKey: 'welcome_page.slide3_description' },
  { type: 'icon', IconComponent: Castle, altKey: 'welcome_page.castle_alt', titleKey: 'welcome_page.slide4_title', descriptionKey: 'welcome_page.slide4_description' },
  { type: 'icon', IconComponent: Increase, altKey: 'welcome_page.increase_alt', titleKey: 'welcome_page.slide5_title', descriptionKey: 'welcome_page.slide5_description' },
];