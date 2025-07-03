'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/features/user-auth/ui/AuthContext';
import { GlobalAudioProvider } from '@/features/manage-audio-player/ui/GlobalAudioContext';
import ChatListWidget from '@/widgets/ChatListWidget/ChatListWidget';
import ChatWindowWidget from '@/widgets/ChatWindowWidget/ChatWindowWidget';
import Spinner from '@/shared/ui/Spinner/Spinner';
import SidebarMenuWidget from '@/widgets/SidebarMenuWidget/SidebarMenuWidget';
import Settings from '@/features/manage-settings/ui/Settings';
import Button from '@/shared/ui/Button/Button';
import { ICONS } from '@/shared/assets/Icons/icons';
import { useChatList } from '@/hooks/useChatList';
import { Chat } from '@/entities/chat/model/chat.types';
import { UserDto } from '@/entities/user/model/user.types';
import { useChatActions } from '@/features/manage-chat/useChatActions';
import ContextMenu from '@/shared/ui/ContextMenu/ContextMenu';
import ConfirmationModal from '@/shared/ui/ConfirmationModal/ConfirmationModal';
import SearchWidget from '@/widgets/SearchWidget/SearchWidget';

const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<'PRIVATE' | 'GROUP' | 'CHANNEL' | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [showChatOptionsContextMenu, setShowChatOptionsContextMenu] = useState(false);
  const [contextMenuX, setContextMenuX] = useState(0);
  const [contextMenuY, setContextMenuY] = useState(0);
  const [showDeleteChatHistoryConfirmModal, setShowDeleteChatHistoryConfirmModal] = useState(false);
  const [showDeleteUserConfirmModal, setShowDeleteUserConfirmModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user: currentUser, queryLoading: authLoading, isInitializing } = useAuth();
  const router = useRouter();
  const { chats, refetch: refetchChats } = useChatList();
  const { handleDeleteChatHistory, handleDeleteUserAndChat } = useChatActions(selectedChatId);

  if (authLoading || isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a' }}>
        <Spinner className="spinner-logo-container"/>
      </div>
    );
  }

  if (!currentUser) {
    router.push('/');
    return null;
  }

  const handleSelectChat = (chatId: string, chatType: 'PRIVATE' | 'GROUP' | 'CHANNEL', chatName: string) => {
    setSelectedChatId(chatId);
    setSelectedChatType(chatType);
    setSelectedChatName(chatName);
  };

  const handleOpenMenu = () => setOpenMenu(!openMenu);
  const handleOpenSettings = () => { setOpenSettings(true); setOpenMenu(false); };
  const handleCloseSettings = () => setOpenSettings(false);

  const handleOpenContextMenu = (event: React.MouseEvent) => {
    setContextMenuX(event.clientX);
    setContextMenuY(event.clientY);
    setShowChatOptionsContextMenu(true);
  };

  const onConfirmDeleteHistory = async () => {
    await handleDeleteChatHistory();
    setShowDeleteChatHistoryConfirmModal(false);
  };

  const onConfirmDeleteUserAndChat = async () => {
    await handleDeleteUserAndChat();
    setShowDeleteUserConfirmModal(false);
    setSelectedChatId(null);
    refetchChats();
  };

  // Placeholders for features to be implemented
  const handleSendMessageOrUpdate = async (content: string, files: File[]) => {};
  const handleSubscribe = async () => {};
  const handleUnsubscribe = async () => {};
  const handleToggleTheme = () => {};
  const handleToggleNotification = () => {};

  const selectedChat = chats.find((chat: Chat) => chat.id === selectedChatId);

  return (
    <GlobalAudioProvider>
      <div className={`chat-container ${selectedChatId ? 'chat-selected' : ''}`}>
        {openMenu && (
          <div className="sidebar-overlay" onClick={() => setOpenMenu(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <SidebarMenuWidget onOpenSettings={handleOpenSettings} onToggleTheme={handleToggleTheme} onToggleNotification={handleToggleNotification} />
            </div>
          </div>
        )}

        <div className="chat-sidebar">
          <div className="sidebar-header">
            <Button className="burger-icon" onClick={handleOpenMenu}>
              {ICONS.burgerMenu && <Image src={ICONS.burgerMenu} alt="Burger Menu" className="icon" width={24} height={24} />}
            </Button>
            <SearchWidget searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search" />
          </div>
          <ChatListWidget onSelectChat={handleSelectChat} activeChatId={selectedChatId} searchQuery={searchQuery} />
        </div>

        <div className="chat-main-content chat-area-container">
          {selectedChatId && (
            <button className="back-button" onClick={() => setSelectedChatId(null)}>
              {ICONS.arrowBack && <Image src={ICONS.arrowBack} alt="Back" className="icon" width={24} height={24} />}
            </button>
          )}
          {selectedChat && selectedChatType && selectedChatName ? (
            <ChatWindowWidget
              chatId={selectedChatId!}
              isChannel={selectedChatType === 'CHANNEL'}
              isChannelOwner={selectedChat.channel?.owner.id === currentUser?.id}
              isSubscribedToChannel={selectedChat.participants.some((p: UserDto) => p.id === currentUser?.id)}
              onSubscribe={handleSubscribe}
              onUnsubscribe={handleUnsubscribe}
              onSendMessageOrUpdate={handleSendMessageOrUpdate}
              onOpenContextMenu={handleOpenContextMenu}
            />
          ) : (
            !selectedChatId && <div className="chat-welcome-message">Communication starts here, start with us!</div>
          )}
        </div>

        {openSettings && <Settings isOpen={openSettings} onClose={handleCloseSettings} />}

        {showChatOptionsContextMenu && (
          <ContextMenu
            x={contextMenuX}
            y={contextMenuY}
            options={[
              { label: 'Delete chat history', onClick: () => { setShowDeleteChatHistoryConfirmModal(true); setShowChatOptionsContextMenu(false); } },
              { label: 'Delete user and chat', onClick: () => { setShowDeleteUserConfirmModal(true); setShowChatOptionsContextMenu(false); } },
            ]}
            onClose={() => setShowChatOptionsContextMenu(false)}
          />
        )}

        {showDeleteChatHistoryConfirmModal && (
          <ConfirmationModal
            isOpen={showDeleteChatHistoryConfirmModal}
            onClose={() => setShowDeleteChatHistoryConfirmModal(false)}
            onConfirm={onConfirmDeleteHistory}
            title="Confirm Delete Chat History"
            message="Are you sure you want to delete the chat history for yourself? This action cannot be undone."
            confirmText="Delete History"
            cancelText="Cancel"
          />
        )}

        {showDeleteUserConfirmModal && (
          <ConfirmationModal
            isOpen={showDeleteUserConfirmModal}
            onClose={() => setShowDeleteUserConfirmModal(false)}
            onConfirm={onConfirmDeleteUserAndChat}
            title="Confirm Delete User and Chat"
            message="Are you sure you want to delete this user and all chat history for both participants? This action cannot be undone."
            confirmText="Delete User & Chat"
            cancelText="Cancel"
          />
        )}
      </div>
    </GlobalAudioProvider>
  );
};

export default ChatPage;
