import { Shield, Channel, Castle, Increase } from '@/shared/assets/Icons/icons';
import { IMAGES } from '@/shared/assets/Images/images';

import { Slide } from '@/features/gallery-images/model/gallery-images.types';

export const SLIDE_DEFINITIONS: Slide[] = [
  { type: 'image', src: IMAGES.logoBrainMessenger, alt: 'welcome_page.logo_alt', width: 175, height: 175, title: 'welcome_page.slide1_title', description: 'welcome_page.slide1_description' },
  { type: 'icon', icon: Shield, alt: 'welcome_page.shield_alt', title: 'welcome_page.slide2_title', description: 'welcome_page.slide2_description' },
  { type: 'icon', icon: Channel, alt: 'welcome_page.group_alt', title: 'welcome_page.slide3_title', description: 'welcome_page.slide3_description' },
  { type: 'icon', icon: Castle, alt: 'welcome_page.castle_alt', title: 'welcome_page.slide4_title', description: 'welcome_page.slide4_description' },
  { type: 'icon', icon: Increase, alt: 'welcome_page.increase_alt', title: 'welcome_page.slide5_title', description: 'welcome_page.slide5_description' },
];