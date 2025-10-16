'use client';

import React, { 
  useState, 
  useEffect 
} from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import { 
  useTheme 
} from '@/app/providers/ThemeProvider';
import CreateChannelModal from '@/features/create-chat/ui/CreateChannelModal';
import CreateGroupModal from '@/features/create-chat/ui/CreateGroupModal';
import { 
  SettingsMenu, 
  Channel, 
  Night, 
  Group, 
  Bell, 
  SupportMenu,
} from '@/shared/assets/Icons/icons'; // Keep import for now, might remove later
import { 
  useAuth 
} from '@/app/providers/AuthProvider/AuthContext'; // Import useAuth hook
import { 
  generateAvatarData 
} from '@/entities/user/model/user-generate-avatar'; // Import avatar utility
import AllNotificationsModal from '@/features/manage-notifications/ui/AllNotificationsModal'; // Import AllNotificationsModal
import { 
  useNotification 
} from '@/app/providers/NotificationProvider/NotificationContext'; // Import useNotification hook
import { 
  Notification 
} from '@/features/manage-notifications/model/notification.types'; // Import Notification type
import Support from '@/features/manage-settings/ui/Support';
import {
  variantsStylesIcons
} from '@/shared/assets/VariantStyles/variantStyles';
import MenuItem from '@/shared/ui/MenuItem/MenuItem';
import Modal from '@/shared/ui/Modal/Modal'; // Import Modal component
 
interface SidebarMenuWidgetProps {
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleNotification: () => void;
}

const SidebarMenuWidget: React.FC<SidebarMenuWidgetProps> = ({ onOpenSettings, onToggleNotification }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isAllNotificationsModalOpen, setIsAllNotificationsModalOpen] = useState(false); // State for AllNotificationsModal
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]); // State to store all notifications
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false); // State for SupportModal

  const { user, queryLoading, logout } = useAuth(); // Get user, queryLoading, and logout from context
  const { notification, clearNotification } = useNotification(); // Get notification and clearNotification from context

  // Effect to add new notifications to the list
  useEffect(() => {
    if (notification) {
      setAllNotifications((prevNotifications) => [notification, ...prevNotifications]);
      clearNotification(); // Clear the current notification after adding to the list
    }
  }, [notification, clearNotification]);
 
  // Generate avatar data
  const avatarData = generateAvatarData(user?.name);
 
  // Optional: Show loading state or placeholder if user data is queryLoading
  if (queryLoading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-disabled rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-disabled rounded w-3/4"></div>
            <div className="h-3 bg-disabled rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-disabled rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
 
  const handleOpenCreateChannelModal = () => {
    setIsCreateChannelModalOpen(true);
  };

  const handleCloseCreateChannelModal = () => {
    setIsCreateChannelModalOpen(false);
  };

  const handleCloseSupportModal = () => {
    setIsSupportModalOpen(false);
  };

  const handleBackSupportModal = () => {
    setIsSupportModalOpen(false);
  };

  const handleCreateChannel = (channelName: string, channelDescription: string) => {
    // Placeholder for channel creation logic
    // Placeholder for channel creation logic
    // console.log('Creating channel:', channelName, channelDescription); // Removed console.log
    handleCloseCreateChannelModal();
    // In a real application, you would dispatch an action or call an API here
    // After successful creation, you might want to update the chat list
  };

  const handleOpenCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleCloseCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
  };

  return (
    <div className="h-full p-4 bg-[var(--color-surface)] w-screen max-w-[250px] sm:max-w-[400px] md:max-w-[400px] lg:max-w-[456px] text-[var(--color-text-primary)]">
      {/* User Profile Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div
          className="w-[60px] h-[60px] lg:w-[85px] lg:h-[85px] sm:w-[60px] sm:h-[60px] mx-auto mt-12 mb-3 col-span-2 rounded-full text-xl text-[var(--color-text-primary)] bg-[var(--color-disabled)]"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User Avatar" className="rounded-full" />
          ) : (
            <span>{avatarData.letter}</span>
          )}
        </div>
        <div className="mx-auto text-center space-y-3">
          <h2 className="text-[20px] lg:text-2xl sm:text-[20px] font-light">{user?.name || t('sidebar.guest')}</h2>
          <p className="text-sm lg:text-base sm:text-sm  text-[var(--color-text-secondary)]">{`@${user?.username}` || t('sidebar.na')}</p>
        </div>
      </div>
      <div className="border-1 border-[var(--color-gradient-start)] mb-8"></div>
      {/* Menu Options */}
      <div className="flex flex-col items-center justify-center mx-auto">
        <nav className={`${variantsStylesIcons.iconAccent} flex-1 space-y-2 text-sm lg:text-base sm:text-sm`}>
          <MenuItem icon={<SettingsMenu className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />} text={t('sidebar.settings')} onClick={onOpenSettings} />
          <MenuItem icon={<Channel className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />} text={t('sidebar.createChannel')} onClick={handleOpenCreateChannelModal} />
          <MenuItem icon={<Group className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />} text={t('sidebar.createGroup')} onClick={handleOpenCreateGroupModal} />
          <MenuItem icon={<Night className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />} text={theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.nightMode')} onClick={toggleTheme} />
          <MenuItem icon={<Bell className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />} text={t('sidebar.allNotifications')} onClick={() => setIsAllNotificationsModalOpen(true)} />
          <MenuItem icon={<SupportMenu className="w-5 h-5 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />} text={t('sidebar.support')} onClick={() => setIsSupportModalOpen(true)} />
        </nav>

      </div>

      {isSupportModalOpen && (
        <Modal isOpen={isSupportModalOpen} onClose={handleCloseSupportModal}>
          <Support
            onBack={handleBackSupportModal}
            onClose={handleCloseSupportModal}
            isOpen={isSupportModalOpen}
          />
        </Modal>
      )}

      {/* All Notifications Modal */}
      <AllNotificationsModal
        isOpen={isAllNotificationsModalOpen}
        onClose={() => setIsAllNotificationsModalOpen(false)}
        notifications={allNotifications}
      />

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={handleCloseCreateChannelModal}
        onCreate={handleCreateChannel}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={handleCloseCreateGroupModal}
      />
    </div>
  );
};

export default SidebarMenuWidget;