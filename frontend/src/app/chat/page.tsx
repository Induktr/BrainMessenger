'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext';
import { GlobalAudioProvider } from '@/app/providers/GlobalAudioProvider/GlobalAudioContext';
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
import { useSubscription } from '@apollo/client'; // Import useSubscription
import { useNotification } from '@/app/providers/NotificationProvider/NotificationContext'; // Import useNotification
import NotificationDropdown from '@/features/manage-notifications/ui/NotificationDropdown'; // Import NotificationDropdown
import { Notification } from '@/features/manage-notifications/model/notification.types'; // Import Notification type
import { NEW_MESSAGE_SUBSCRIPTION } from '@/entities/message/model/message.subscriptions'; // Import existing subscription

const ChatPage = () => {
  const { t } = useTranslation();
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
  const [isNotificationDropdownVisible, setIsNotificationDropdownVisible] = useState(false); // State for dropdown visibility

  const { user: currentUser, queryLoading: authLoading, isInitializing } = useAuth();
  const router = useRouter();
  const { chats, refetch: refetchChats } = useChatList();
  const { handleDeleteChatHistory, handleDeleteUserAndChat } = useChatActions(selectedChatId);
  const { showNotification, notification, clearNotification } = useNotification(); // Use notification context

  // Subscribe to new messages
  const { data: subscriptionData, loading: subscriptionLoading, error: subscriptionError } = useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId, // Skip subscription if no chat is selected
    onData: ({ data }) => {
      console.log('[ChatPage] New message subscription data:', data);
      if (data?.data?.newMessage && data.data.newMessage.sender.id !== currentUser?.id) {
        // Only show notification if the message is not from the current user
        showNotification(data.data.newMessage);
        setIsNotificationDropdownVisible(true);
      }
    },
  });

  useEffect(() => {
    console.log('[ChatPage] Subscription loading state:', subscriptionLoading);
    console.log('[ChatPage] Subscription error state:', subscriptionError);
  }, [subscriptionLoading, subscriptionError]);

  useEffect(() => {
    if (notification) {
      setIsNotificationDropdownVisible(true);
    }
  }, [notification]);



  const handleCloseNotificationDropdown = () => {
    setIsNotificationDropdownVisible(false);
    clearNotification();
  };

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
              {ICONS.burgerMenu && <Image src={ICONS.burgerMenu} alt={t('chat_page.burger_menu_alt')} className="icon" width={24} height={24} />}
            </Button>
            <SearchWidget searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder={t('chat_page.search_placeholder')} />
          </div>
          <ChatListWidget onSelectChat={handleSelectChat} activeChatId={selectedChatId} searchQuery={searchQuery} />
        </div>

        <div className="chat-main-content chat-area-container">
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
              onBackButtonClick={() => setSelectedChatId(null)} // Pass the back button handler
            />
          ) : (
            !selectedChatId && <div className="chat-welcome-message">{t('chat_page.welcome_message')}</div>
          )}
        </div>

        {openSettings && <Settings isOpen={openSettings} onClose={handleCloseSettings} />}

        {showChatOptionsContextMenu && (
          <ContextMenu
            x={contextMenuX}
            y={contextMenuY}
            options={[
              { label: t('chat_page.context_menu_delete_history'), onClick: () => { setShowDeleteChatHistoryConfirmModal(true); setShowChatOptionsContextMenu(false); } },
              { label: t('chat_page.context_menu_delete_user_chat'), onClick: () => { setShowDeleteUserConfirmModal(true); setShowChatOptionsContextMenu(false); } },
            ]}
            onClose={() => setShowChatOptionsContextMenu(false)}
          />
        )}

        {showDeleteChatHistoryConfirmModal && (
          <ConfirmationModal
            isOpen={showDeleteChatHistoryConfirmModal}
            onClose={() => setShowDeleteChatHistoryConfirmModal(false)}
            onConfirm={onConfirmDeleteHistory}
            title={t('chat_page.confirm_delete_history_title')}
            message={t('chat_page.confirm_delete_history_message')}
            confirmText={t('chat_page.confirm_delete_history_button')}
            cancelText={t('chat_page.cancel_button')}
          />
        )}

        {showDeleteUserConfirmModal && (
          <ConfirmationModal
            isOpen={showDeleteUserConfirmModal}
            onClose={() => setShowDeleteUserConfirmModal(false)}
            onConfirm={onConfirmDeleteUserAndChat}
            title={t('chat_page.confirm_delete_user_chat_title')}
            message={t('chat_page.confirm_delete_user_chat_message')}
            confirmText={t('chat_page.confirm_delete_user_chat_button')}
            cancelText={t('chat_page.cancel_button')}
          />
        )}
      </div>

      {/* Notification Dropdown */}
      <NotificationDropdown
        message={notification}
        isVisible={isNotificationDropdownVisible}
        onClose={handleCloseNotificationDropdown}
      />
    </GlobalAudioProvider>
  );
};

export default ChatPage;
