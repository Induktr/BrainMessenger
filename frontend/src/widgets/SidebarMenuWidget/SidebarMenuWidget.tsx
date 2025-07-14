'use client';
 
// frontend/src/ui/SidebarMenu.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/app/providers/ThemeProvider';
import Button from '@/shared/ui/Button/Button';
import CreateChannelModal from '@/features/create-chat/ui/CreateChannelModal';
import CreateGroupModal from '@/features/create-chat/ui/CreateGroupModal';
import Spinner from '@/shared/ui/Spinner/Spinner'; // Import LazyLoading
import { ICONS } from '@/shared/assets/Icons/icons'; // Keep import for now, might remove later
import Image from 'next/image';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext'; // Import useAuth hook
import { generateAvatarData } from '@/entities/user/model/user-generate-avatar'; // Import avatar utility
import AllNotificationsModal from '@/features/manage-notifications/ui/AllNotificationsModal'; // Import AllNotificationsModal
import { useNotification } from '@/app/providers/NotificationProvider/NotificationContext'; // Import useNotification hook
import { Notification } from '@/features/manage-notifications/model/notification.types'; // Import Notification type
import Support from '@/features/manage-settings/ui/Support';
import Settings from '@/features/manage-settings/ui/Settings';
 
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
      <div className="sidebar-menu sidebar-menu-container">
        <div className="sidebar-menu-content sidebar-menu-content-wrapper">
          <div className="sidebar-user-profile sidebar-user-profile-section">
            <Spinner className="sidebar-avatar" />
            <div className="sidebar-user-info">
              <Spinner className="spinner-text-line sidebar-loading-name" /> {/* Placeholder for name */}
              <Spinner className="spinner-text-line sidebar-loading-email" /> {/* Placeholder for email */}
            </div>
          </div>
          <div className="sidebar-options-list sidebar-options-list-wrapper">
            <Spinner className="spinner-block sidebar-option-loading" />
            <Spinner className="spinner-block sidebar-option-loading" />
            <Spinner className="spinner-block sidebar-option-loading" />
          </div>
        </div>
      </div>
    );
  }
 
  // Optional: Handle case where user is not logged in (e.g., redirect to login)
  if (!user) {
    // This component might only be rendered when user is logged in,
    // but it's good practice to consider this case.
    // For now, we'll render with null user data, which will show placeholders.
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
    <div className="sidebar-menu sidebar-menu-container">
      {/* Sidebar for Settings Options */}
      <div className="sidebar-menu-content sidebar-menu-content-wrapper">
        {/* User Profile Section Placeholder */}
        <div className="sidebar-user-profile sidebar-user-profile-section">
          {/* Avatar Placeholder */}
          {/* Replace placeholder div with generated avatar */}
          <div
            className="sidebar-avatar-placeholder sidebar-avatar"
            style={{ backgroundColor: avatarData.color }}
          >
            {user?.avatarUrl ? ( // Use optional chaining for user
              // Display real avatar if available
              <img src={user.avatarUrl} alt="User Avatar" className="sidebar-avatar-image" />
            ) : (
              // Display generated placeholder if no avatar URL
              <span className="sidebar-avatar-letter">{avatarData.letter}</span>
            )}
          </div>
          <div className="sidebar-user-info">
            <h2>{user?.name || t('sidebar.guest')}</h2> {/* Display user's name or 'Guest' */}
            <p className="sidebar-username sidebar-username-text">{user?.email || t('sidebar.na')}</p> {/* Display user's email or 'N/A' */}
          </div>
        </div>
        {/* Settings Options List */}
        <div className="sidebar-options-list sidebar-options-list-wrapper">
          <Button className="sidebar-option-button" onClick={onOpenSettings} ><span>{ICONS.settings && <Image src={ICONS.settings} alt={t('sidebar.settings')} className="icon" width={24} height={24} />} {t('sidebar.settings')}</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={handleOpenCreateChannelModal} ><span>{ICONS.channel && <Image src={ICONS.channel} alt={t('sidebar.createChannel')} className="icon" width={24} height={24} />} {t('sidebar.createChannel')}</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={handleOpenCreateGroupModal} ><span>{ICONS.group && <Image src={ICONS.group} alt={t('sidebar.createGroup')} className="icon" width={24} height={24} />} {t('sidebar.createGroup')}</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={toggleTheme} ><span>{ICONS.night && <Image src={ICONS.night} alt={t('sidebar.nightMode')} className="icon" width={24} height={24} />} {theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.nightMode')}</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={() => setIsAllNotificationsModalOpen(true)} ><span>{ICONS.bell && <Image src={ICONS.bell} alt={t('sidebar.allNotifications')} className="icon" width={24} height={24} />} {t('sidebar.allNotifications')}</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={() => setIsSupportModalOpen(true)} ><span>{ICONS.support && <Image src={ICONS.support} alt={t('sidebar.support')} className="icon" width={24} height={24} />} {t('sidebar.support')}</span></Button> {/* Using ListItem */}
          {/* ... more settings options */}
        </div>
      </div>

      {isSupportModalOpen && (
        <Support
          onBack={handleBackSupportModal}
          onClose={handleCloseSupportModal}
          isOpen={isSupportModalOpen}
        />
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