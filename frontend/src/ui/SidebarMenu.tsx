'use client';
 
// frontend/src/ui/SidebarMenu.tsx
import React, { useState } from 'react';
import Button from '@/components/Button';
import CreateChannelModal from '@/components/CreateChannelModal';
import CreateGroupModal from '@/components/CreateGroupModal';
import LazyLoading from '@/components/LazyLoading'; // Import LazyLoading
import { icons } from '../app/lib/constants'; // Keep import for now, might remove later
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext'; // Import useAuth hook
import { generateAvatarData } from '@/utils/avatarUtils'; // Import avatar utility
 
interface SidebarMenuProps {
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleNotification: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ onOpenSettings, onToggleTheme, onToggleNotification }) => {
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
 
  const { user, queryLoading } = useAuth(); // Get user and queryLoading state from context
 
  // Generate avatar data
  const avatarData = generateAvatarData(user?.name);
 
  // Optional: Show loading state or placeholder if user data is queryLoading
  if (queryLoading) {
    return (
      <div className="sidebar-menu sidebar-menu-container">
        <div className="sidebar-menu-content sidebar-menu-content-wrapper">
          <div className="sidebar-user-profile sidebar-user-profile-section">
            <LazyLoading className="sidebar-avatar" />
            <div className="sidebar-user-info">
              <LazyLoading className="lazy-loading-text-line sidebar-loading-name" /> {/* Placeholder for name */}
              <LazyLoading className="lazy-loading-text-line sidebar-loading-email" /> {/* Placeholder for email */}
            </div>
          </div>
          <div className="sidebar-options-list sidebar-options-list-wrapper">
            <LazyLoading className="lazy-loading-block sidebar-option-loading" />
            <LazyLoading className="lazy-loading-block sidebar-option-loading" />
            <LazyLoading className="lazy-loading-block sidebar-option-loading" />
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
  
    const handleCreateGroup = (groupName: string, participants: string[]) => {
      // Placeholder for group creation logic
      // Placeholder for group creation logic
      // console.log('Creating group:', groupName, participants); // Removed console.log
      handleCloseCreateGroupModal();
      // In a real application, you would dispatch an action or call an API here
      // After successful creation, you might want to update the chat list
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
            <h2>{user?.name || 'Guest'}</h2> {/* Display user's name or 'Guest' */}
            <p className="sidebar-username sidebar-username-text">{user?.email || 'N/A'}</p> {/* Display user's email or 'N/A' */}
          </div>
        </div>
        {/* Settings Options List */}
        <div className="sidebar-options-list sidebar-options-list-wrapper">
          <Button className="sidebar-option-button" onClick={onOpenSettings} ><span>{icons.settings && <Image src={icons.settings} alt="Settings" className="icon" width={24} height={24} />}Settings</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={handleOpenCreateChannelModal} ><span>{icons.channel && <Image src={icons.channel} alt="Fresh channel" className="icon" width={24} height={24} />}Fresh channel</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={handleOpenCreateGroupModal} ><span>{icons.group && <Image src={icons.group} alt="Fresh group" className="icon" width={24} height={24} />}Fresh group</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={onToggleTheme} ><span>{icons.night && <Image src={icons.night} alt="Night Mode" className="icon" width={24} height={24} />}Night Mode</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={onToggleNotification} ><span>{icons.bell && <Image src={icons.bell} alt="Notifications" className="icon" width={24} height={24} />}Notifications</span></Button> {/* Using ListItem */}
          <Button className="sidebar-option-button" onClick={onOpenSettings} ><span>{icons.support && <Image src={icons.support} alt="Support" className="icon" width={24} height={24} />}Support</span></Button> {/* Using ListItem */}
          {/* ... more settings options */}
        </div>
      </div>

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
        onCreate={handleCreateGroup}
      />
    </div>
  );
};

export default SidebarMenu;