'use client';

import React, {
  useEffect 
} from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import ChatListItem from '@/entities/chat/ui/ChatListItem';
import { 
  useChatList 
} from '@/hooks/useChatList';
import { 
  Chat 
} from '@/entities/chat/model/chat.types';
import { 
  useLazyQuery, useMutation 
} from '@apollo/client';
import { 
  MessageSquare 
} from 'lucide-react';
import { 
  GLOBAL_SEARCH_QUERY 
} from '@/entities/chat/model/chat.queries';
import { 
  FIND_OR_CREATE_PRIVATE_CHAT 
} from '@/entities/chat/model/chat.mutations';
import { 
  UserDto 
} from '@/entities/user/model/user.types';
import UserListItem from '@/entities/user/ui/UserListItem';

interface ChatListWidgetProps {
  onSelectChat: (chatId: string, chatType: 'PRIVATE' | 'GROUP' | 'CHANNEL', chatName: string) => void;
  activeChatId: string | null;
  searchQuery: string;
}

// Component to display search results
const SearchResults: React.FC<any> = ({ searchData, onSelectChat, activeChatId, handleSelectUser }) => {
  const { t } = useTranslation();
  const users = searchData.globalSearch.users || [];
  const groups = searchData.globalSearch.chats.filter((c: Chat) => c.type === 'GROUP');
  const channels = searchData.globalSearch.chats.filter((c: Chat) => c.type === 'CHANNEL');

  const Section = ({ title, items, renderItem, noItemsMessage }: any) => (
    <>
      {items.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase text-text-secondary tracking-wider px-4 pt-4 pb-2">{title}</h3>
          {items.map(renderItem)}
        </div>
      )}
    </>
  );

  if (!users.length && !groups.length && !channels.length) {
    return <p className="p-4 text-text-secondary">{t('chatList.noResults')}</p>;
  }

  return (
    <div className="divide-y">
      <Section
        title={t('chatList.users')}
        items={users}
        renderItem={(user: UserDto) => <UserListItem key={user.id} user={user} onClick={() => handleSelectUser(user.id, user.name)} />}
      />
      <Section
        title={t('chatList.groups')}
        items={groups}
        renderItem={(chat: Chat) => <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} onClick={() => onSelectChat(chat.id, chat.type, chat.name)} />}
      />
      <Section
        title={t('chatList.channels')}
        items={channels}
        renderItem={(chat: Chat) => <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} onClick={() => onSelectChat(chat.id, chat.type, chat.name)} />}
      />
    </div>
  );
};

// Component to display the list of chats
const ChatListComponent: React.FC<any> = ({ chats, onSelectChat, activeChatId }) => {
  const { t } = useTranslation();

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <MessageSquare className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold">{t('chatList.noChatsTitle')}</h3>
        <p>{t('chatList.noChatsDescription')}</p>
      </div>
    );
  }

  return (
    <div>
      {chats.map((chat: Chat) => (
        <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} onClick={() => onSelectChat(chat.id, chat.type, chat.name)} />
      ))}
    </div>
  );
};

const ChatListWidget: React.FC<ChatListWidgetProps> = ({ onSelectChat, activeChatId, searchQuery }) => {
  const { chats, loading: chatsLoading, error: chatsError } = useChatList();
  const [
    executeSearch,
    { data: searchData, loading: searchLoading, error: searchError },
  ] = useLazyQuery(GLOBAL_SEARCH_QUERY);
  const [findOrCreatePrivateChat] = useMutation(FIND_OR_CREATE_PRIVATE_CHAT);
  const { t } = useTranslation();

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      executeSearch({ variables: { query: searchQuery } });
    }
  }, [searchQuery, executeSearch]);

  const filteredChats = chats.filter((chat: Chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = async (userId: string, userName: string) => {
    try {
      const { data } = await findOrCreatePrivateChat({
        variables: { otherUserId: userId },
      });
      if (data?.findOrCreatePrivateChat) {
        const chat = data.findOrCreatePrivateChat;
        onSelectChat(chat.id, chat.type, chat.name);
      }
    } catch (error) {
      console.error(t('chatList.findOrCreateError'), error);
    }
  };

  const renderContent = () => {
    if (chatsLoading || searchLoading) {
      // Skeleton loader
      return (
        <div className="p-2 space-y-2 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="w-12 h-12 bg-disabled rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-disabled rounded w-3/4"></div>
                  <div className="h-3 bg-disabled rounded w-1/2"></div>
                </div>
            </div>
          ))}
        </div>
      );
    }

    if (chatsError) return <p className="p-4 text-danger">{t('chatList.loadError')}</p>;
    if (searchError) return <p className="p-4 text-danger">{t('chatList.searchError')}</p>;

    if (searchData && searchQuery.trim() !== '') {
      return <SearchResults searchData={searchData} onSelectChat={onSelectChat} activeChatId={activeChatId} handleSelectUser={handleSelectUser} />;
    }

    return <ChatListComponent chats={filteredChats} onSelectChat={onSelectChat} activeChatId={activeChatId} />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatListWidget;